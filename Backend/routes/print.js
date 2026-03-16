const express = require("express")
const Job = require("../models/Job")

const router = express.Router()

router.get("/:job_id", async (req, res) => {

  try {

    const jobId = req.params.job_id

    const job = await Job.findOne({ job_id: jobId })

    if (!job) {
      return res.status(404).send("Job not found")
    }

    const fileUrl = job.file_url

    // Force Cloudinary to download instead of opening
    const downloadUrl = fileUrl.replace("/upload/", "/upload/fl_attachment/")

    res.redirect(downloadUrl)

  } catch (error) {

    console.error(error)
    res.status(500).send("Server error")

  }

})

module.exports = router