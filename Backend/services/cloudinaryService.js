const cloudinary = require("cloudinary").v2

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {

    // Clean filename
    let cleanName = filename.trim().replace(/\s+/g, "_")

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: cleanName,
        use_filename: true,
        unique_filename: false,
        type: "upload",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error)
          return reject(error)
        }

        // ✅ FORCE PUBLIC INLINE URL (IMPORTANT FIX)
        const publicUrl = result.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment:false/"
        )

        console.log("✅ FILE URL:", publicUrl)

        resolve(publicUrl)
      }
    )

    stream.end(buffer)
  })
}

module.exports = {
  uploadToCloudinary
}