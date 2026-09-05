# ---------------------------------------------------
# Stage 1: Build the React app using Node
# ---------------------------------------------------
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy all frontend source code into the container
COPY . .

# Install dependencies and create the production build (dist/ folder)
RUN npm ci && npm run build

# ---------------------------------------------------
# Stage 2: Serve the built app using Nginx
# ---------------------------------------------------
FROM nginx:1.27-alpine

# Update Alpine packages to get latest security patches
RUN apk upgrade --no-cache

# Copy the built React files from Stage 1 into Nginx's serving folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (handles API proxy + routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 so the container can be accessed
EXPOSE 80

# Start Nginx in the foreground (required for Docker containers)
CMD ["nginx", "-g", "daemon off;"]