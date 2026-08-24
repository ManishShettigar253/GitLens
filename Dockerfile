# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Create the specific directory needed for the Vite base path '/GitLens/'
RUN mkdir -p /usr/share/nginx/html/GitLens

# Copy the built assets from the builder stage into the /GitLens subdirectory
COPY --from=builder /app/dist /usr/share/nginx/html/GitLens

# Optional: You can copy a custom nginx.conf here if needed, but the default
# works fine for serving static files as long as the base path matches.

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
