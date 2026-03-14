const express = require("express")
const multer = require("multer")
const { v4: uuidv4 } = require("uuid")

const uploadFile = require("../services/cloudinaryService")
const generateQR = require("../services/qrService")
const jobs = require("../store/jobStore")

const router = express.Router()

const upload = multer({ dest: "uploads/" })

router.post("/", upload.single("file"), async (req, res) => {

  try {

    const filePath = req.file.path

    const fileUrl = await uploadFile(filePath)

    const jobId = uuidv4()

    jobs[jobId] = fileUrl

    const downloadLink = `https://print-along-api.onrender.com/print/${jobId}`

    const qr = await generateQR(downloadLink)

    res.json({
      job_id: jobId,
      qr_code: qr
    })

  } catch (error) {

    res.status(500).json({ error: "Upload failed" })

  }

})

module.exports = router