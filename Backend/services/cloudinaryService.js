const cloudinary = require("cloudinary").v2

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function uploadToCloudinary(buffer, filename) {

  return new Promise((resolve, reject) => {

    // clean filename
    let cleanName = filename.trim()

    // remove extension
    cleanName = cleanName.substring(0, cleanName.lastIndexOf("."))

    // replace spaces
    cleanName = cleanName.replace(/\s+/g, "_")

    // remove special characters
    cleanName = cleanName.replace(/[^a-zA-Z0-9_-]/g, "")

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: cleanName,
        use_filename: false,
        unique_filename: true
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error)
          reject(error)
        } else {
          resolve(result.secure_url)
        }
      }
    )

    stream.end(buffer)

  })

}

module.exports = {
  uploadToCloudinary
}