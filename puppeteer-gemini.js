const puppeteer = require("puppeteer-core");

async function askGemini(question) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

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
      return markdowns.at(-1)?.innerText.trim() || "";
    });

    if (current === lastReply) {
      stableCount++;
    } else {
      stableCount = 0;
      lastReply = current;
    }

    if (stableCount >= 3) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
  return lastReply || "❌ لا يوجد رد.";
}

module.exports = askGemini;
