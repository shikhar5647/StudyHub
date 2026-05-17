// Quick test script — run: node testEmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  console.log('Testing with:', process.env.GMAIL_USER);
  console.log('App pass set?', Boolean(process.env.GMAIL_APP_PASS));

  try {
    await transporter.verify();
    console.log('✅ SMTP connection OK');

    const info = await transporter.sendMail({
      from: `"StudyHub Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,           // send to yourself
      subject: '🔧 StudyHub email test',
      text: 'If you see this, Nodemailer is working!',
    });

    console.log('✅ Email sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('535') || err.message.includes('Username and Password')) {
      console.error('\n👉 FIX: Your Gmail credentials are wrong.');
      console.error('   Make sure you are using a 16-character App Password (not your real Gmail password).');
      console.error('   Get one at: https://myaccount.google.com → Security → App Passwords');
    }
    if (err.message.includes('534') || err.message.includes('2-Step')) {
      console.error('\n👉 FIX: You need to enable 2-Factor Authentication on your Google account first,');
      console.error('   then generate an App Password.');
    }
  }
}

main();
