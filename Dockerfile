FROM node:20

# تثبيت Chrome
RUN apt-get update && apt-get install -y wget gnupg unzip \
  && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && apt install -y ./google-chrome-stable_current_amd64.deb || true \
  && apt-get install -f -y \
  && rm google-chrome-stable_current_amd64.deb

WORKDIR /app

COPY . .

RUN npm install

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

EXPOSE 3000

CMD ["node", "server.js"]
