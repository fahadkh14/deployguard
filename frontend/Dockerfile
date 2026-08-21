FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# -----------------------------------
# Production Runtime
# -----------------------------------
FROM nginx:1.27-alpine

# Update Alpine packages to security-fixed versions
RUN apk update && apk upgrade --no-cache

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx configuration
RUN printf '%s\n' \
'server {' \
'    listen 80;' \
'    root /usr/share/nginx/html;' \
'    index index.html;' \
'    location /api/ {' \
'        proxy_pass http://backend:8080/api/;' \
'        proxy_set_header Host $host;' \
'        proxy_set_header X-Real-IP $remote_addr;' \
'        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
'        proxy_set_header X-Forwarded-Proto $scheme;' \
'    }' \
'    location / {' \
'        try_files $uri $uri/ /index.html;' \
'    }' \
'}' \
> /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]