const express = require("express")
const multer = require("multer")

const { uploadToCloudinary } = require("../services/cloudinaryService")

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post("/", upload.single("file"), async (req, res) => {

  try {

    const fileBuffer = req.file.buffer

    const url = await uploadToCloudinary(fileBuffer)

    res.json({ url })

  } catch (error) {

    console.error(error)
    res.status(500).json({ error: "Upload failed" })

  }

})

module.exports = router