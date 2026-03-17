import { useState } from "react"
import { useDropzone } from "react-dropzone"

function App() {

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [qr, setQr] = useState(null)
  const [pages, setPages] = useState(1)
  const [copies, setCopies] = useState(1)

  const PRICE_PER_PAGE = 2

  const onDrop = async (acceptedFiles) => {

    const selectedFile = acceptedFiles[0]
    setFile(selectedFile)

    // Preview (PDF only)
    if (selectedFile.type === "application/pdf") {
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setPreview(null)
    }

    // TEMP page count (replace later)
    setPages(Math.floor(Math.random() * 10) + 1)

    // Upload to backend
    const formData = new FormData()
    formData.append("file", selectedFile)

    const res = await fetch(
      "https://print-along-api.onrender.com/upload",
      {
        method: "POST",
        body: formData
      }
    )

    const data = await res.json()
    setQr(data.qr_code_url)
  }

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const totalAmount = pages * copies * PRICE_PER_PAGE

  return (
    <div style={{ padding: "30px", color: "white", background: "#111", minHeight: "100vh" }}>

      <h2>Upload Document</h2>

      {/* Drag & Drop */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed gray",
          padding: "40px",
          textAlign: "center",
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        <input {...getInputProps()} />
        <p>Drag & Drop file here or click to upload</p>
      </div>

      {/* File Info */}
      {file && (
        <p>
          📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "20px" }}>
          <h3>Document Preview</h3>
          <iframe
            src={preview}
            width="100%"
            height="500px"
            title="preview"
          />
        </div>
      )}

      {/* Details */}
      {file && (
        <div style={{ marginTop: "20px" }}>

          <h3>Details</h3>

          <p>📄 Pages: {pages}</p>

          <div>
            <label>📑 Copies: </label>
            <input
              type="number"
              min="1"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
            />
          </div>

          <p>💵 Price/Page: ₹{PRICE_PER_PAGE}</p>

          <h2>💰 Total: ₹{totalAmount}</h2>
        </div>
      )}

      {/* QR Code */}
      {qr && (
        <div style={{ marginTop: "20px" }}>
          <h3>Payment (Scan QR)</h3>
          <img src={qr} width="250" />
        </div>
      )}

    </div>
  )
}

export default App