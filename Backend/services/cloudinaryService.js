const cloudinary = require("cloudinary").v2

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function uploadToCloudinary(buffer, filename) {

  return new Promise((resolve, reject) => {

    // Remove spaces at start/end
    let cleanName = filename.trim()

    // replace spaces
    cleanName = cleanName.replace(/\s+/g, "_")

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
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