# Configuration Guide

Advanced configuration options for Kryvea deployment and customization.

## Environment Variables

### Backend Configuration

Configure via `docker-compose.yml` or environment variables:

```yaml
KRYVEA_ADDR: "0.0.0.0:8080" # Listening address and port
KRYVEA_ROOT_PATH: "/" # API root path
KRYVEA_MONGO_URI: "mongodb://..." # MongoDB connection string
KRYVEA_LOG_DIRECTORY: "/var/log/kryvea/" # Log file directory
KRYVEA_LOG_MAX_SIZE_MB: 10 # Max log file size (MB)
KRYVEA_LOG_MAX_BACKUPS: 5 # Number of log backups to keep
KRYVEA_LOG_MAX_AGE_DAYS: 0 # Max age in days (0 = keep forever)
KRYVEA_LOG_COMPRESS: true # Compress old log files
```

### Database Configuration

```yaml
MONGO_INITDB_ROOT_USERNAME: "kryveauser"
MONGO_INITDB_ROOT_PASSWORD: "kryveapass"
```

**Production**: Change default credentials!

### Port Configuration

Change exposed ports in `docker-compose.yml`:

```yaml
services:
  web:
    ports:
      - "1337:443" # Custom external port
```

## Advanced Settings

### Custom Domain Setup

1. Update Nginx configuration (`web/nginx/nginx.conf`):

```nginx
server_name             your-domain.com;
ssl_certificate        /etc/nginx/ssl/your-domain.com.pem;
ssl_certificate_key    /etc/nginx/ssl/your-domain.com.key;
```

2. Configure SSL certificates:

```yaml
web:
  [...]
  volumes:
    - ./ssl/your-domain.com.key:/etc/nginx/ssl/your-domain.com.key:ro
    - ./ssl/your-domain.com.pem:/etc/nginx/ssl/your-domain.com.pem:ro
```

### Reverse Proxy Setup

If running behind a reverse proxy (Nginx, Apache):

```nginx
location /kryvea {
    proxy_pass https://kryvea-web;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Log Configuration

**Increase log retention:**

```yaml
KRYVEA_LOG_MAX_BACKUPS: 30 # Keep 30 backups
KRYVEA_LOG_MAX_AGE_DAYS: 90 # Keep logs for 90 days
```

**Increase log file size:**

```yaml
KRYVEA_LOG_MAX_SIZE_MB: 50 # 50MB per file
```

### Database Tuning

**Increase connection pool:**
Edit `app/internal/mongo/driver.go`:

```go
clientOpts.SetMaxPoolSize(100)
clientOpts.SetMinPoolSize(10)
```

**Enable MongoDB authentication:**
Already enabled by default in `docker-compose.yml`.

## Security Configuration

### SSL/TLS Certificates

**Development (self-signed):**

```bash
# Auto-generated on first run
```

**Production (Let's Encrypt):**

```bash
certbot certonly --standalone -d your-domain.com
```

Mount certificates:

```yaml
web:
  [...]
  volumes:
    - ./ssl/your-domain.com.key:/etc/nginx/ssl/your-domain.com.key:ro
    - ./ssl/your-domain.com.pem:/etc/nginx/ssl/your-domain.com.pem:ro
```

## Performance Tuning

### Nginx Caching

Add caching for static assets in `web/nginx/nginx.conf`:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring & Logging

### Access Logs

Nginx access logs:

```bash
docker logs kryvea-web
```

Application logs:

```bash
docker exec kryvea-app tail -f /var/log/kryvea/app.log
```

---

See also: **[Installation Guide](/installation)** | **[Troubleshooting](/troubleshooting)**
