import FormData from "form-data";
import fetch from "node-fetch";
import multiparty from "multiparty";

export default async function handler(req, res) {
    // ===== CORS FIX =====
    res.setHeader('Access-Control-Allow-Origin', 'https://akhmalfirdaus.github.io'); //'*'); // allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST allowed' });
    }

    // ===== Rest of your original upload code =====
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ message: "Error parsing form" });

        const file = files.file[0];
        const uploader = fields.uploader ? fields.uploader[0] : "Anonymous";

        const formData = new FormData();
        formData.append("chat_id", "+XF899XNhZjw0NWE1"); // Telegram channel username or ID
        formData.append("document", file, file.originalFilename);
        formData.append("caption", `Uploaded by: ${uploader}`);

        const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendDocument`, {
            method: "POST",
            body: formData
        });

        const data = await telegramRes.json();
        if (data.ok) {
            res.status(200).json({ message: "File sent to Telegram!" });
        } else {
            res.status(500).json({ message: "Failed to send file to Telegram", error: data });
        }
    });
}
