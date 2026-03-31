const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

// ✅ Fake payment
router.post("/complete", async (req, res) => {
  try {
    const { jobId } = req.body;

    await Job.findOneAndUpdate(
      { job_id: jobId },
      { status: "paid" }
    );

    res.json({ message: "Job marked as paid" });

  } catch (err) {
    console.error("JOB ERROR:", err);
    res.status(500).json({ error: "Failed" });
  }
});

module.exports = router;