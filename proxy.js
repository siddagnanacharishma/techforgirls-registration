const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'})); // Increase limit for file uploads

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz9PC_LQw5OUPIPEBLRRhp76ACGaviutKeNpwo2Ja6U93KW7kXk_EALGQAfzLjiqC0/exec';

app.post('/register', async (req, res) => {
  try {
    // Log the incoming request body
    console.log("====== New /register Request ======");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Forward the request to Apps Script
    let response;
    try {
      response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(req.body)
      });
    } catch (fetchErr) {
      console.error("Fetch to Apps Script failed:", fetchErr.stack || fetchErr);
      return res.status(500).json({success: false, error: "Fetch to Apps Script failed", details: fetchErr.message});
    }

    // Log the response status
    console.log("Apps Script HTTP status:", response.status, response.statusText);

    // Log the raw response from Apps Script
    let text;
    try {
      text = await response.text();
      console.log("Apps Script raw response:", text);
    } catch (textErr) {
      console.error("Error reading response text from Apps Script:", textErr.stack || textErr);
      return res.status(500).json({success: false, error: "Error reading response text", details: textErr.message});
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(text);
      console.log("Parsed JSON from Apps Script:", data);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.stack || parseErr);
      data = {success: false, error: "Invalid JSON from Apps Script", raw: text};
    }

    if (!response.ok) {
      // Log the error if Apps Script did not return 2xx
      console.error("Apps Script returned error status:", response.status, data);
      return res.status(500).json(data);
    } else {
      res.json(data);
    }
  } catch (err) {
    // Log any proxy/server errors
    console.error("Proxy server caught error:", err.stack || err);
    res.status(500).json({success: false, error: err.message});
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
