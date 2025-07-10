const express = require("express");
const cors = require("cors");
const askGemini = require("./puppeteer-gemini");

const app = express();
const port = process.env.PORT || 3000;

// ✅ إعداد CORS للسماح بالاتصال من أي موقع
app.use(cors());

// ✅ إعداد قراءة البيانات القادمة من الواجهة
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ملفات واجهة المستخدم (لو احتجت)
app.use(express.static("public"));

// ✅ طابور الأسئلة لمنع التداخل
const queue = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;

  processing = true;
  const { question, res } = queue.shift();

  console.log("📩 سؤال جديد:", question);

  try {
    const answer = await askGemini(question);
    res.json({ answer });
  } catch (err) {
    console.error("❌ خطأ أثناء سؤال Gemini:", err);
    res.json({ answer: "❌ فشل في المعالجة." });
  }

  processing = false;
  processQueue(); // تابع المعالجة إن كان هناك أسئلة في الانتظار
}

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.json({ answer: "❌ لا يوجد سؤال." });
  }

  queue.push({ question, res });
  processQueue(); // ابدأ المعالجة إن لم تكن تعمل
});

app.listen(port, () => {
  console.log(`✅ السيرفر يعمل على: http://localhost:${port}`);
});
