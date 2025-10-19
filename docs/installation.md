# Installation Guide

This guide will walk you through installing and deploying Kryvea.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Installation (Docker)](#quick-installation-docker)
- [Manual Installation](#manual-installation)
- [Production Deployment](#production-deployment)
- [Updating Kryvea](#updating-kryvea)
- [Uninstallation](#uninstallation)

## Prerequisites

### System Requirements

- **OS**: Linux, macOS, or Windows
- **Disk Space**: Minimum 15GB
- **Ports**: 443 (or custom port of your choice)

### Software Requirements

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Installation Check

```bash
# Check Docker installation
sudo docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose installation
sudo docker compose version
# Expected: Docker Compose version v2.0.0 or higher
```

## Quick Installation (Docker)

The fastest way to get Kryvea up and running.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Alexius22/kryvea.git
cd kryvea
```

### Step 2: Start the Application

```bash
sudo docker compose up -d
```

This command will:

- Build the Go backend
- Build the React frontend
- Initialize MongoDB with replica sets
- Generate self-signed SSL certificates
- Start all services in detached mode

### Step 3: Wait for Initialization

The first startup takes 2-5 minutes to build images and initialize the database.

Monitor the logs:

```bash
docker compose logs -f
```

Look for:

```
kryvea-app  | Listening for connections on http://0.0.0.0:8080
kryvea-web  | Configuration complete; ready for start up
```

### Step 4: Access the Application

Open your browser and navigate to:

```
https://localhost
```

**Accept the self-signed certificate warning** (development only)

**Default credentials:**

- Username: `kryvea`
- Password: `kryveapassword`

### Step 5: Populate Database with Sample Data (Optional)

To test Kryvea with sample data, run the following command:

```bash
python3 scripts/populate_db/main.py
```

## Production Deployment

### Security Checklist

Before deploying to production:

- Change MongoDB credentials in `docker-compose.yml`
- Use CA-issued SSL certificates (not self-signed)

### Custom Configuration

#### 1. Update docker-compose.yml

```yaml
services:
  db:
    environment:
      - MONGO_INITDB_ROOT_USERNAME=your_secure_username
      - MONGO_INITDB_ROOT_PASSWORD=your_secure_password

  app:
    environment:
      - KRYVEA_MONGO_URI=mongodb://your_secure_username:your_secure_password@kryvea-db:27017/?replicaSet=rs0
```

#### 2. Use Custom SSL Certificates

```yaml
web:
  [...]
  volumes:
    - ./ssl/kryvea.local.key:/etc/nginx/ssl/kryvea.local.key:ro
    - ./ssl/kryvea.local.pem:/etc/nginx/ssl/kryvea.local.pem:ro
```

#### 3. Change Default Port

```yaml
services:
  web:
    ports:
      - "1337:443"
```

### Deployment with Custom Domain

#### 1. Update Nginx Configuration

Edit `web/nginx/nginx.conf`:

```nginx
server_name             your-domain.com;
ssl_certificate        /etc/nginx/ssl/your-domain.com.pem;
ssl_certificate_key    /etc/nginx/ssl/your-domain.com.key;
```

#### 2. Configure DNS

Point your domain to the server IP address:

```
A record: your-domain.com -> your.server.ip.address
```

#### 3. Use Let's Encrypt for SSL

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Update docker-compose.yml to use the certificates
web:
  [...]
  volumes:
    - ./ssl/your-domain.com.key:/etc/nginx/ssl/your-domain.com.key:ro
    - ./ssl/your-domain.com.pem:/etc/nginx/ssl/your-domain.com.pem:ro
```

## Updating Kryvea

### Docker Deployment

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build
```

## Uninstallation

### Remove All Data (Docker)

```bash
# Stop and remove containers
docker compose down

# Remove images
docker rmi kryvea-app kryvea-web

# Remove data directory
cd ..
rm -rf kryvea/.data
```

## Next Steps

- **[Usage Guide](usage.md)** - Learn how to use Kryvea
- **[Configuration](configuration.md)** - Advanced configuration

---

Need help? Check the **[Troubleshooting Guide](troubleshooting.md)** or open an issue on GitHub.
