FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm config set side-effects-cache false
# This tells pnpm to allow these specific packages to run their install scripts
RUN pnpm approve-builds @prisma/engines@7.8.0 @scarf/scarf@1.4.0 bcrypt@6.0.0 msgpackr-extract@3.0.4

RUN pnpm install

COPY . .

RUN DATABASE_URL='postgresql://dummy:dummy@localhost:5432/dummy' pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

EXPOSE 3000

CMD [ "pnpm", "start:prod" ]
