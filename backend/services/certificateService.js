const PDFDocument = require('pdfkit');
const path = require('path');
const crypto = require('crypto');

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'studyhub_logo.png');

function generateCertificateId() {
  return 'SH-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

function generateCertificate({ studentName, courseTitle, completionDate, certificateId }) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
  });

  const width = doc.page.width;
  const height = doc.page.height;

  // Border
  doc
    .rect(20, 20, width - 40, height - 40)
    .lineWidth(3)
    .strokeColor('#4f46e5')
    .stroke();

  doc
    .rect(28, 28, width - 56, height - 56)
    .lineWidth(1)
    .strokeColor('#c7d2fe')
    .stroke();

  // Logo
  try {
    doc.image(LOGO_PATH, width / 2 - 40, 45, { width: 80 });
  } catch (_) {
    // logo missing — skip
  }

  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(36)
    .fillColor('#4f46e5')
    .text('Certificate of Completion', 0, 140, { align: 'center', width });

  // Decorative line
  doc
    .moveTo(width / 2 - 120, 190)
    .lineTo(width / 2 + 120, 190)
    .lineWidth(2)
    .strokeColor('#a5b4fc')
    .stroke();

  // "This certifies that"
  doc
    .font('Helvetica')
    .fontSize(14)
    .fillColor('#6b7280')
    .text('This is to certify that', 0, 210, { align: 'center', width });

  // Student name
  doc
    .font('Helvetica-Bold')
    .fontSize(28)
    .fillColor('#1f2937')
    .text(studentName, 0, 240, { align: 'center', width });

  // "has successfully completed"
  doc
    .font('Helvetica')
    .fontSize(14)
    .fillColor('#6b7280')
    .text('has successfully completed the course', 0, 285, { align: 'center', width });

  // Course title
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#4f46e5')
    .text(courseTitle, 0, 310, { align: 'center', width });

  // Date
  const dateStr = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#6b7280')
    .text(`Completed on ${dateStr}`, 0, 355, { align: 'center', width });

  // Certificate ID
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#9ca3af')
    .text(`Certificate ID: ${certificateId}`, 0, 385, { align: 'center', width });

  // Footer
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#9ca3af')
    .text('StudyHub — Learn without limits', 0, height - 60, { align: 'center', width });

  doc.end();
  return doc;
}

module.exports = { generateCertificate, generateCertificateId };
