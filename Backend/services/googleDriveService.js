const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../config/google-key.json"),
  scopes: ["https://www.googleapis.com/auth/drive"]
});

const drive = google.drive({ version: "v3", auth });

async function uploadFile(buffer, filename, mimeType) {
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: mimeType
    },
    media: {
      mimeType: mimeType,
      body: require("stream").Readable.from(buffer)
    }
  });

  return res.data.id;
}

async function convertToPDF(fileId) {
  const res = await drive.files.export(
    {
      fileId,
      mimeType: "application/pdf"
    },
    { responseType: "arraybuffer" }
  );

  return res.data;
}

module.exports = { uploadFile, convertToPDF };