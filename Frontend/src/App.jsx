import { useState } from "react"
import "./App.css"

function App() {
  const [file, setFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [copies, setCopies] = useState(1)
  const [loading, setLoading] = useState(false)

  const processFile = async (selectedFile) => {
    if (!selectedFile) return

    // ✅ Restrict to PDF
    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files are supported")
      return
    }

    setFile(selectedFile)
    setFileData(null)
    setLoading(true)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch(
        "https://print-along-api.onrender.com/api/upload",
        {
          method: "POST",
          body: formData
        }
      )

      const data = await res.json()
      setFileData(data)

    } catch (err) {
      console.error("Upload failed", err)
      alert("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0]
    processFile(selectedFile)
    e.target.value = null
  }

  return (
    <div className="app">

      <div className="card">

        <h1 className="title">PrintAlong</h1>
        <p className="subtitle">
          Upload your PDF and print instantly using QR
        </p>

        {/* Upload Box */}
        <div
          className="upload-box"
          onDrop={(e) => {
            e.preventDefault()
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile) processFile(droppedFile)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            id="fileInput"
            hidden
          />

          <label htmlFor="fileInput">
            <span>📄 Drag & Drop</span>
            <small>or click to upload PDF</small>
          </label>
        </div>

        {/* Loading */}
        {loading && <p className="loading">Processing your file...</p>}

        {/* File Info */}
        {file && !loading && (
          <p className="file-info">
            {file.name} • {(file.size / 1024).toFixed(1)} KB
          </p>
        )}

        {/* Details */}
        {fileData && (
          <div className="details">

            <div className="row">
              <span>Pages</span>
              <strong>{fileData.pages}</strong>
            </div>

            <div className="row">
              <span>Price / page</span>
              <strong>₹{fileData.pricePerPage}</strong>
            </div>

            <div className="row">
              <span>Copies</span>
              <input
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value))}
              />
            </div>

            <div className="total">
              Total ₹{fileData.totalAmount * copies}
            </div>

          </div>
        )}

        {/* QR */}
        {fileData?.qrCode && (
          <div className="qr">
            <p>Scan at the kiosk to print instantly</p>
            <img src={fileData.qrCode} alt="QR Code" />
          </div>
        )}

      </div>
    </div>
  )
}

export default App