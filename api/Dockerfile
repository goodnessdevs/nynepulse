FROM node:20-alpine AS builder

WORKDIR /app

# COPY package*.json ./

RUN npm install -g pnpm

# RUN pnpm config set side-effects-cache false
# This tells pnpm to allow these specific packages to run their install scripts
# RUN pnpm approve-builds @prisma/engines@7.8.0 @scarf/scarf@1.4.0 bcrypt@6.0.0 msgpackr-extract@3.0.4
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate && pnpm run build
# RUN DATABASE_URL='postgresql://dummy:dummy@localhost:5432/dummy' pnpm run build

# Runtime stage
# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install -g pnpm
# RUN pnpm install --prod

# COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/generated ./generated

# EXPOSE 3000

# CMD [ "pnpm", "start:prod" ]

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm i -g pnpm

# Copy package files to install ONLY production dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# CRITICAL FIX: Copy the compiled application from the builder stage
COPY --from=builder /app/dist ./dist

# CRITICAL FIX: Copy the generated Prisma client from the builder stage
# (Make sure this path matches the 'output' directory in your schema.prisma)
COPY --from=builder /app/generated ./generated

EXPOSE 3000

CMD ["node", "dist/src/main.js"]