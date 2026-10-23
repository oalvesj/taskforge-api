FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --include=dev

COPY . .

RUN npx prisma generate

EXPOSE 3333

CMD npx prisma migrate deploy && npx tsx src/server.ts
