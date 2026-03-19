const express = require("express");
const multer = require("multer");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const FormData = require("form-data");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const API_KEY = process.env.CLOUDCONVERT_API_KEY;

// ✅ MOVE IT HERE (TOP LEVEL)
router.get("/test", (req, res) => {
  res.send("API route working");
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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

    const form = new FormData();

    Object.entries(uploadTask.result.form.parameters).forEach(([k, v]) => {
      form.append(k, v);
    });

    form.append("file", file.buffer, file.originalname);

    await axios.post(uploadTask.result.form.url, form, {
      headers: form.getHeaders()
    });

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

    const pdfResponse = await axios.get(pdfUrl, {
      responseType: "arraybuffer"
    });

    const pdfBuffer = pdfResponse.data;

    const data = await pdfParse(pdfBuffer);

    res.json({
      pages: data.numpages,
      pdfUrl: pdfUrl
    });

} catch (err) {
  console.error("FULL ERROR:", err.response?.data || err.message);
  res.status(500).json({ error: "Upload/Conversion failed" });
}
});

module.exports = router;