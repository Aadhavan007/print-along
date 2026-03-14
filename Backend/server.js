const express = require("express")
const cors = require("cors")

const uploadRoute = require("./routes/upload")
const printRoute = require("./routes/print")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/upload", uploadRoute)
app.use("/print", printRoute)

app.get("/", (req, res) => {
  res.send("PrintAlong API running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})