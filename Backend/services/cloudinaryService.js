const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function uploadToCloudinary(buffer, filename) {

  // convert buffer → base64
  const base64File = buffer.toString("base64")

  const result = await cloudinary.uploader.upload(
    `data:application/octet-stream;base64,${base64File}`,
    {
      resource_type: "auto",
      use_filename: true,
      unique_filename: true
    }
  )

  return result.secure_url
}

module.exports = {
  uploadToCloudinary
}