import FormData from "form-data";
import fetch from "node-fetch";
import multiparty from "multiparty";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ message: "Error parsing form" });

        const file = files.file[0];
        const uploader = fields.uploader ? fields.uploader[0] : "Anonymous";

        const formData = new FormData();
        formData.append("chat_id", "@AlifFirdausAlbum2026_bot"); // Telegram channel username or ID
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
