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

# Copy backend directory
COPY backend ./backend

# Set working directory to backend and build
WORKDIR /app/backend

# Generate Prisma client and build TypeScript files
RUN yarn prisma generate && \
    # Build TypeScript files (including scripts)
    yarn tsc --project tsconfig.json && \
    # Verify the compiled files exist
    ls -la dist/scripts/

EXPOSE 3000

CMD ["yarn", "start"] 