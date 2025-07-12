const express = require('express');
const askGemini = require('./puppeteer_script');
const app = express();

app.use(express.json());

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  const answer = await askGemini(question);
  res.json({ answer });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

