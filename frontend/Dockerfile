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

<<<<<<< HEAD
# Nginx configuration
RUN printf '%s\n' \
'server {' \
'    listen 80;' \
'    root /usr/share/nginx/html;' \
'    index index.html;' \
'    location /api/ {' \
'        proxy_pass http://backend:8080/api/;' \
'        proxy_set_header Host $http_host;' \
'        proxy_set_header X-Real-IP $remote_addr;' \
'        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
'        proxy_set_header X-Forwarded-Proto $scheme;' \
'    }' \
'    location / {' \
'        try_files $uri $uri/ /index.html;' \
'    }' \
'}' \
> /etc/nginx/conf.d/default.conf
=======
# Copy our custom Nginx config (handles API proxy + routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf
>>>>>>> a941ce3 (Added comment in Dockerfile)

# Expose port 80 so the container can be accessed
EXPOSE 80

<<<<<<< HEAD
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
=======
# Start Nginx in the foreground (required for Docker containers)
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> a941ce3 (Added comment in Dockerfile)
