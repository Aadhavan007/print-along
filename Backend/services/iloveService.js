const axios = require("axios");
const FormData = require("form-data");

// 🔹 STEP 1: START TASK
async function startTask() {
  try {
    const res = await axios.post(
      "https://api.ilovepdf.com/v1/start/officepdf",
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.ILOVE_API_KEY}`
        }
      }
    );

    return res.data; // { server, task }
  } catch (err) {
    console.error("iLove START ERROR:", err.response?.data || err.message);
    throw new Error("iLove start task failed");
  }
}

// 🔹 STEP 2: UPLOAD FILE
async function uploadFile(server, task, file) {
  try {
    const form = new FormData();

    form.append("file", file.buffer, file.originalname);
    form.append("task", task);

    const res = await axios.post(
      `${server}/v1/upload`,
      form,
      {
        headers: form.getHeaders()
      }
    );

    return res.data;
  } catch (err) {
    console.error("iLove UPLOAD ERROR:", err.response?.data || err.message);
    throw new Error("iLove upload failed");
  }
}

// 🔹 STEP 3: PROCESS FILE
async function processTask(server, task) {
  try {
    const res = await axios.post(
      `${server}/v1/process`,
      {
        task
      }
    );

    return res.data;
  } catch (err) {
    console.error("iLove PROCESS ERROR:", err.response?.data || err.message);
    throw new Error("iLove process failed");
  }
}

// 🔹 STEP 4: DOWNLOAD PDF
async function downloadFile(server, task) {
  try {
    const res = await axios.get(
      `${server}/v1/download/${task}`,
      {
        responseType: "arraybuffer"
      }
    );

    return Buffer.from(res.data);
  } catch (err) {
    console.error("iLove DOWNLOAD ERROR:", err.response?.data || err.message);
    throw new Error("iLove download failed");
  }
}

// 🔥 MAIN FUNCTION
async function convertWithILove(file) {
  try {
    const { server, task } = await startTask();

    await uploadFile(server, task, file);

    await processTask(server, task);

    const pdfBuffer = await downloadFile(server, task);

    return pdfBuffer;

  } catch (err) {
    console.error("iLove FULL ERROR:", err.message);
    throw new Error("iLove conversion failed");
  }
}

module.exports = { convertWithILove };