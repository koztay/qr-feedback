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
COPY backend/scripts ./backend/scripts
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json ./backend/

# Verify scripts directory exists and show contents
RUN echo "Verifying scripts directory:" && \
    ls -la ./backend/scripts && \
    echo "Contents of scripts directory:" && \
    cat ./backend/scripts/seed-translations.ts

# Set working directory to backend
WORKDIR /app/backend

# Generate Prisma client and build
RUN yarn prisma generate && \
    yarn tsc --project tsconfig.json && \
    yarn tsc scripts/seed-translations.ts --outDir dist/scripts

# Start a new stage for production
FROM node:18-alpine

WORKDIR /app/backend

# Install production dependencies
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY --from=builder /app/package.json /app/yarn.lock /app/
COPY --from=builder /app/backend/package.json ./
RUN yarn install --production --frozen-lockfile

# Copy built files, prisma schema, and compiled scripts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/scripts/ ./scripts/

# Generate Prisma client
RUN yarn add @prisma/client@5.22.0 && \
    yarn add prisma@5.22.0 --dev && \
    yarn prisma generate

EXPOSE 3000

CMD ["yarn", "start"] 