const express = require("express");
const askGemini = require("./puppeteer-gemini");
const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  console.log("❓ سؤال وارد:", question);
  const reply = await askGemini(question);
  res.send({ reply });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
});
