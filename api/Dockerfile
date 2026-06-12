FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set side-effects-cache false

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./
RUN pnpm approve-builds @prisma/engines bcrypt
RUN pnpm install

# Copy application source
COPY . .

# Generate Prisma Client to your custom directory
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate

# Build NestJS app
RUN pnpm run build

# --- Runtime Stage ---
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# 1. Copy package files and install ONLY production dependencies directly here
# This ensures pnpm recreates all internal symlinks perfectly for Prisma 7
COPY package.json pnpm-lock.yaml ./
RUN pnpm approve-builds @prisma/engines bcrypt
RUN pnpm install --prod

# 2. Copy the compiled NestJS code
COPY --from=builder /app/dist ./dist

# 3. Copy the generated client to BOTH locations your code looks for it
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/src/generated ./dist/src/generated

# 4. Copy Prisma migrations, schema, and config
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.* ./

EXPOSE 3000

# Run migrations and start the server
CMD ./node_modules/.bin/prisma migrate deploy && pnpm run start:prod 