FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

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

# Build TypeScript with types
RUN yarn tsc --project tsconfig.json --skipLibCheck

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 