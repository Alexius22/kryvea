# Troubleshooting Guide

Common issues and solutions for Kryvea.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Import/Export Issues](#import-export-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### Port Already in Use

**Error:** `Error starting userland proxy: listen tcp 0.0.0.0:443: bind: address already in use`

**Solution:**

```bash
# Check what's using port 443
sudo ss -tulpn | grep 443

# Option 1: Stop the service (likely apache2 or nginx)

# Option 2: Change Kryvea port
# Edit docker-compose.yml:
ports:
  - "1337:443"
```

### Docker Build Fails

**Error:** Build errors during `docker compose up`

**Solution:**

```bash
# Clear build cache
sudo docker compose build --no-cache

# Pull fresh images
sudo docker compose pull

# Remove old containers
sudo docker compose down -v
sudo docker compose up --build
```

### SSL Certificate Warnings

**Issue:** Browser shows "Not Secure" warning

**Solution (Development):**

- Accept the self-signed certificate warning
- Add exception in browser

**Solution (Production):**

```bash
# Use Let's Encrypt
certbot certonly --standalone -d your-domain.com

# Update docker-compose.yml with proper certs
```

## Database Issues

### MongoDB Replica Set Errors

**Error:** `MongoError: No replica set members match selector`

**Solution:**

```bash
# Remove data and restart
sudo docker compose down -v
sudo docker compose up -d

# Wait 30 seconds for initialization
sudo docker compose logs -f db-init
```

## Import/Export Issues

### Burp Import Fails

**Error:** `Failed to parse Burp Suite XML`

**Solutions:**

- Ensure XML format (not HTML)
- Use Burp Suite Pro scanner output
- Check file size limit (default 1GB)

### Nessus Import Fails

**Error:** `Invalid Nessus file format`

**Solutions:**

- Export as `.nessus` format (not CSV or PDF)
- Use Nessus Professional/Essentials output
- Verify file is not corrupted

### Report Generation Fails

**Error:** `Template execution error`

**Solutions:**

```bash
# Check logs
docker logs kryvea-app

# Common issues:
# 1. Invalid template syntax
# 2. Missing template variables
# 3. Corrupted DOCX file

# Test with default template first
```

### Large File Upload Fails

**Error:** `Request entity too large`

**Solution:**
Edit `app/internal/engine/engine.go`:

```go
BodyLimit: 2000 * 1024 * 1024,  // Increase to 2GB
```

And Nginx config:

```nginx
client_max_body_size 2000M;
```

### Support Channels

- **[GitHub Discussions](https://github.com/Alexius22/kryvea/discussions)** - Ask questions
- **[GitHub Issues](https://github.com/Alexius22/kryvea/issues)** - Report bugs
- **[Documentation](/index)** - Check other guides

---

See also: **[Installation](/installation)** | **[Configuration](/configuration)** | **[Usage Guide](/usage)**
