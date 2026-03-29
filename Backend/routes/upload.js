const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");

const Job = require("../models/Job");
const generateQR = require("../services/qrService");
const { uploadToCloudinary } = require("../services/cloudinaryService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Restrict to PDF only
    if (!file.mimetype.includes("pdf")) {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    console.log("📂 PDF received:", file.originalname);

    // 📄 Extract pages
    const data = await pdf(file.buffer);
    const pages = data.numpages;

    // ☁️ Upload to Cloudinary
    const fileUrl = await uploadToCloudinary(file.buffer, file.originalname);

    // 💰 Pricing
    const pricePerPage = 2;
    const totalAmount = pages * pricePerPage;

    // 🆔 Job ID
    const jobId = Date.now().toString();

    // 🔗 Print URL
    const printUrl = `${fileUrl}?fl_attachment=true`;
    // 📱 QR Code
    const qrCode = await generateQR(printUrl);

    // 💾 Save job
    await Job.create({
      job_id: jobId,
      file_url: fileUrl,
      pages,
      total_amount: totalAmount
    });

    res.json({
      jobId,
      pages,
      pricePerPage,
      totalAmount,
      printUrl,
      qrCode
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;