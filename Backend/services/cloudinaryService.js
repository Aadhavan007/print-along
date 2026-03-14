const cloudinary = require("cloudinary").v2

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function uploadToCloudinary(buffer, filename) {

  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",        // allow any file type
        public_id: filename.split(".")[0],          // keep original filename
        use_filename: true,
        unique_filename: false,
        flags: "attachment"           // force download when opened
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