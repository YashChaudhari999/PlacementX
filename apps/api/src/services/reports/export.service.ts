import * as xlsx from 'xlsx';
import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

/**
 * Generate an Excel buffer from JSON data.
 */
export const generateExcel = async (data: any[], reportName: string): Promise<Buffer> => {
  return new Promise((resolve) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, reportName || 'Report');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    resolve(buffer);
  });
};

/**
 * Generate a CSV buffer from JSON data.
 */
export const generateCSV = async (data: any[]): Promise<Buffer> => {
  return new Promise((resolve) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const csvString = xlsx.utils.sheet_to_csv(worksheet);
    resolve(Buffer.from(csvString, 'utf8'));
  });
};

/**
 * Generate a PDF buffer from JSON data (simple table layout).
 */
export const generatePDF = async (data: any[], reportName: string, filters: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape', bufferPages: true });
    const buffers: Buffer[] = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('NMIMS University', { align: 'center' });
    doc.fontSize(14).text('Training & Placement Office', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(reportName, { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    if (filters && Object.keys(filters).length > 0) {
      doc.moveDown();
      doc.fontSize(10).text(`Filters applied: ${JSON.stringify(filters)}`);
    }

    doc.moveDown(2);

    if (data.length === 0) {
      doc.text('No data available for this report.');
      doc.end();
      return;
    }

    // A very simple table layout
    const headers = Object.keys(data[0]);
    let y = doc.y;
    
    // Config column widths (naive)
    const colWidth = (doc.page.width - 60) / headers.length;

    // Draw headers
    doc.font('Helvetica-Bold').fontSize(9);
    headers.forEach((header, i) => {
      doc.text(header.substring(0, 20), 30 + (i * colWidth), y, { width: colWidth - 5 });
    });
    
    y += 15;
    doc.moveTo(30, y).lineTo(doc.page.width - 30, y).stroke();
    y += 5;

    // Draw rows
    doc.font('Helvetica').fontSize(8);
    data.forEach((row, rowIndex) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 30;
      }
      headers.forEach((header, i) => {
        const val = String(row[header] || '');
        doc.text(val.substring(0, 30), 30 + (i * colWidth), y, { width: colWidth - 5 });
      });
      y += 15;
      
      // small line
      doc.moveTo(30, y-2).lineTo(doc.page.width - 30, y-2).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
    });

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Confidential — Training & Placement Office | Page ${i + 1} of ${pages.count}`,
        30,
        doc.page.height - 30,
        { align: 'center' }
      );
    }

    doc.end();
  });
};
