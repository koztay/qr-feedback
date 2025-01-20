FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl

# Copy package files first
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy backend source code and scripts
COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts
COPY backend/tsconfig.json ./backend/

# Set working directory to backend and build
WORKDIR /app/backend

# Generate Prisma client and build TypeScript files (including scripts)
RUN yarn prisma generate && \
    yarn tsc --project tsconfig.json && \
    echo "Checking compiled output:" && \
    ls -la dist/scripts || echo "dist/scripts not found" && \
    echo "Checking source scripts:" && \
    ls -la scripts

# Start a new stage for production
FROM node:18-alpine

WORKDIR /app/backend

# Install production dependencies
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/backend/package.json ./
RUN yarn install --production --frozen-lockfile

# Copy built files, prisma schema, and scripts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/scripts ./scripts

# Generate Prisma client
RUN yarn add @prisma/client@5.22.0 && \
    yarn add prisma@5.22.0 --dev && \
    yarn prisma generate

EXPOSE 3000

CMD ["yarn", "start"] 