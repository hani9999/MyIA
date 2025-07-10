const puppeteer = require("puppeteer-core");

module.exports = async function askGemini(question) {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./user-data",
    executablePath: "/usr/bin/google-chrome", // ✅ في Railway استخدم المتصفح المضمن في الحزمة، أو عدله حسب الحاجة
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });

    await page.waitForSelector("div.ql-editor.textarea", { visible: true });
    await page.type("div.ql-editor.textarea", question);

    await page.waitForSelector("button.send-button", { visible: true });
    await page.click("button.send-button");

    let lastReply = "";
    let stableCount = 0;

    for (let i = 0; i < 30; i++) {
      const current = await page.evaluate(() => {
        const markdowns = Array.from(document.querySelectorAll("div.markdown.markdown-main-panel"))
          .filter(el => el.innerText && el.innerText.trim().length > 20);
        return markdowns.at(-1)?.innerText.trim() || null;
      });

      if (current === lastReply) {
        stableCount++;
      } else {
        lastReply = current;
        stableCount = 0;
      }

      if (stableCount >= 3 && lastReply) break;
      await new Promise(res => setTimeout(res, 1000));
    }

    return lastReply || "❌ لا يوجد رد.";
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
};
