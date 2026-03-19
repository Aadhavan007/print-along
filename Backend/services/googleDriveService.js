const { google } = require("googleapis");
const stream = require("stream");

// 🔐 AUTH (from ENV)
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });


// 📤 UPLOAD FILE TO DRIVE
async function uploadFile(file) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      mimeType: file.mimetype
    },
    media: {
      mimeType: file.mimetype,
      body: bufferStream
    }
  });

  return response.data.id;
}


// 🔄 CONVERT TO PDF + RETURN DOWNLOAD LINK
async function convertToPDF(fileId) {

  const res = await drive.files.export(
    {
      fileId,
      mimeType: "application/pdf"
    },
    { responseType: "arraybuffer" }
  );

  const stream = require("stream");
  const bufferStream = new stream.PassThrough();
  bufferStream.end(res.data);

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

  await drive.permissions.create({
    fileId: pdfFileId,
    requestBody: {
      role: "reader",
      type: "anyone"
    }
  });

  return `https://drive.google.com/uc?id=${pdfFileId}&export=download`;
}


module.exports = { uploadFile, convertToPDF };