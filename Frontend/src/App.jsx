import { useState, useEffect } from "react"
import * as pdfjsLib from "pdfjs-dist"

// ✅ Setup PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

function App() {

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [qr, setQr] = useState(null)
  const [pages, setPages] = useState(1)
  const [copies, setCopies] = useState(1)

  const PRICE_PER_PAGE = 2

  // ✅ Get real PDF page count
  const getPdfPageCount = async (file) => {
    const fileReader = new FileReader()

    return new Promise((resolve, reject) => {
      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result)
          const pdf = await pdfjsLib.getDocument(typedArray).promise
          resolve(pdf.numPages)
        } catch (error) {
          reject(error)
        }
      }

      fileReader.readAsArrayBuffer(file)
    })
  }

  // ✅ MAIN FILE PROCESSOR (used by both click + drag)
  const processFile = async (selectedFile) => {
    if (!selectedFile) return

    setFile(selectedFile)
    setQr(null) // reset QR on new upload

    // PDF handling
    if (selectedFile.type === "application/pdf") {
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)

      try {
        const count = await getPdfPageCount(selectedFile)
        setPages(count)
      } catch (err) {
        console.error(err)
        setPages(1)
      }

    } else {
      setPreview(null)
      setPages(1) // fallback for docx, etc.
    }

    // Upload to backend
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
      setQr(data.qr_code_url)

    } catch (err) {
      console.error("Upload failed", err)
    }
  }

  // ✅ CLICK upload
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0]
    processFile(selectedFile)

    // reset input so same file can be re-uploaded
    e.target.value = null
  }

  // ✅ CLEANUP preview memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const totalAmount = pages * copies * PRICE_PER_PAGE

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

      {/* ✅ Upload Box with Drag & Drop */}
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

      {/* File Info */}
      {file && (
        <p style={{ marginBottom: "10px" }}>
          {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ width: "80%", marginTop: "20px" }}>
          <h3 style={{ textAlign: "left" }}>Document Preview</h3>
          <iframe
            src={preview}
            width="100%"
            height="500px"
            title="preview"
            style={{ border: "1px solid gray" }}
          />
        </div>
      )}

      {/* Details */}
      {file && (
        <div style={{
          marginTop: "20px",
          width: "300px",
          textAlign: "left"
        }}>

          <h3>Details</h3>

          <p>Pages: {pages}</p>

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
            Price per page: ₹{PRICE_PER_PAGE}
          </p>

          <h3 style={{ marginTop: "10px" }}>
            Total Amount: ₹{totalAmount}
          </h3>

        </div>
      )}

      {/* QR */}
      {qr && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h3>Scan at Kiosk to Print</h3>
          <img src={qr} width="250" />
        </div>
      )}

    </div>
  )
}

export default App