FROM node:18-slim

# تثبيت متطلبات Chrome و VNC
RUN apt update && apt install -y \
    wget gnupg2 curl ca-certificates fonts-liberation \
    libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 \
    libxdamage1 libxrandr2 xdg-utils unzip chromium chromium-driver xvfb x11vnc fluxbox git

# تثبيت noVNC
WORKDIR /opt
RUN git clone https://github.com/novnc/noVNC.git && \
    git clone https://github.com/novnc/websockify noVNC/utils/websockify

# نسخ ملفات المشروع
WORKDIR /app
COPY . .

# تثبيت الحزم
RUN npm install

# إعداد VNC
RUN mkdir -p ~/.vnc && \
    echo "#!/bin/sh\nstartfluxbox &" > ~/.vnc/xstartup && \
    chmod +x ~/.vnc/xstartup

# تشغيل الكل
CMD bash -c "vncserver :1 -geometry 1280x800 -depth 24 && \
             /opt/noVNC/utils/launch.sh --vnc localhost:5901 & \
             xvfb-run --server-args='-screen 0 1280x800x24' node server.js"
