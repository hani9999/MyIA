FROM node:18-slim

# تثبيت المتطلبات الأساسية
RUN apt update && apt install -y \
    wget gnupg2 curl ca-certificates fonts-liberation \
    libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 \
    libxdamage1 libxrandr2 xdg-utils unzip chromium chromium-driver xvfb x11vnc fluxbox

# إعداد مجلد العمل
WORKDIR /app

# نسخ ملفات المشروع
COPY . .

# تثبيت الحزم
RUN npm install

# تشغيل المتصفح والسكربت
CMD ["sh", "-c", "xvfb-run --server-args='-screen 0 1280x800x24' node server.js"]
