FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set side-effects-cache false

COPY package.json pnpm-lock.yaml ./
RUN pnpm approve-builds @scarf/scarf@1.4.0 msgpackr-extract@3.0.3
RUN pnpm install

COPY . .

# Generate Prisma client with dummy URL (real URL not needed at build time)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate

RUN pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy built output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated

# Copy prisma for migrate deploy at startup
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]