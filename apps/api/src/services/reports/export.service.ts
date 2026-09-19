import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

/**
 * Generate an Excel buffer from JSON data.
 */
export const generateExcel = async (data: any[], reportName: string): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const safeSheetName = (reportName || 'Report').replace(/[\\/*?:[\]]/g, '_').slice(0, 31);
  const worksheet = workbook.addWorksheet(safeSheetName || 'Report');
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  worksheet.columns = headers.map((header) => ({ header, key: header, width: 20 }));
  worksheet.addRows(data);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

/**
 * Generate a CSV buffer from JSON data.
 */
export const generateCSV = async (data: any[]): Promise<Buffer> => {
  if (data.length === 0) return Buffer.from('', 'utf8');
  const headers = Object.keys(data[0]);
  const escape = (value: unknown) => {
    const text = value === null || value === undefined
      ? ''
      : typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = [headers.map(escape).join(',')];
  for (const row of data) rows.push(headers.map((header) => escape(row[header])).join(','));
  return Buffer.from(rows.join('\r\n'), 'utf8');
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
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, { align: 'center' });
    
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
