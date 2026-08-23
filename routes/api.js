const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Contact form submission
router.post('/contact', contactLimiter, (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  // Sanitize inputs
  const sanitize = (str) => String(str || '').replace(/[<>]/g, '').trim().substring(0, 2000);
  const submission = {
    timestamp: new Date().toISOString(),
    name: sanitize(name),
    email: sanitize(email),
    phone: sanitize(phone),
    subject: sanitize(subject),
    message: sanitize(message)
  };

  // Log submission to file (with /tmp fallback for serverless)
  try {
    const logDir = path.join(process.cwd(), 'data', 'submissions');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path.join(logDir, 'contact-submissions.jsonl');
    fs.appendFileSync(logFile, JSON.stringify(submission) + '\n');
  } catch (fsErr) {
    try {
      const tmpLog = path.join('/tmp', 'contact-submissions.jsonl');
      fs.appendFileSync(tmpLog, JSON.stringify(submission) + '\n');
    } catch (_) {}
  }

  console.log('Contact form submission:', submission);

  // Optionally send email via SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL || 'info1@datahubusa.com',
        subject: `New Contact Form: ${submission.subject || 'No Subject'}`,
        text: `Name: ${submission.name}\nEmail: ${submission.email}\nPhone: ${submission.phone}\nSubject: ${submission.subject}\n\nMessage:\n${submission.message}`,
        replyTo: submission.email
      }).catch(err => console.error('Email send error:', err));
    } catch (err) {
      console.error('Email configuration error:', err);
    }
  }

  res.json({ success: true, message: 'Message received successfully.' });
});

module.exports = router;
