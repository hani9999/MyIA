const puppeteer = require("puppeteer");

let browser;

async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false, // يجب أن تكون false لعرض الواجهة أول مرة
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      userDataDir: './user-data' // حفظ جلسة تسجيل الدخول
    });
  }
  return browser;
}

async function askGemini(question) {
  const browser = await initializeBrowser();
  const page = await browser.newPage();

  try {
    console.log("🔍 Navigating to Gemini...");
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });

    console.log("⏳ Waiting for textarea...");
    await page.waitForSelector("div.ql-editor.textarea", { visible: true });

    console.log("✏️ Typing question...");
    await page.type("div.ql-editor.textarea", question);

    console.log("📤 Clicking send...");
    await page.waitForSelector("button.send-button", { visible: true });
    await page.click("button.send-button");

    let lastReply = "";
    let stableCount = 0;

    console.log("⏳ Waiting for response...");
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

    console.log("✅ Response captured");
    return lastReply || "❌ لم يتم العثور على رد.";
  } catch (error) {
    console.error("❌ تفصيل الخطأ:", error);
    return "❌ حدث خطأ أثناء سؤال Gemini.";
  } finally {
    await page.close();
  }
}

module.exports = askGemini;
