const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: "YOUR_CLOUD_NAME",
  api_key: "YOUR_API_KEY",
  api_secret: "YOUR_API_SECRET"
})

async function uploadFile(filePath) {

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "auto"
  })

  return result.secure_url
}

module.exports = uploadFile