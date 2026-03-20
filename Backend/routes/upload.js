const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");

const Job = require("../models/Job");
const generateQR = require("../services/qrService");

// NEW SERVICES
const { uploadToCloudinary } = require("../services/cloudinaryService");
const { convertWithILove } = require("../services/iloveService");
const { convertWithCloudConvert } = require("../services/cloudConvertService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// 🔍 FILE TYPE DETECTOR
function getFileType(mimetype) {
  if (mimetype.includes("pdf")) return "pdf";
  if (mimetype.includes("presentation")) return "ppt";
  if (mimetype.includes("image")) return "image";
  if (mimetype.includes("word")) return "word";
  if (mimetype.includes("sheet") || mimetype.includes("excel")) return "excel";
  return "unknown";
}


router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📂 File received:", file.originalname);

    const fileType = getFileType(file.mimetype);

    let pages = 1;
    let pdfBuffer = null;

    // 🟢 PDF
    if (fileType === "pdf") {
      const data = await pdf(file.buffer);
      pages = data.numpages;
      pdfBuffer = file.buffer;
    }

    // 🟢 PPT (basic)
    else if (fileType === "ppt") {
      const content = file.buffer.toString("binary");
      const matches = content.match(/slide/g);
      pages = matches ? matches.length : 1;
    }

    // 🟢 IMAGE
    else if (fileType === "image") {
      pages = 1;
    }

    // 🔴 WORD → iLoveAPI
    else if (fileType === "word") {
      pdfBuffer = await convertWithILove(file);
      const data = await pdf(pdfBuffer);
      pages = data.numpages;
    }

    // 🔴 EXCEL → CloudConvert
    else if (fileType === "excel") {
      pdfBuffer = await convertWithCloudConvert(file);
      const data = await pdf(pdfBuffer);
      pages = data.numpages;
    }

    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // ☁️ Upload FINAL FILE (PDF or original) to Cloudinary
    const finalBuffer = pdfBuffer || file.buffer;
    const fileUrl = await uploadToCloudinary(finalBuffer, file.originalname);

    // 💰 PRICE
    const pricePerPage = 2;
    const totalAmount = pages * pricePerPage;

    // 🆔 JOB ID
    const jobId = Date.now().toString();

    // 🔗 PRINT URL
    const printUrl = `${req.protocol}://${req.get("host")}/print/${jobId}`;

    // 📱 QR
    const qrCode = await generateQR(printUrl);

    // 💾 SAVE
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
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;