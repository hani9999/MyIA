import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();

export default async function askGemini(question) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 🟡 استخدم الكوكيز المحفوظة من .env
  await page.setCookie(
    {
      name: "SAPISID",
      value: process.env.SAPISID,
      domain: ".google.com",
      path: "/",
      httpOnly: true,
      secure: true,
    },
    {
      name: "__Secure-1PSID",
      value: process.env.SECURE_1PSID,
      domain: ".google.com",
      path: "/",
      httpOnly: true,
      secure: true,
    }
  );

  try {
    await page.goto("https://gemini.google.com/app", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("div.ql-editor.textarea", { visible: true });
    await page.type("div.ql-editor.textarea", question);

    await page.waitForSelector("button.send-button", { visible: true });
    await page.click("button.send-button");

    let lastReply = "";
    for (let i = 0; i < 20; i++) {
      const reply = await page.evaluate(() => {
        const el = document.querySelector("div.markdown.markdown-main-panel");
        return el?.innerText?.trim() || "";
      });

      if (reply && reply !== lastReply) {
        lastReply = reply;
      } else {
        break;
      }
      await new Promise((res) => setTimeout(res, 1000));
    }

    return lastReply || "❌ لم يتم العثور على رد.";
  } catch (err) {
    return "❌ خطأ: " + err.message;
  } finally {
    await browser.close();
  }
}
