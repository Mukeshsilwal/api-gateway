# Ticket Katum - Microservices Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)

Multi-domain booking platform built with microservices architecture supporting bus ticketing, hotel reservations, and payment processing.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kong API Gateway                      │
│                    (Port 8000/8443)                      │
└────────────────┬────────────────────────┬────────────────┘
                 │                        │
         ┌───────▼────────┐      ┌───────▼────────┐
         │   Web BFF      │      │  Mobile BFF    │
         │   (Port 8081)  │      │  (Port 8082)   │
         └───────┬────────┘      └───────┬────────┘
                 │                        │
    ┌────────────┴────────────────────────┴────────────┐
    │                                                   │
┌───▼────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌─────────┐
│  Auth  │  │ Book │  │ Bus  │  │Hotel │  │ Payment │
│  :8089 │  │ :8091│  │ :8083│  │ :8087│  │  :8092  │
└───┬────┘  └──┬───┘  └──┬───┘  └──┬───┘  └────┬────┘
    │          │         │         │           │
    └──────────┴─────────┴─────────┴───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │PostgreSQL│    │  Redis  │    │RabbitMQ │
    │  :5432   │    │  :6379  │    │  :5672  │
    └──────────┘    └─────────┘    └─────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17+ (for local development)
- Maven 3.8+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ticket-Katum-gateway
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment**
   ```bash
   docker-compose ps
   curl http://localhost:8081/actuator/health
   ```

📖 **Full setup guide:** See [QUICKSTART.md](QUICKSTART.md)

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| **Kong Gateway** | 8000 | API Gateway & routing |
| **Web BFF** | 8081 | Backend for web frontend |
| **Mobile BFF** | 8082 | Backend for mobile apps |
| **Auth Service** | 8089 | Authentication & JWT |
| **Booking Service** | 8091 | Booking management |
| **Bus Service** | 8083 | Bus ticketing |
| **Hotel Service** | 8087 | Hotel reservations |
| **Payment Service** | 8092 | Payment processing |

## 🛠️ Technology Stack

- **Backend:** Spring Boot 3.2.5, Java 17
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Messaging:** RabbitMQ 3, Kafka
- **API Gateway:** Kong 3.4
- **Monitoring:** Prometheus, Grafana, Jaeger
- **Logging:** ELK Stack

## 📊 Monitoring

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)
- **Jaeger:** http://localhost:16686
- **Kibana:** http://localhost:5601
- **RabbitMQ:** http://localhost:15672

## 🔒 Security

- ✅ Environment-based secrets management
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Rate limiting via Kong
- ✅ Circuit breakers (Resilience4j)

## 📚 Documentation

- [Architecture Analysis](docs/architecture_analysis.md) - Comprehensive system overview
- [Implementation Plan](docs/implementation_plan.md) - Production readiness roadmap
- [Quick Start Guide](QUICKSTART.md) - Developer setup
- [API Documentation](http://localhost:8081/swagger-ui.html) - OpenAPI/Swagger

## 🏗️ Development

### Build

```bash
# Build all services
mvn clean package

# Build specific service
cd services/hotel-service
mvn clean package
```

### Run Locally

```bash
# Start infrastructure only
docker-compose up -d postgres redis rabbitmq kafka

# Run service locally
cd services/hotel-service
mvn spring-boot:run
```

### Testing

```bash
# Unit tests
mvn test

# Integration tests
mvn verify -P integration-tests
```

## 🚢 Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Kubernetes (Production)
```bash
kubectl apply -f k8s/
```

See [Implementation Plan](docs/implementation_plan.md) for detailed deployment strategies.

## 🗺️ Roadmap

- [x] Phase 1: Security hardening
- [ ] Phase 2: Monitoring & observability
- [ ] Phase 3: Resilience patterns
- [ ] Phase 4: Database optimization
- [ ] Phase 5: Caching strategy
- [ ] Phase 6: Service discovery
- [ ] Phase 7: Kubernetes deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Architecture:** Microservices with BFF pattern
- **Deployment:** Docker, Kubernetes
- **Monitoring:** Full observability stack

## 📞 Support

- **Documentation:** See `/docs` directory
- **Issues:** GitHub Issues
- **Wiki:** Project Wiki

---

**Status:** 🟡 Development → Production Ready (Phase 1/7 Complete)

**Last Updated:** December 2024
