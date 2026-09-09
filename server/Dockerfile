FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY presence.mjs ./

EXPOSE 4000

ENV PORT=4000

CMD ["node", "presence.mjs"]
