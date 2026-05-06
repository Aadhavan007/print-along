const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function uploadToCloudinary(buffer, filename) {

  return new Promise((resolve, reject) => {

    let cleanName = filename.trim().replace(/\s+/g, "_")

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: cleanName,
        use_filename: true,
        unique_filename: false,
        type: "upload"
      },

      (error, result) => {

        if (error) {
          console.error("Cloudinary Upload Error:", error)
          return reject(error)
        }

        console.log("✅ FILE URL:", result.secure_url)

        resolve(result.secure_url)
      }
    )

    stream.end(buffer)
  })
}

module.exports = {
  uploadToCloudinary
}