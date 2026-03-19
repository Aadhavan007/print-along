const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  job_id: String,
  pdfUrl: String,
  pages: Number,
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", jobSchema);