# syntax=docker/dockerfile:1

# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for better cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Pass API URL at build time (can be overridden by build args)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Copy source and build
COPY . .
RUN npm run build

# ---------- Runtime Stage (Nginx) ----------
FROM nginx:1.27-alpine AS runtime

# Copy custom nginx config to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
