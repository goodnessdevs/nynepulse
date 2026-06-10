FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source
COPY . .

# Build
RUN pnpm build

EXPOSE 3000

# Run migrations then start
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]