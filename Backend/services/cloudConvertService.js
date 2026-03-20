const axios = require("axios");
const FormData = require("form-data");

async function convertWithCloudConvert(file) {
  try {
    const API_KEY = process.env.CLOUDCONVERT_API_KEY;

    // 🟢 STEP 1: Create Job (upload + convert + export)
    const jobRes = await axios.post(
      "https://api.cloudconvert.com/v2/jobs",
      {
        tasks: {
          "import-my-file": {
            operation: "import/upload"
          },
          "convert-my-file": {
            operation: "convert",
            input: "import-my-file",
            output_format: "pdf"
          },
          "export-my-file": {
            operation: "export/url",
            input: "convert-my-file"
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const tasks = jobRes.data.data.tasks;

    const uploadTask = tasks.find(t => t.name === "import-my-file");

    // 🟢 STEP 2: Upload file
    const form = new FormData();

    Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
      form.append(key, value);
    });

    form.append("file", file.buffer, file.originalname);

    await axios.post(uploadTask.result.form.url, form, {
      headers: form.getHeaders()
    });

    // 🟢 STEP 3: Wait for conversion
    let jobId = jobRes.data.data.id;
    let status = "processing";
    let exportTask = null;

    while (status === "processing" || status === "waiting") {
      await new Promise(res => setTimeout(res, 2000)); // wait 2 sec

      const checkRes = await axios.get(
        `https://api.cloudconvert.com/v2/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`
          }
        }
      );

      const job = checkRes.data.data;
      status = job.status;

      exportTask = job.tasks.find(t => t.name === "export-my-file");
    }

    if (status !== "finished") {
      throw new Error("CloudConvert job failed");
    }

    // 🟢 STEP 4: Download PDF
    const fileUrl = exportTask.result.files[0].url;

    const downloadRes = await axios.get(fileUrl, {
      responseType: "arraybuffer"
    });

    return Buffer.from(downloadRes.data);

  } catch (error) {
    console.error("CloudConvert ERROR:", error.response?.data || error.message);
    throw new Error("CloudConvert conversion failed");
  }
}

module.exports = { convertWithCloudConvert };