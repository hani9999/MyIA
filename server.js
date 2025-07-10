const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const askGemini = require("./puppeteer-gemini");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "السؤال مفقود." });

  try {
    const answer = await askGemini(question);
    res.json({ answer });
  } catch (err) {
    console.error("❌ خطأ أثناء سؤال Gemini:", err);
    res.status(500).json({ error: "حدث خطأ أثناء المعالجة." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
});
