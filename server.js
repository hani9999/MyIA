const express = require("express");
const askGemini = require("./puppeteer-gemini");
const axios = require("axios");

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

app.listen(port, () => {
  console.log(`✅ الخادم يعمل على http://localhost:${port}`);

  // تجربة تلقائية بعد بدء التشغيل
  setTimeout(async () => {
    console.log("🚀 إرسال سؤال تجريبي...");
    try {
      const response = await axios.post(`http://localhost:${port}/ask`, {
        question: "ما هي عاصمة الجزائر؟"
      });
      console.log("🎯 الجواب:", response.data.answer);
    } catch (error) {
      console.error("❌ فشل إرسال السؤال:", error.message);
    }
  }, 3000);
});
