# Build stage
FROM node:21-alpine AS build
WORKDIR /app

# These will be used when frontend source is added
COPY . .

# Install dependencies and build
RUN if [ -f package.json ]; then \
      npm ci && \
      npm run build; \
    fi

# Production stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy built frontend or placeholder
COPY --from=build /app/apps/web/dist ./web
COPY --from=build /app/apps/admin/dist ./admin

# Copy or create index.html if no build output
RUN if [ ! -f ./web/index.html ] && [ ! -f ./admin/index.html ]; then \
      mkdir -p ./web ./admin && \
      echo '<!DOCTYPE html><html><head><title>E-Commerce - Web</title><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5;color:#333}h1{font-size:2rem;margin-bottom:0.5rem}p{color:#666}.container{text-align:center}</style></head><body><div class="container"><h1>E-Commerce Web</h1><p>Frontend is ready. Add your source code to <code>frontend/apps/web/</code> and rebuild.</p></div></body></html>' > ./web/index.html && \
      echo '<!DOCTYPE html><html><head><title>E-Commerce - Admin</title><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1a1a2e;color:#eee}h1{font-size:2rem;margin-bottom:0.5rem}p{color:#aaa}.container{text-align:center}</style></head></head><body><div class="container"><h1>E-Commerce Admin</h1><p>Admin panel is ready. Add your source code to <code>frontend/apps/admin/</code> and rebuild.</p></div></body></html>' > ./admin/index.html; \
    fi

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
