FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl

# Copy workspace configuration
COPY package.json yarn.lock ./

# Copy workspace packages
COPY backend/package.json ./backend/
COPY mobile-app/package.json ./mobile-app/
COPY dashboard/package.json ./dashboard/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy backend files
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Generate Prisma client and types
RUN yarn prisma generate

# Check TypeScript types with verbose output
RUN yarn tsc --noEmit --pretty

# Build TypeScript
RUN yarn build

# Start a new stage for a smaller production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package.json yarn.lock ./
COPY backend/package.json ./backend/

# Install production dependencies and Prisma CLI
RUN yarn workspace backend install --production --frozen-lockfile && \
    yarn workspace backend add prisma --dev

# Copy built files from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Generate Prisma client in production
WORKDIR /app/backend
RUN yarn prisma generate

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 