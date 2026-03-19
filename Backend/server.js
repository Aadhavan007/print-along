const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
const uploadRoute = require("./routes/upload");
app.use("/api", uploadRoute);

// test route
app.get("/", (req, res) => {
  res.send("PrintAlong API running");
});

// port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});