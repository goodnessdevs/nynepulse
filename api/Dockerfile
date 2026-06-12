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

# 1. Copy the build artifact and its dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# 2. Copy the generated client to BOTH expected locations
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/src/generated ./dist/src/generated

# 3. Copy Prisma schemas and configs so migrations can run
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.* ./

EXPOSE 3000

# 4. Run migrations right before starting up the production app
CMD pnpm prisma migrate deploy && pnpm run start:prod