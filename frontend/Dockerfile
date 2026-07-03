# Production stage with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy pre-built admin frontend from the host
COPY apps/admin/dist ./admin

# Create placeholder for web if it doesn't exist
RUN mkdir -p ./web && \
      echo '<!DOCTYPE html><html><head><title>E-Commerce - Web</title><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5;color:#333}h1{font-size:2rem;margin-bottom:0.5rem}p{color:#666}.container{text-align:center}</style></head><body><div class="container"><h1>E-Commerce Web</h1><p>Frontend is ready. Add your source code to <code>frontend/apps/web/</code> and rebuild.</p></div></body></html>' > ./web/index.html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
