import { useState } from "react"

function App() {

  const [file, setFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [copies, setCopies] = useState(1)

  // ✅ Upload handler (used by both click & drag)
  const processFile = async (selectedFile) => {
    if (!selectedFile) return

    setFile(selectedFile)
    setFileData(null) // reset old data

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch(
        "https://print-along-api.onrender.com/upload",
        {
          method: "POST",
          body: formData
        }
      )

      const data = await res.json()
      setFileData(data)

    } catch (err) {
      console.error("Upload failed", err)
    }
  }

  // ✅ Click upload
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

      <h2>Upload Document</h2>

      {/* ✅ Upload Box */}
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
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="fileInput"
        />

        <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
          Drag & Drop or Click to Upload
        </label>
      </div>

      {/* ✅ File Info */}
      {file && (
        <p style={{ marginBottom: "10px" }}>
          {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      {/* ✅ Preview (from backend) */}
      {fileData?.preview_url && (
        <div style={{ width: "80%", marginTop: "20px" }}>
          <h3 style={{ textAlign: "left" }}>Document Preview</h3>
          <iframe
            src={fileData.preview_url}
            width="100%"
            height="500px"
            title="preview"
            style={{ border: "1px solid gray" }}
          />
        </div>
      )}

      {/* ✅ Details (ALL from backend) */}
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
            Price per page: ₹{fileData.price_per_page}
          </p>

          <h3 style={{ marginTop: "10px" }}>
            Total Amount: ₹{fileData.total_amount * copies}
          </h3>

        </div>
      )}

      {/* ✅ QR */}
      {fileData?.qr_code_url && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3>Scan at Kiosk to Print</h3>
          <img src={fileData.qr_code_url} width="250" />
        </div>
      )}

    </div>
  )
}

export default App