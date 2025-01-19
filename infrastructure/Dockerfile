FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package.json ./
COPY backend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application files
COPY backend/ ./

# Build the application
RUN yarn build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 