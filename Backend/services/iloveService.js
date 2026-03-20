const axios = require("axios");
const FormData = require("form-data");

async function convertWithILove(file) {
  try {
    const API_KEY = process.env.ILOVE_API_KEY;

    // 🟢 STEP 1: Start task
    const startRes = await axios.post(
      "https://api.ilovepdf.com/v1/start/officepdf",
      {},
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      }
    );

    const { task, server } = startRes.data;

    // 🟢 STEP 2: Upload file
    const form = new FormData();
    form.append("task", task);
    form.append("file", file.buffer, file.originalname);

    await axios.post(`${server}/v1/upload`, form, {
      headers: form.getHeaders()
    });

    // 🟢 STEP 3: Process conversion
    await axios.post(
      `${server}/v1/process`,
      { task },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      }
    );

    // 🟢 STEP 4: Download PDF
    const downloadRes = await axios.get(
      `${server}/v1/download/${task}`,
      {
        responseType: "arraybuffer"
      }
    );

    return Buffer.from(downloadRes.data);

  } catch (error) {
    console.error("iLoveAPI ERROR:", error.response?.data || error.message);
    throw new Error("iLove conversion failed");
  }
}

module.exports = { convertWithILove };