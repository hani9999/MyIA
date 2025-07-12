const puppeteer = require("puppeteer");
const fs = require("fs");

// 🔐 الكوكيز المستخدمة للدخول
const cookies = [
  {
    name: "AEC",
    value: "AVh_V2jqpHvjdbifLwLHSejVVy3yNiDUwEtMj1OR1gpe6KfRNEE3Bd4tVg",
    domain: ".google.com",
    path: "/",
    httpOnly: true,
    secure: true
  },
  {
    name: "APISID",
    value: "OVODRZ-BibfWRtSP/A1wlgHzPr1VL_xSIs",
    domain: ".google.com",
    path: "/",
    secure: true
  },
  {
    name: "SAPISID",
    value: "E4ZHqgEnNxmLbN6l/Apj1csRX4-Wo80KJM",
    domain: ".google.com",
    path: "/",
    secure: true
  },
  {
    name: "SID",
    value: "g.a000ywjcq5kOO45l5KnImc9v9gW5eGQfmODE-eRvJpmO1fB4RgzQtzH3jjw5ZE4iiUTgoAHQzAACgYKAesSARYSFQHGX2MiTOUHzAESatQQCCw2GN04qRoVAUF8yKr0c0GkVwjYz5MdBJ_AWV6R0076",
    domain: ".google.com",
    path: "/",
    httpOnly: true,
    secure: true
  },
  {
    name: "__Secure-1PSID",
    value: "g.a000ywjcq5kOO45l5KnImc9v9gW5eGQfmODE-eRvJpmO1fB4RgzQUOdYxyCYYi77Uo4uWAeZcQACgYKAdASARYSFQHGX2MivTcbQVJXp6W7UgP92WPn3BoVAUF8yKoEJZSEV271nTBEMhq0rtHg0076",
    domain: ".google.com",
    path: "/",
    httpOnly: true,
    secure: true
  }
];

async function askGemini(question = "ما هي عاصمة الجزائر؟") {
  console.log("🔥 تم استدعاء askGemini()");
  console.log("🚀 إطلاق متصفح Puppeteer...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    dumpio: true
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });

  console.log("🧁 إعداد الكوكيز...");
  await page.setCookie(...cookies);

  try {
    console.log("🌐 الذهاب إلى Gemini...");
    await page.goto("https://gemini.google.com/app", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    // 🛑 التحقق من ظهور صفحة الموافقة
    if (page.url().includes("consent.google.com")) {
      console.log("⚠️ تم التوجيه إلى صفحة الموافقة");

      try {
        await page.waitForSelector('form [type="submit"]', {
          visible: true,
          timeout: 8000
        });
        await page.click('form [type="submit"]');
        await page.waitForNavigation({
          waitUntil: "domcontentloaded",
          timeout: 10000
        });

        if (!page.url().includes("gemini.google.com")) {
          console.log("↪️ إعادة التوجيه يدويًا إلى صفحة Gemini...");
          await page.goto("https://gemini.google.com/app", {
            waitUntil: "domcontentloaded",
            timeout: 60000
          });
        }
      } catch (e) {
        console.error("❌ فشل في تخطي صفحة الموافقة:", e.message);
        const html = await page.content();
        fs.writeFileSync("consent-failed.html", html);
        return "❌ لم يتم تخطي Google Consent.";
      }
    }

    // 🔍 حفظ الصفحة بعد التحميل لتحليلها لاحقاً
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

if (require.main === module) {
  askGemini();
}
