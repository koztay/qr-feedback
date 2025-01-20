FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl

# Copy package files first
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy entire backend directory
COPY backend ./backend

# Set working directory to backend and build
WORKDIR /app/backend

# Generate Prisma client and build TypeScript files (including scripts)
RUN yarn prisma generate && \
    yarn tsc --project tsconfig.json && \
    echo "Checking compiled output:" && \
    ls -la dist/scripts || echo "dist/scripts not found" && \
    echo "Checking source scripts:" && \
    ls -la scripts

EXPOSE 3000

CMD ["yarn", "start"] 