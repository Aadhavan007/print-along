const { google } = require("googleapis");
const stream = require("stream");

// 🔐 AUTH
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDS_BASE64, "base64").toString()
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });


// 📤 UPLOAD FILE TO DRIVE
async function uploadFile(buffer, originalname, mimetype) {
  const bufferStream = new stream.PassThrough();

  const safeBuffer = Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(buffer);

  bufferStream.end(safeBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: originalname,
      mimeType: mimetype
    },
    media: {
      mimeType: mimetype,
      body: bufferStream
    }
  });

  return response.data.id;
}


// 🔄 CONVERT TO PDF → RETURN BUFFER + LINK
async function convertToPDF(fileId) {
  // 1. Convert to PDF (ArrayBuffer)
  const res = await drive.files.export(
    {
      fileId,
      mimeType: "application/pdf"
    },
    { responseType: "arraybuffer" }
  );

  // 2. Upload converted PDF
  const bufferStream = new stream.PassThrough();
  bufferStream.end(Buffer.from(res.data));

  const uploadedPDF = await drive.files.create({
    requestBody: {
      name: "converted.pdf",
      mimeType: "application/pdf"
    },
    media: {
      mimeType: "application/pdf",
      body: bufferStream
    }
  });

  const pdfFileId = uploadedPDF.data.id;

  // 3. Make public
  await drive.permissions.create({
    fileId: pdfFileId,
    requestBody: {
      role: "reader",
      type: "anyone"
    }
  });

  // 4. Get buffer for page count
  const pdfRes = await drive.files.get(
    { fileId: pdfFileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return {
    buffer: Buffer.from(pdfRes.data),
    url: `https://drive.google.com/uc?id=${pdfFileId}&export=download`
  };
}

module.exports = { uploadFile, convertToPDF };