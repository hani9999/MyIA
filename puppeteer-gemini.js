const puppeteer = require("puppeteer");
const fs = require("fs");

const cookies = [ /* ... نسخ الكوكيز تبعك كما هي هنا ... */ ];

async function askGemini(question = "ما هي عاصمة الجزائر؟") {
  console.log("🔥 تم استدعاء askGemini()");
  console.log("🚀 إطلاق متصفح Puppeteer...");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    dumpio: true
  });

  const page = await browser.newPage();

  console.log("🧁 إعداد الكوكيز...");
  await page.setCookie(...cookies);

  try {
    console.log("🌐 الذهاب إلى Gemini...");
    await page.goto("https://gemini.google.com/app", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.screenshot({ path: "page.png", fullPage: true });
    const html = await page.content();
    fs.writeFileSync("page.html", html);
    console.log("📸 تم حفظ لقطة الشاشة وملف HTML");

    console.log("⏳ في انتظار محرر الكتابة...");
    await page.waitForSelector("div.ql-editor.textarea", {
      visible: true,
      timeout: 30000
    });

    console.log(`✍️ كتابة السؤال: "${question}"`);
    await page.type("div.ql-editor.textarea", question);

    console.log("📤 في انتظار زر الإرسال...");
    await page.waitForSelector("button.send-button", {
      visible: true,
      timeout: 15000
    });
    await page.click("button.send-button");

    console.log("🕒 في انتظار الجواب من Gemini...");
    let lastReply = "";
    let stableCount = 0;

    for (let i = 0; i < 30; i++) {
      const current = await page.evaluate(() => {
        const el = document.querySelector("div.markdown.markdown-main-panel");
        return el?.innerText?.trim() || "";
      });

      if (current === lastReply) {
        stableCount++;
      } else {
        stableCount = 0;
        lastReply = current;
      }

      if (stableCount >= 3 && lastReply.length > 20) break;
      await new Promise((res) => setTimeout(res, 1000));
    }

    console.log("✅ الجواب النهائي:", lastReply || "لا يوجد رد");
    return lastReply || "❌ لم يتم العثور على رد.";
  } catch (err) {
    console.error("❌ حدث خطأ أثناء الخطوات:", err);
    try {
      await page.screenshot({ path: "error.png", fullPage: true });
      const html = await page.content();
      fs.writeFileSync("error.html", html);
      console.log("🛑 تم حفظ صفحة الخطأ واللقطة");
    } catch (e) {
      console.log("⚠️ تعذر حفظ ملف الخطأ:", e.message);
    }

    return "❌ خطأ في المعالجة.";
  } finally {
    console.log("🧹 إغلاق المتصفح...");
    await browser.close();
  }
}

module.exports = askGemini;
