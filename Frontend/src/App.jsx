import { useState } from "react"

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
    <div style={{
      padding: "40px",
      background: "#111",
      color: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>

      <h2>PrintAlong 🚀</h2>

      {/* Upload Box */}
      <div
        onDrop={(e) => {
          e.preventDefault()
          const droppedFile = e.dataTransfer.files[0]
          if (droppedFile) processFile(droppedFile)
        }}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed gray",
          padding: "30px",
          width: "400px",
          textAlign: "center",
          marginBottom: "20px"
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="fileInput"
        />

        <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
          Drag & Drop or Click to Upload PDF
        </label>
      </div>

      {/* Loading */}
      {loading && <p>Processing your file...</p>}

      {/* File Info */}
      {file && !loading && (
        <p>
          {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      {/* Details */}
      {fileData && (
        <div style={{
          marginTop: "20px",
          width: "300px",
          textAlign: "left"
        }}>

          <h3>Details</h3>

          <p>Pages: {fileData.pages}</p>

          <div style={{ marginTop: "10px" }}>
            <label>Copies</label>
            <input
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              style={{
                display: "block",
                marginTop: "5px",
                padding: "6px",
                width: "100%"
              }}
            />
          </div>

          <p style={{ marginTop: "10px" }}>
            Price per page: ₹{fileData.pricePerPage}
          </p>

          <h3 style={{ marginTop: "10px" }}>
            Total Amount: ₹{fileData.totalAmount * copies}
          </h3>

          <p style={{ marginTop: "10px" }}>
            <a href={fileData.printUrl} target="_blank">
              Open Print Link
            </a>
          </p>

        </div>
      )}

      {/* QR */}
      {fileData?.qrCode && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3>Scan at Kiosk to Print</h3>
          <img src={fileData.qrCode} width="250" />
        </div>
      )}

    </div>
  )
}

export default App