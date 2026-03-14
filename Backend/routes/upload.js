const express = require("express")
const multer = require("multer")
const { uploadToCloudinary } = require("../services/cloudinaryService")
const generateQR = require("../services/qrService")
const jobs = require("../store/jobStore")

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/", upload.single("file"), async (req, res) => {

  try {

    const fileBuffer = req.file.buffer

    const fileUrl = await uploadToCloudinary(
      fileBuffer,
      req.file.originalname
    )

    const jobId = Date.now().toString()

    jobs[jobId] = fileUrl

    const printUrl = `https://print-along-api.onrender.com/print/${jobId}`

    const qrCode = await generateQR(printUrl)

    res.json({
      job_id: jobId,
      qr_code_url: qrCode
    })

  } catch (error) {

    console.error(error)
    res.status(500).json({ error: "Upload failed" })

  }

})

module.exports = router