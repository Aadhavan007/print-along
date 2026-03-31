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

    // Replace spaces with underscore
    cleanName = cleanName.replace(/\s+/g, "_")

    const stream = cloudinary.uploader.upload_stream(
      {
    
    resource_type: "raw",
    access_mode: "public",
    flags: "attachment:false",

    public_id: cleanName,
    use_filename: true,
    unique_filename: false,
    type: "upload",
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