FROM node:18-slim

# تثبيت المتطلبات الأساسية لتشغيل Puppeteer و Chromium
RUN apt update && apt install -y \
  wget gnupg2 curl ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
  libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 \
  libxdamage1 libxrandr2 xdg-utils libgbm1 libgtk-3-0 chromium chromium-driver \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# منع Puppeteer من تحميل Chromium تلقائيًا
ENV PUPPETEER_SKIP_DOWNLOAD=true

# تحديد المسار اليدوي لـ Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# نسخ ملفات المشروع
COPY . /app
WORKDIR /app

# تثبيت الحزم
RUN npm install

# فتح المنفذ
EXPOSE 8080

# أمر التشغيل
CMD ["node", "server.js"]
