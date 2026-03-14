const express = require("express")
const axios = require("axios")
const jobs = require("../store/jobStore")

const router = express.Router()

router.get("/:job_id", async (req, res) => {

  const jobId = req.params.job_id
  const fileUrl = jobs[jobId]

  if (!fileUrl) {
    return res.status(404).send("Job not found")
  }

  const response = await axios.get(fileUrl, { responseType: "stream" })

  res.setHeader("Content-Disposition", "attachment")
  res.setHeader("Content-Type", response.headers["content-type"])

  response.data.pipe(res)

})

module.exports = router