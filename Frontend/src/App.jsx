import { useState } from "react"

function App() {

  const [qr, setQr] = useState(null)

  const uploadFile = async (e) => {

    const file = e.target.files[0]

    const formData = new FormData()
    formData.append("file", file)

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

  return (
    <div style={{padding:"40px"}}>

      <h2>Upload Document</h2>

      <input type="file" onChange={uploadFile} />

      {qr && (
        <>
          <h3>QR Code</h3>
          <img src={qr} width="250"/>
        </>
      )}

    </div>
  )

}

export default App