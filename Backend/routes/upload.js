const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");

const { uploadFile, convertToPDF } = require("../services/googleDriveService");
const Job = require("../models/Job");
const generateQR = require("../services/qrService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📂 File received:", file.originalname);

    // ✅ STEP 1: Upload original file
    const fileId = await uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // ✅ STEP 2: Convert to PDF
    const pdfResult = await convertToPDF(fileId);

    // ✅ STEP 3: Count pages
    const data = await pdf(pdfResult.buffer);

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
      file_url: pdfResult.url,
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
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: "Upload/Conversion failed" });
  }
});

module.exports = router;