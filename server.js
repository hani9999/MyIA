const express = require("express");
const askGemini = require("./puppeteer-gemini");

const app = express();
const port = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const queue = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;
  const { question, res } = queue.shift();

  console.log("🤖 سؤال جديد:", question);

  try {
    const answer = await askGemini(question);
    res.json({ answer });
  } catch (err) {
    console.error("❌ خطأ أثناء سؤال Gemini:", err);
    res.json({ answer: "❌ فشل في المعالجة." });
  }

  processing = false;
  processQueue();
}

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.json({ answer: "❌ لا يوجد سؤال." });
  }

  queue.push({ question, res });
  processQueue();
});

// ✅ تشغيل الخادم وإرسال سؤال مباشر بعد الإقلاع
app.listen(port, async () => {
  console.log(`✅ الخادم يعمل على http://localhost:${port}`);

  console.log("🚀 إرسال سؤال تجريبي مباشرة...");
  try {
    const answer = await askGemini("ما هي عاصمة الجزائر؟");
    console.log("🎯 الجواب:", answer);
  } catch (error) {
    console.error("❌ فشل في الحصول على الجواب:", error.message);
  }
});
