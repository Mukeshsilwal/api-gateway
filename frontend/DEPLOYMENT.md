# Deployment Guide

Complete guide for deploying the Bus Ticket Frontend to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Traditional Server Deployment](#traditional-server-deployment)
6. [AWS Deployment](#aws-deployment)
7. [Post-Deployment Checklist](#post-deployment-checklist)

## Prerequisites

- ✅ Node.js v16+ installed
- ✅ npm v7+ installed
- ✅ Git repository access
- ✅ Backend API deployed and accessible
- ✅ Payment gateway credentials (eSewa, Khalti, IME Pay)
- ✅ Domain name (optional but recommended)

## Environment Setup

### 1. Create Production Environment File

Create `.env.production.local` file:

```env
# Production API
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_URL=https://yourdomain.com

# Payment Gateways (Production Keys)
REACT_APP_KHALTI_PUBLIC_KEY=live_public_key_xxxxx
REACT_APP_ESEWA_MERCHANT_ID=EPAYTEST

# Build Settings
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### 2. Update Backend URLs

Ensure all redirect URLs in the code match your production domain:

**Files to check:**
- `src/pages/ticketDetails.jsx` - Payment success/failure URLs
- `src/config/api.js` - API endpoints

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Project**
   ```bash
   vercel
   ```
   Follow prompts to set up the project

4. **Set Environment Variables**
   
   In Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production.local`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Docker Deployment

### Build and Run Locally

1. **Build Image**
   ```bash
   docker build -t bus-ticket-frontend:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d -p 80:80 --name bus-ticket bus-ticket-frontend:latest
   ```

3. **Verify**
   ```bash
   docker ps
   curl http://localhost
   ```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

Deploy:
```bash
docker-compose up -d
```

### Push to Docker Registry

1. **Tag Image**
   ```bash
   docker tag bus-ticket-frontend:latest your-registry/bus-ticket-frontend:v1.0.0
   ```

2. **Push to Registry**
   ```bash
   docker push your-registry/bus-ticket-frontend:v1.0.0
   ```

## Traditional Server Deployment

### Ubuntu Server (Nginx)

1. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nginx nodejs npm git -y
   ```

2. **Clone Repository**
   ```bash
   cd /var/www
   sudo git clone <repository-url> bus-ticket
   cd bus-ticket
   ```

3. **Install and Build**
   ```bash
   npm install
   npm run build
   ```

4. **Configure Nginx**
   
   Create `/etc/nginx/sites-available/bus-ticket`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/bus-ticket/build;
       index index.html;

       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;

       # Cache static assets
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

5. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/bus-ticket /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

### Enable Auto-deployment

Create `deploy.sh`:

```bash
#!/bin/bash
cd /var/www/bus-ticket
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

Make executable:
```bash
chmod +x deploy.sh
```

## AWS Deployment

### S3 + CloudFront

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://bus-ticket-frontend
   ```

3. **Upload Build**
   ```bash
   aws s3 sync build/ s3://bus-ticket-frontend
   ```

4. **Configure S3 for Static Website**
   ```bash
   aws s3 website s3://bus-ticket-frontend \
     --index-document index.html \
     --error-document index.html
   ```

5. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Compress Objects: Yes
   - Custom Error Response: 404 → /index.html (for SPA routing)

### EC2 Deployment

1. **Launch EC2 Instance** (Ubuntu 20.04)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-instance-ip
   ```

3. **Follow Traditional Server Deployment steps above**

## Post-Deployment Checklist

### Functional Testing

- [ ] Homepage loads correctly
- [ ] User can register and login
- [ ] Bus search returns results
- [ ] Seat selection works
- [ ] Payment redirect works for all gateways
- [ ] Booking confirmation displays
- [ ] Admin panel is accessible
- [ ] All routes work (no 404s)

### Performance Testing

- [ ] Run Lighthouse audit (score > 90)
- [ ] Test page load time (< 3 seconds)
- [ ] Check mobile responsiveness
- [ ] Verify image optimization

### Security Testing

- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No exposed API keys in source
- [ ] CORS configured correctly
- [ ] CSP headers configured

### Monitoring Setup

1. **Error Tracking**
   - Set up Sentry or similar
   - Configure error logging

2. **Analytics**
   - Google Analytics
   - User behavior tracking

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom

### Environment Variables Verification

```bash
# Verify all required variables are set
echo $REACT_APP_API_URL
echo $REACT_APP_FRONTEND_URL
echo $REACT_APP_KHALTI_PUBLIC_KEY
echo $REACT_APP_ESEWA_MERCHANT_ID
```

## Rollback Procedure

### Vercel
```bash
vercel rollback
```

### Docker
```bash
docker pull your-registry/bus-ticket-frontend:previous-version
docker-compose down
docker-compose up -d
```

### Traditional Server
```bash
cd /var/www/bus-ticket
git reset --hard previous-commit-hash
./deploy.sh
```

## Troubleshooting

### Build Failures

**Out of memory:**
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues

**404 on page refresh:**
- Verify SPA routing is configured (try_files in nginx)
- Check CloudFront error response settings

**API calls failing:**
- Verify CORS settings on backend
- Check REACT_APP_API_URL is correct
- Verify network security groups (AWS)

**Payment gateway errors:**
- Verify production keys are set
- Check redirect URLs match production domain
- Test in sandbox mode first

## Maintenance

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Restart service (varies by platform)
sudo systemctl reload nginx  # Traditional server
vercel --prod                # Vercel
docker-compose restart       # Docker
```

### Monitor Logs

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Docker:**
```bash
docker logs -f bus-ticket
```

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Contact the development team

---

**Last Updated:** November 2025
