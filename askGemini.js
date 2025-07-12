import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();

export default async function askGemini(question) {
  console.log("🚀 بدء تشغيل Puppeteer...");

  const browser = await puppeteer.launch({
    headless: false, // لمتابعة التصرف أثناء التطوير
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    console.log("🔐 إعداد الكوكيز...");

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

    console.log("🌐 فتح صفحة Gemini...");
    await page.goto("https://gemini.google.com/app", {
      waitUntil: "domcontentloaded",
    });

    console.log("⌛️ في انتظار مربع الكتابة...");
    await page.waitForSelector("div.ql-editor.textarea", {
      visible: true,
      timeout: 30000,
    });

    console.log("✍️ كتابة السؤال...");
    await page.type("div.ql-editor.textarea", question);

    console.log("📨 إرسال السؤال...");
    await page.waitForSelector("button.send-button", { visible: true });
    await page.click("button.send-button");

    console.log("⏳ في انتظار الرد...");
    let lastReply = "";
    for (let i = 0; i < 30; i++) {
      const current = await page.evaluate(() => {
        const el = document.querySelector("div.markdown.markdown-main-panel");
        return el?.innerText?.trim() || "";
      });

      if (current && current !== lastReply) {
        lastReply = current;
      } else {
        console.log(`⌛️ لا جديد... (${i})`);
      }

      await new Promise((res) => setTimeout(res, 1000));
    }

    console.log("✅ الرد جاهز 🎉");
    return lastReply || "❌ لم يتم العثور على رد.";

  } catch (err) {
    console.error("❌ حدث خطأ أثناء سؤال Gemini:", err.message);

    // التقاط لقطة شاشة عند الفشل
    await page.screenshot({ path: "error_screenshot.png" });
    console.log("📸 تم حفظ لقطة شاشة عند الفشل: error_screenshot.png");

    return "❌ خطأ: " + err.message;
  } finally {
    console.log("🧹 إغلاق المتصفح...");
    await browser.close();
  }
}
