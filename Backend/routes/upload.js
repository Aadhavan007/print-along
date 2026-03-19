const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");

const { uploadFile, convertToPDF } = require("../services/googleDriveService");
const Job = require("../models/Job");
const generateQR = require("../services/qrService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ test route
router.get("/test", (req, res) => {
  res.send("API route working");
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 🔥 STEP 1: Upload to Google Drive
    const fileId = await uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // 🔥 STEP 2: Convert to PDF
    const pdfBuffer = await convertToPDF(fileId);

    // 🔥 STEP 3: Count pages
    const data = await pdf(pdfBuffer);

    // 💰 PRICE
    const pricePerPage = 2;
    const totalAmount = data.numpages * pricePerPage;

    // 🆔 JOB ID
    const jobId = Date.now().toString();

    // 🔗 PRINT URL
    const printUrl = `${req.protocol}://${req.get("host")}/print/${jobId}`;

    // 📱 QR CODE
    const qrCode = await generateQR(printUrl);

    // 🧠 SAVE TO DB
    await Job.create({
      job_id: jobId,
      file_url: "generated-from-google-drive",
      pages: data.numpages,
      total_amount: totalAmount
    });

    // 🚀 RESPONSE
    res.json({
      jobId,
      pages: data.numpages,
      pricePerPage,
      totalAmount,
      printUrl,
      qrCode
    });

  } catch (err) {
    console.error("FULL ERROR:", err.message);
    res.status(500).json({ error: "Upload/Conversion failed" });
  }
});

module.exports = router;