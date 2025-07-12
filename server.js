const express = require('express');
const askGemini = require('./puppeteer_script');
const app = express();

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  const answer = await askGemini(question);
  res.json({ answer });
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
