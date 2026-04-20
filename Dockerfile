# Stage 1: Build React
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
# Build for production (uses .env.production)
RUN npm run build:prod

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# ------------------------------------------------------------
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
