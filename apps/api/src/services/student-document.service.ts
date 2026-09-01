import { supabaseAdmin } from '../config/supabase';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'student-documents';
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export const uploadAcademicDocument = async (
  studentId: string,
  documentType: string,
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  fileSize: number
) => {
  if (mimeType !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 15MB limit');
  }

  // Verify student exists
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error('Student profile not found');
  }

  // Generate unique file path
  const uuid = crypto.randomUUID();
  const filePath = `students/${studentId}/academic-documents/${uuid}.pdf`;

  // Check for existing document to replace
  const existingDoc = await prisma.studentDocument.findUnique({
    where: {
      studentId_documentType: {
        studentId,
        documentType,
      },
    },
  });

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // Update DB
  const document = await prisma.studentDocument.upsert({
    where: {
      studentId_documentType: {
        studentId,
        documentType,
      },
    },
    update: {
      fileName: originalName,
      filePath: filePath,
      mimeType,
      fileSize,
    },
    create: {
      studentId,
      documentType,
      fileName: originalName,
      filePath: filePath,
      mimeType,
      fileSize,
    },
  });

  // Delete old file if it existed
  if (existingDoc && existingDoc.filePath !== filePath) {
    const { error: deleteError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([existingDoc.filePath]);
      
    if (deleteError) {
      console.error(`Failed to delete old document: ${deleteError.message}`);
      // Non-blocking error
    }
  }

  return document;
};

export const getAcademicDocuments = async (studentId: string) => {
  const documents = await prisma.studentDocument.findMany({
    where: {
      studentId,
    },
  });

  if (!documents || documents.length === 0) {
    return [];
  }

  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      // Generate signed URL (expires in 15 minutes)
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .createSignedUrl(doc.filePath, 60 * 15);

      if (error || !data) {
        return doc; // return without signed URL if it fails
      }

      return {
        ...doc,
        signedUrl: data.signedUrl,
      };
    })
  );

  return documentsWithUrls;
};

export const getAcademicDocumentForAdmin = async (studentId: string) => {
  return getAcademicDocuments(studentId);
};
