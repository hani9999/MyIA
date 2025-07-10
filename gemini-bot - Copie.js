const puppeteer = require("puppeteer");

(async () => {
  const question = process.argv[2] || "ما هو الذكاء الاصطناعي؟";

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./user-data", // يحفظ الجلسة لتجنب إعادة تسجيل الدخول
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // ✅ غيّر المسار حسب تثبيت Chrome عندك إذا لزم
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });

    // ✅ انتظار خانة الإدخال
    await page.waitForSelector("div.ql-editor.textarea", { visible: true });

    // ✅ كتابة السؤال
    await page.type("div.ql-editor.textarea", question);

    // ✅ الضغط على زر الإرسال
    await page.waitForSelector("button.send-button", { visible: true });
    await page.click("button.send-button");

    // ⏳ انتظار ظهور "Un instant..." إن وُجد
    await page.waitForFunction(() => {
      return [...document.querySelectorAll("div")].some(el =>
        el.innerText && el.innerText.includes("Un instant")
      );
    }, { timeout: 10000 }).catch(() => {});

    // ✅ مراقبة الرد حتى يتوقف عن التغير (أي: انتهت Gemini من الكتابة)
    let lastReply = "";
    let stableCount = 0;

    for (let i = 0; i < 30; i++) {
		const current = await page.evaluate(() => {
		  const markdowns = Array.from(document.querySelectorAll("div.markdown.markdown-main-panel"))
			.filter(el => el.innerText && el.innerText.trim().length > 20);
			
		  return markdowns.at(-1)?.innerText.trim() || "❌ لم يتم العثور على رد.";
		});

      if (current === lastReply) {
        stableCount++;
      } else {
        stableCount = 0;
        lastReply = current;
      }

      if (stableCount >= 3) break; // توقف الرد عن التغير لمدة 3 ثواني
      await new Promise(resolve => setTimeout(resolve, 1000)); // انتظر ثانية
    }

    // ✅ طباعة الرد النهائي
    console.log(lastReply || "❌ لم يتم العثور على رد.");
  } catch (err) {
    console.error("❌ خطأ أثناء المعالجة:", err);
    console.log("❌ لم يتم الحصول على رد.");
  } finally {
    await browser.close();
  }
})();
