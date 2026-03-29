const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");

const Job = require("../models/Job");
const { uploadToCloudinary } = require("../services/cloudinaryService");
const generateQR = require("../services/qrService"); // ✅ added

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   📄 FILE UPLOAD ROUTE
========================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Only PDF
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

    // 💾 Save job
    await Job.create({
      job_id: jobId,
      file_url: fileUrl,
      pages,
      total_amount: totalAmount
    });

    // ✅ Return ONLY data (no QR yet)
    res.json({
      jobId,
      pages,
      pricePerPage,
      totalAmount,
      fileUrl
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});


/* =========================
   📱 QR GENERATION (AFTER PAYMENT)
========================= */
router.post("/generate-qr", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    const qrCode = await generateQR(url);

    res.json({ qrCode });

  } catch (err) {
    console.error("QR ERROR:", err);
    res.status(500).json({ error: "QR generation failed" });
  }
});


module.exports = router;