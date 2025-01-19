FROM node:18-alpine

WORKDIR /app

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

# Build the application
RUN yarn build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"] 