const puppeteer = require("puppeteer");

let browser, page;

async function initBrowser() {
  browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./user-data",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox"]
  });
  const pages = await browser.pages();
  page = pages[0] || await browser.newPage();
  await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
}

async function askGemini(question) {
  if (!browser || !page) await initBrowser();

  // اكتب السؤال
  await page.waitForSelector("div.ql-editor.textarea", { visible: true });
  await page.type("div.ql-editor.textarea", question, { delay: 5 });

  // أرسل
  await page.waitForSelector("button.send-button", { visible: true });
  await page.click("button.send-button");

  // انتظر الرد
  let lastReply = "";
  let stableCount = 0;

  for (let i = 0; i < 15; i++) {
    const current = await page.evaluate(() => {
      const replies = Array.from(document.querySelectorAll("div.markdown.markdown-main-panel"))
        .filter(el => el.innerText && el.innerText.trim().length > 20);
      return replies.at(-1)?.innerText.trim() || "";
    });

    if (current === lastReply) {
      stableCount++;
    } else {
      lastReply = current;
      stableCount = 0;
    }

    if (stableCount >= 2) break;
    await new Promise(res => setTimeout(res, 700));
  }

  return lastReply || "❌ لم يتم العثور على رد.";
}

module.exports = { askGemini };
