const express = require("express");
const multer = require("multer");
const axios = require("axios");
const pdf = require("pdf-parse");
const FormData = require("form-data");

const Job = require("../models/Job");
const generateQR = require("../services/qrService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const API_KEY = process.env.CLOUDCONVERT_API_KEY;

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

    // 🔥 STEP 1: Create CloudConvert job
    const job = await axios.post(
      "https://api.cloudconvert.com/v2/jobs",
      {
        tasks: {
          upload: { operation: "import/upload" },
          convert: {
            operation: "convert",
            input: "upload",
            output_format: "pdf"
          },
          export: {
            operation: "export/url",
            input: "convert"
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      }
    );

    const uploadTask = job.data.data.tasks.find(t => t.name === "upload");

    // 🔥 STEP 2: Upload file
    const form = new FormData();

    Object.entries(uploadTask.result.form.parameters).forEach(([k, v]) => {
      form.append(k, v);
    });

    form.append("file", file.buffer, file.originalname);

    await axios.post(uploadTask.result.form.url, form, {
      headers: form.getHeaders()
    });

    // 🔥 STEP 3: Wait for conversion
    let finishedJob;

    while (true) {
      const resJob = await axios.get(
        `https://api.cloudconvert.com/v2/jobs/${job.data.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`
          }
        }
      );

      finishedJob = resJob.data.data;

      if (finishedJob.status === "finished") break;
      if (finishedJob.status === "error") {
        throw new Error("Conversion failed");
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    const exportTask = finishedJob.tasks.find(t => t.name === "export");
    const pdfUrl = exportTask.result.files[0].url;

    // 🔥 STEP 4: Download PDF
    const pdfResponse = await axios.get(pdfUrl, {
      responseType: "arraybuffer"
    });

    const pdfBuffer = pdfResponse.data;

    // 🔥 STEP 5: Count pages
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

    // 🧠 SAVE TO DB (FIXED FIELD NAMES)
    await Job.create({
      job_id: jobId,
      file_url: pdfUrl,
      pages: data.numpages,
      total_amount: totalAmount
    });

    // 🚀 RESPONSE
    res.json({
      jobId,
      pages: data.numpages,
      pricePerPage,
      totalAmount,
      pdfUrl,
      printUrl,
      qrCode
    });

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Upload/Conversion failed" });
  }
});

module.exports = router;