const express = require("express");
const path = require("path");
const askGemini = require("./puppeteer-gemini");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  if (!question) return res.status(400).send("❌ سؤال مفقود");

  try {
    const answer = await askGemini(question);
    res.send(answer);
  } catch (err) {
    console.error("❌ خطأ أثناء سؤال Gemini:", err);
    res.status(500).send("❌ حدث خطأ");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ الخادم يعمل على http://localhost:${port}`);
});
