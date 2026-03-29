const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

router.get("/:job_id", async (req, res) => {
  try {
    const jobId = req.params.job_id;

    const job = await Job.findOne({ job_id: jobId });

    if (!job) {
      return res.status(404).send("Job not found");
    }

    // ✅ Direct redirect to file
    return res.redirect(`${job.file_url}?fl_attachment=true`);

  } catch (error) {
    console.error("PRINT ERROR:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;