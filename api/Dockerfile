FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set side-effects-cache false

COPY package.json pnpm-lock.yaml ./
RUN pnpm approve-builds @prisma/engines bcrypt
RUN pnpm install

COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate

RUN pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]