FROM node:26-bookworm-slim AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

FROM node:26-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data && chown -R node:node /app

USER node

CMD ["node", "src/index.js"]
