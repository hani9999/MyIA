const express = require("express");
const path = require("path");
const askGemini = require("./puppeteer-gemini");

const app = express();

// لتفسير JSON
app.use(express.json());

// خدمة الملفات الثابتة من مجلد public
app.use(express.static("public"));

// واجهة إرسال السؤال
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

// ✅ تأكد من إرسال index.html في الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ الخادم يعمل على http://localhost:${port}`);
});
