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
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", jobSchema);