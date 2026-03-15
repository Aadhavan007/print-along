const express = require("express")
const jobs = require("../store/jobStore")

const router = express.Router()

router.get("/:job_id", (req, res) => {

  const jobId = req.params.job_id
  const fileUrl = jobs[jobId]

  if (!fileUrl) {
    return res.status(404).send("Job not found")
  }

  const downloadUrl = fileUrl.replace(
    "/upload/",
    "/upload/fl_attachment/"
  )

  res.redirect(downloadUrl)

})

module.exports = router