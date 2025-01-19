FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy backend package files
COPY backend/package.json ./backend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy backend files
COPY backend/ ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Build the application
RUN yarn build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 