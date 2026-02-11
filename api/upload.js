// api/upload.js
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import multiparty from 'multiparty';

export default async function handler(req, res) {
  // === CORS headers ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST allowed' });

  // === Parse multipart form ===
  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Error parsing form', error: err.message });

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const uploader = fields.uploader?.[0] || 'Anonymous';

    try {
      // === Prepare Telegram FormData ===
      const formData = new FormData();
      formData.append('chat_id', '+XF899XNhZjw0NWE1'); // Replace with your channel username
      formData.append('document', fs.createReadStream(file.path), file.originalFilename);
      formData.append('caption', `Uploaded by: ${uploader}`);

      // === Send to Telegram ===
      const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData,
      });

      const data = await telegramRes.json();
      if (!data.ok) return res.status(500).json({ message: 'Failed to send file', error: data });

      return res.status(200).json({ message: 'File sent to Telegram!' });
    } catch (err) {
      return res.status(500).json({ message: 'Error sending to Telegram', error: err.message });
    }
  });
}
