import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateEmbedding = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    
    // Call ML service for embedding
    const mlResponse = await fetch(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/ai/embeddings/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!mlResponse.ok) {
      throw new Error(`ML Service Error: ${mlResponse.statusText}`);
    }

    const data = await mlResponse.json();
    
    return res.status(200).json({
      success: true,
      data: data.embedding
    });
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate embedding',
      error: error.message
    });
  }
};

export const semanticMatch = async (req: Request, res: Response) => {
  try {
    const { studentId, driveId } = req.body;
    
    if (!studentId || !driveId) {
      return res.status(400).json({ success: false, message: 'Student ID and Drive ID required' });
    }

    // 1. Fetch student and drive to ensure they exist
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId }
    });
    
    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId }
    });

    if (!student || !drive) {
      return res.status(404).json({ success: false, message: 'Student or Drive not found' });
    }

    // 2. Perform raw SQL cosine similarity matching using pgvector <=>
    // Higher similarity (closer to 1.0) means lower distance (closer to 0.0)
    // Distance operator <=> computes cosine distance
    const result: any = await prisma.$queryRaw`
      SELECT 
        1 - (s."profileEmbedding" <=> d."jobEmbedding") as similarity_score
      FROM "StudentProfile" s
      CROSS JOIN "PlacementDrive" d
      WHERE s.id = ${studentId} AND d.id = ${driveId}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'Could not compute similarity. Embeddings may be missing.' });
    }

    const similarityScore = result[0].similarity_score;

    // Convert to percentage and threshold
    const matchPercentage = Math.round(similarityScore * 100);
    let matchLevel = 'LOW';
    if (matchPercentage >= 70) matchLevel = 'HIGH';
    else if (matchPercentage >= 40) matchLevel = 'MEDIUM';

    return res.status(200).json({
      success: true,
      data: {
        score: matchPercentage,
        level: matchLevel,
      }
    });

  } catch (error: any) {
    console.error('Error in semantic match:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform semantic match',
      error: error.message
    });
  }
};

export const parseResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);

    const mlResponse = await fetch(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/ai/resume/parse`, {
      method: 'POST',
      body: formData,
    });

    if (!mlResponse.ok) {
      throw new Error(`ML Service Error: ${mlResponse.statusText}`);
    }

    const data = await mlResponse.json();

    return res.status(200).json({
      success: true,
      data: data.data
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to parse resume',
      error: error.message
    });
  }
};
