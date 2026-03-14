const cloudinary = require("cloudinary").v2

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function uploadToCloudinary(buffer, filename) {

  return new Promise((resolve, reject) => {

    // Remove extension (ex: file.docx -> file)
    let name = filename.split(".")[0]

    // Remove spaces at start and end
    name = name.trim()

    // Replace spaces with underscore
    name = name.replace(/\s+/g, "_")

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: name,
        use_filename: true,
        unique_filename: false,
        flags: "attachment"
      },
      (error, result) => {

        if (error) {
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