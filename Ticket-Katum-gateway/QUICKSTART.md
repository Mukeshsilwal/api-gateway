# Quick Start Guide - Ticket Katum Microservices

## Prerequisites

- Docker & Docker Compose
- Java 17+ (for local development)
- Maven 3.8+ (for building)

## Setup Instructions

### 1. Clone and Navigate
```bash
cd "c:\New folder\Ticket-Katum-gateway"
```

### 2. Configure Environment Variables

```bash
# Copy the template
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Never commit .env to Git!
```

**Minimum Required Variables:**
```env
# Database
DB_USERNAME=ticketkatum
DB_PASSWORD=your_secure_password

# Kong
KONG_DB_PASSWORD=your_kong_password

# Redis
REDIS_PASSWORD=your_redis_password

# RabbitMQ
RABBITMQ_USERNAME=ticketkatum
RABBITMQ_PASSWORD=your_rabbitmq_password

# Security
JWT_SECRET=$(openssl rand -base64 64)

# CORS (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 3. Start Infrastructure

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Services

**Check Health:**
```bash
# Kong Gateway
curl http://localhost:8001/status

# Web BFF
curl http://localhost:8081/actuator/health

# Hotel Service
curl http://localhost:8087/actuator/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
open http://localhost:3000  # admin/admin
```

**Service Ports:**
- Kong Gateway: 8000 (HTTP), 8443 (HTTPS), 8001 (Admin)
- Web BFF: 8081
- Mobile BFF: 8082
- Auth Service: 8089 (will be updated)
- Booking Service: 8091
- Bus Service: 8083
- Hotel Service: 8087
- Payment Service: 8092
- Prometheus: 9090
- Grafana: 3000
- Jaeger UI: 16686
- Kibana: 5601
- RabbitMQ Management: 15672

### 5. Build Services Locally (Optional)

```bash
# Build all services
mvn clean package

# Build specific service
cd services/hotel-service
mvn clean package
```

## Common Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# View logs for specific service
docker-compose logs -f hotel-service

# Execute command in container
docker-compose exec postgres psql -U ticketkatum -d hotel_db
```

## Troubleshooting

### Services won't start
```bash
# Check if ports are already in use
netstat -ano | findstr :8080

# Check Docker logs
docker-compose logs
```

### Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U ticketkatum -d ticketkatum
```

### Environment variables not loading
```bash
# Verify .env file exists
ls -la .env

# Check if variables are set
docker-compose config
```

## Development Workflow

1. **Make code changes**
2. **Rebuild service:**
   ```bash
   docker-compose up -d --build hotel-service
   ```
3. **Check logs:**
   ```bash
   docker-compose logs -f hotel-service
   ```
4. **Test endpoints**

## Production Deployment

For production deployment, see:
- `architecture_analysis.md` - Full architecture overview
- `implementation_plan.md` - Detailed deployment plan
- Phase 7 in implementation plan - Kubernetes deployment

## Getting Help

- Check logs: `docker-compose logs -f [service-name]`
- View health: `curl http://localhost:[port]/actuator/health`
- Prometheus metrics: `http://localhost:9090`
- Grafana dashboards: `http://localhost:3000`
