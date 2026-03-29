import { useState } from "react"
import "./App.css"

function App() {
  const [file, setFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [copies, setCopies] = useState(1)
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState(null) // ✅ NEW

  const processFile = async (selectedFile) => {
    if (!selectedFile) return

    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files are supported")
      return
    }

    setFile(selectedFile)
    setFileData(null)
    setQrCode(null)
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
      console.error(err)
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

  // 💳 PAYMENT HANDLER
  const handlePayment = async () => {
    try {
      const res = await fetch(
        "https://print-along-api.onrender.com/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: fileData.totalAmount * copies
          })
        }
      )

      const order = await res.json()

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // 🔥 replace this
        amount: order.amount,
        currency: "INR",
        name: "PrintAlong",
        description: "Print Payment",
        order_id: order.id,

        handler: async function () {
          alert("Payment Successful ✅")

          // ✅ AFTER PAYMENT → GENERATE QR
          const printUrl = `${fileData.fileUrl}?fl_attachment=true`

          const qrRes = await fetch(
            "https://print-along-api.onrender.com/api/generate-qr",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ url: printUrl })
            }
          )

          const qrData = await qrRes.json()
          setQrCode(qrData.qrCode)
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      console.error(err)
      alert("Payment failed")
    }
  }

  return (
    <div className="app">
      <div className="card">

        <h1 className="title">PrintAlong</h1>
        <p className="subtitle">
          Upload your PDF and print instantly using QR
        </p>

        {/* Upload */}
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

        {loading && <p className="loading">Processing your file...</p>}

        {file && !loading && (
          <p className="file-info">
            {file.name} • {(file.size / 1024).toFixed(1)} KB
          </p>
        )}

        {fileData && (
          <div className="details">

            <div className="row">
              <span>Pages</span>
              <div className="value">
                <strong>{fileData.pages}</strong>
              </div>
            </div>

            <div className="row">
              <span>Price / page</span>
              <div className="value">
                <strong>₹{fileData.pricePerPage}</strong>
              </div>
            </div>

            <div className="row">
              <span>Copies</span>
              <div className="value">
                <input
                  type="number"
                  min="1"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="total">
              Total ₹{fileData.totalAmount * copies}
            </div>

            {/* 💳 PAY BUTTON */}
            <button
              onClick={handlePayment}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#22c55e",
                color: "black",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Pay & Generate QR
            </button>

          </div>
        )}

        {/* ✅ QR AFTER PAYMENT */}
        {qrCode && (
          <div className="qr">
            <p>Scan at the kiosk to print instantly</p>
            <img src={qrCode} alt="QR Code" />
          </div>
        )}

      </div>
    </div>
  )
}

export default App