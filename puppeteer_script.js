const puppeteer = require("puppeteer");

let browser;

async function initializeBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
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
    await page.type("div.ql-editor.textarea", question);
    await page.click("button.send-button");

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
    console.error("❌ خطأ:", error);
    return "❌ حدث خطأ.";
  } finally {
    await page.close();
  }
}

module.exports = askGemini;
