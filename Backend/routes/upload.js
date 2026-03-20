const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const AdmZip = require("adm-zip");

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
    let finalFileName = file.originalname;

    // 🟢 PDF
    if (fileType === "pdf") {
      const data = await pdf(file.buffer);
      pages = data.numpages;
      pdfBuffer = file.buffer;
      finalFileName = file.originalname;
    }

    // 🟢 PPT (ACCURATE)
else if (fileType === "ppt") {
  try {
    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();

    const slideFiles = entries.filter(entry =>
      entry.entryName.startsWith("ppt/slides/slide")
    );

    pages = slideFiles.length || 1;
    finalFileName = file.originalname;

  } catch (err) {
    console.error("PPT parsing failed:", err.message);
    pages = 1; // fallback
  }
}

    // 🟢 IMAGE
    else if (fileType === "image") {
      pages = 1;
      finalFileName = file.originalname;
    }

    // 🔴 WORD → iLoveAPI
    else if (fileType === "word") {
      try {
        pdfBuffer = await convertWithILove(file);
        const data = await pdf(pdfBuffer);
        pages = data.numpages;
        finalFileName = file.originalname.replace(/\.\w+$/, ".pdf");
      } catch (err) {
        console.error("Word conversion failed:", err.message);
        return res.status(500).json({ error: "Word conversion failed" });
      }
    }

    // 🔴 EXCEL → CloudConvert
    else if (fileType === "excel") {
      try {
        pdfBuffer = await convertWithCloudConvert(file);
        const data = await pdf(pdfBuffer);
        pages = data.numpages;
        finalFileName = file.originalname.replace(/\.\w+$/, ".pdf");
      } catch (err) {
        console.error("Excel conversion failed:", err.message);
        return res.status(500).json({ error: "Excel conversion failed" });
      }
    }

    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // ☁️ Upload FINAL FILE
    const finalBuffer = pdfBuffer || file.buffer;

    const fileUrl = await uploadToCloudinary(finalBuffer, finalFileName);

    // 💰 PRICE
    const pricePerPage = 2;
    const totalAmount = pages * pricePerPage;

    // 🆔 JOB ID
    const jobId = Date.now().toString();

    // 🔗 ALWAYS HTTPS (IMPORTANT)
    const printUrl = `https://${req.get("host")}/print/${jobId}`;

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