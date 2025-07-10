// puppeteer-gemini.js
const puppeteer = require("puppeteer");

let browser;

async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_EXECUTABLE_PATH || puppeteer.executablePath()
    });
  }
  return browser;
}

async function askGemini(question) {
  const browser = await initializeBrowser();
  const page = await browser.newPage();

  try {
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("div.ql-editor.textarea", { visible: true });

    // اكتب السؤال
    await page.type("div.ql-editor.textarea", question);

    // اضغط على زر الإرسال
    await page.waitForSelector("button.send-button", { visible: true });
    await page.click("button.send-button");

    // ⏳ انتظر الرد حتى يستقر
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
      await new Promise(res => setTimeout(res, 1000));
    }

    return lastReply || "❌ لم يتم العثور على رد.";
  } catch (error) {
    console.error("❌ خطأ أثناء سؤال Gemini:", error);
    return "❌ لم يتم الحصول على رد.";
  } finally {
    await page.close(); // ✅ أغلق الصفحة فقط، وليس المتصفح
  }
}

module.exports = askGemini;
