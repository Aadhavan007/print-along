const express = require("express");
const router = express.Router();

const Job = require("../models/Job");

router.get("/:job_id", async (req, res) => {
  try {
    const job = await Job.findOne({ job_id: req.params.job_id });

    if (!job) {
      return res.status(404).send("Job not found");
    }

    res.redirect(job.pdfUrl);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;