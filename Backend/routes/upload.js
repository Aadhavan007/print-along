const express = require("express")
const router = express.Router()
const multer = require("multer")
const { uploadToCloudinary } = require("../services/cloudinaryService")
const { generateQR } = require("../services/qrService")
const jobStore = require("../store/jobStore")
const { v4: uuidv4 } = require("uuid")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post("/", upload.single("file"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" })
        }

        const jobId = uuidv4()

        const fileUrl = await uploadToCloudinary(req.file.buffer)

        jobStore[jobId] = fileUrl

        const qr = await generateQR(
            `https://print-along-api.onrender.com/print/${jobId}`
        )

        res.json({
            job_id: jobId,
            qr_code_url: qr
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            error: "Upload failed"
        })

    }

})

module.exports = router