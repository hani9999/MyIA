const puppeteer = require("puppeteer-core");

let browser;

async function initializeBrowser() {
  if (!browser) {
    console.log("🚀 بدء تشغيل المتصفح...");
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox"],
      executablePath: "/usr/bin/chromium" // تأكد من المسار في Railway أو بيئتك
    });
  }
  return browser;
}

async function askGemini(question) {
  const browser = await initializeBrowser();
  const page = await browser.newPage();

  console.log("🌐 الانتقال إلى Gemini...");
  await page.setCookie(
    {
      name: "SAPISID",
      value: "E4ZHqgEnNxmLbN6l/Apj1csRX4-Wo80KJM",
      domain: ".google.com",
      path: "/"
    },
    {
      name: "SID",
      value: "g.a000ywjcq5kOO45l5KnImc9v9gW5eGQfmODE-eRvJpmO1fB4RgzQtzH3jjw5ZE4iiUTgoAHQzAACgYKAesSARYSFQHGX2MiTOUHzAESatQQCCw2GN04qRoVAUF8yKr0c0GkVwjYz5MdBJ_AWV6R0076",
      domain: ".google.com",
      path: "/"
    },
    {
      name: "__Secure-1PSID",
      value: "g.a000ywjcq5kOO45l5KnImc9v9gW5eGQfmODE-eRvJpmO1fB4RgzQUOdYxyCYYi77Uo4uWAeZcQACgYKAdASARYSFQHGX2MivTcbQVJXp6W7UgP92WPn3BoVAUF8yKoEJZSEV271nTBEMhq0rtHg0076",
      domain: ".google.com",
      path: "/"
    }
  );

  try {
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("🕵️‍♂️ انتظار مربع السؤال...");
    await page.waitForSelector("div.ql-editor.textarea", { visible: true, timeout: 30000 });

    await page.type("div.ql-editor.textarea", question);

    console.log("📤 إرسال السؤال...");
    await page.click("button.send-button");

    // انتظار الرد
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

    console.log("✅ تم الحصول على الرد.");
    return lastReply || "❌ لم يتم العثور على رد.";
  } catch (err) {
    console.error("❌ خطأ أثناء سؤال Gemini:", err);
    await page.screenshot({ path: "error.png" });
    return "❌ خطأ أثناء سؤال Gemini.";
  } finally {
    await page.close();
  }
}

module.exports = askGemini;
