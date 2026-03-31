const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  job_id: {
    type: String,
    required: true,
    unique: true
  },
  file_url: {
    type: String,
    required: true
  },
  pages: Number,
  total_amount: Number,
  status: {
    type: String,
    default: "pending" // ✅ ADDED
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", jobSchema);