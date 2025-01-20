FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl

# Copy entire workspace (including scripts directory after .dockerignore update)
COPY . .

# Install dependencies
RUN yarn install --frozen-lockfile

# Set working directory to backend and build
WORKDIR /app/backend
RUN yarn prisma generate && yarn build

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