# Giai đoạn 1: Build React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite sẽ đóng gói biến môi trường vào dist
RUN npm run build

# Giai đoạn 2: Nginx (Cầu nối Proxy)
FROM nginx:alpine
# Copy toàn bộ folder dist vào thư mục chạy của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# --- ĐIỂM BẢO MẬT ---
# Không để IP thật ở đây! Chỉ để URL ảo để push lên Git an toàn.
ARG BACKEND_URL="http://localhost:8000"

RUN echo 'server { \
    listen 80; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
        add_header "Access-Control-Allow-Origin" "*" always; \
    } \
    \
    location /api/ { \
        proxy_pass BACKEND_PLACEHOLDER/; \
        \
        proxy_http_version 1.1; \
        \
        # SSE streaming support \
        proxy_buffering off; \
        proxy_cache off; \
        proxy_set_header Accept-Encoding ""; \
        \
        proxy_read_timeout 300s; \
        proxy_send_timeout 300s; \
        \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        \
        # Keep WS support for Live Chat \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        \
        if ($request_method = "OPTIONS") { \
            add_header "Access-Control-Allow-Origin" "*"; \
            add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS"; \
            add_header "Access-Control-Allow-Headers" "*"; \
            return 204; \
        } \
    } \
}' > /etc/nginx/conf.d/default.conf && \
# Dùng sed để gán URL thật từ biến ARG vào cấu hình Nginx
sed -i "s|BACKEND_PLACEHOLDER|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]