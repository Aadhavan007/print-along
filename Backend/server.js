const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// routes
const uploadRoute = require("./routes/upload");
const printRoute = require("./routes/print");

const app = express();

// 🧠 CONNECT DB
connectDB();

// 🛡️ middleware
app.use(cors());
app.use(express.json());

// 🚀 routes
app.use("/api", uploadRoute);
app.use("/print", printRoute);

// 🧪 test route
app.get("/", (req, res) => {
  res.send("PrintAlong API running 🚀");
});

// ❌ global error handler (optional but good)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// 🌐 port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});