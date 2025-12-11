# ============================================================
# HTTPS/SSL Configuration for Kong Gateway
# ============================================================
# This file contains instructions for enabling HTTPS in production

## Option 1: Let's Encrypt (Recommended for Production)

### Prerequisites
- Domain name pointing to your server
- Ports 80 and 443 open
- Certbot installed

### Steps:

1. **Install Certbot:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install certbot
   
   # Windows (use WSL or download from certbot.eff.org)
   ```

2. **Obtain SSL Certificate:**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   
   # Certificates will be saved to:
   # /etc/letsencrypt/live/yourdomain.com/fullchain.pem
   # /etc/letsencrypt/live/yourdomain.com/privkey.pem
   ```

3. **Update docker-compose.yml:**
   ```yaml
   kong:
     volumes:
       - /etc/letsencrypt:/etc/letsencrypt:ro
     environment:
       KONG_SSL_CERT: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
       KONG_SSL_CERT_KEY: /etc/letsencrypt/live/yourdomain.com/privkey.pem
   ```

4. **Configure Kong to redirect HTTP to HTTPS:**
   ```bash
   # Add redirect plugin
   curl -X POST http://localhost:8001/plugins \
     --data "name=request-termination" \
     --data "config.status_code=301" \
     --data "config.message=Moved to HTTPS"
   ```

## Option 2: Self-Signed Certificate (Development/Testing Only)

### Generate Self-Signed Certificate:

```bash
# Create certs directory
mkdir -p ./certs

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./certs/kong-selfsigned.key \
  -out ./certs/kong-selfsigned.crt \
  -subj "/C=NP/ST=Bagmati/L=Kathmandu/O=TicketKatum/CN=localhost"
```

### Update docker-compose.yml:

```yaml
kong:
  volumes:
    - ./certs:/etc/kong/certs:ro
  environment:
    KONG_SSL_CERT: /etc/kong/certs/kong-selfsigned.crt
    KONG_SSL_CERT_KEY: /etc/kong/certs/kong-selfsigned.key
    KONG_ADMIN_SSL_CERT: /etc/kong/certs/kong-selfsigned.crt
    KONG_ADMIN_SSL_CERT_KEY: /etc/kong/certs/kong-selfsigned.key
```

## Option 3: Cloud Provider SSL (AWS, Azure, GCP)

### AWS Application Load Balancer:
- Configure ALB with ACM certificate
- Terminate SSL at load balancer
- Kong receives HTTP traffic from ALB

### Azure Application Gateway:
- Use Azure Key Vault for certificates
- Configure SSL termination at gateway

### GCP Load Balancer:
- Use Google-managed SSL certificates
- Configure HTTPS load balancer

## Kong HTTPS Configuration

### Enable HTTPS in Kong:

```yaml
# docker-compose.yml
kong:
  environment:
    # Enable HTTPS
    KONG_PROXY_LISTEN: 0.0.0.0:8000, 0.0.0.0:8443 ssl
    KONG_ADMIN_LISTEN: 0.0.0.0:8001, 0.0.0.0:8444 ssl
    
    # Force HTTPS (optional)
    KONG_HEADERS: "Strict-Transport-Security: max-age=31536000; includeSubDomains"
    
    # SSL Certificates
    KONG_SSL_CERT: /path/to/cert.pem
    KONG_SSL_CERT_KEY: /path/to/key.pem
```

### Configure Services to Use HTTPS:

```bash
# Update service to use HTTPS
curl -X PATCH http://localhost:8001/services/hotel-service \
  --data "protocol=https" \
  --data "host=hotel-service" \
  --data "port=8087"
```

## Security Headers Configuration

### Add Security Headers Plugin:

```bash
curl -X POST http://localhost:8001/plugins \
  --data "name=response-transformer" \
  --data "config.add.headers=Strict-Transport-Security:max-age=31536000; includeSubDomains" \
  --data "config.add.headers=X-Frame-Options:DENY" \
  --data "config.add.headers=X-Content-Type-Options:nosniff" \
  --data "config.add.headers=X-XSS-Protection:1; mode=block" \
  --data "config.add.headers=Content-Security-Policy:default-src 'self'"
```

## Certificate Renewal (Let's Encrypt)

### Automatic Renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e

# Add this line (runs twice daily)
0 0,12 * * * certbot renew --quiet --post-hook "docker-compose restart kong"
```

## Verification

### Test HTTPS:

```bash
# Test HTTPS endpoint
curl -k https://localhost:8443

# Check certificate
openssl s_client -connect localhost:8443 -showcerts

# Test security headers
curl -I https://yourdomain.com
```

### SSL Labs Test:
- Visit: https://www.ssllabs.com/ssltest/
- Enter your domain
- Aim for A+ rating

## Production Checklist

- [ ] SSL certificate obtained and configured
- [ ] HTTP to HTTPS redirect enabled
- [ ] HSTS header configured (max-age=31536000)
- [ ] Security headers added (CSP, X-Frame-Options, etc.)
- [ ] Certificate auto-renewal configured
- [ ] SSL Labs test passed (A+ rating)
- [ ] All service URLs updated to HTTPS
- [ ] CORS origins updated to HTTPS
- [ ] Tested in staging environment

## Troubleshooting

### Common Issues:

1. **Certificate not found:**
   - Check file paths in docker-compose.yml
   - Ensure certificates are readable by Kong container
   - Verify volume mounts

2. **Mixed content warnings:**
   - Ensure all resources loaded over HTTPS
   - Update hardcoded HTTP URLs to HTTPS

3. **Certificate expired:**
   - Check expiration: `openssl x509 -in cert.pem -noout -dates`
   - Renew with certbot: `sudo certbot renew`

4. **Port conflicts:**
   - Ensure ports 80 and 443 are not in use
   - Check firewall rules

## Environment Variables

Add to `.env`:

```bash
# HTTPS Configuration
ENABLE_HTTPS=true
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Domain
DOMAIN_NAME=ticketkatum.com
WWW_DOMAIN=www.ticketkatum.com
```

## References

- Kong SSL Documentation: https://docs.konghq.com/gateway/latest/reference/configuration/#ssl
- Let's Encrypt: https://letsencrypt.org/
- SSL Labs: https://www.ssllabs.com/ssltest/
- OWASP Security Headers: https://owasp.org/www-project-secure-headers/
