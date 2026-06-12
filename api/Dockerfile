FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm
RUN pnpm config set side-effects-cache false

# 1. Install EVERYTHING (including devDependencies) so we have the CLI
COPY package.json pnpm-lock.yaml ./
RUN pnpm approve-builds @prisma/engines bcrypt
RUN pnpm install

COPY . .

# 2. Generate Client and Build NestJS
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate
RUN pnpm run build

# 3. Prune devDependencies *before* moving to runtime stage
# This leaves only production dependencies in node_modules, but KEEPS what Prisma needs
RUN pnpm prune --prod

# --- Runtime Stage ---
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# 1. Copy the pruned node_modules directly from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# 2. Copy the compiled NestJS code
COPY --from=builder /app/dist ./dist

# 3. Copy the generated client to BOTH locations
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/src/generated ./dist/src/generated

# 4. Copy Prisma migrations, schema, and config
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.* ./

# 5. Bring over JUST the prisma binary from the builder stage so we can migrate
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

EXPOSE 3000

# Run migrations and start the server
CMD ./node_modules/.bin/prisma migrate deploy && pnpm run start:prod