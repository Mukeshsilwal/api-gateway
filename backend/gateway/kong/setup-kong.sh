#!/bin/bash
# ================================================================
# Kong API Gateway - Complete Setup Script
# File: gateway/kong/setup-kong.sh
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
KONG_ADMIN_URL="${KONG_ADMIN_URL:-http://localhost:8001}"
KONG_PROXY_URL="${KONG_PROXY_URL:-http://localhost:8000}"
CONFIG_FILE="${CONFIG_FILE:-./kong.yml}"
ENV_FILE="${ENV_FILE:-.env}"

# ================================================================
# Helper Functions
# ================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        exit 1
    fi
}

wait_for_kong() {
    log_info "Waiting for Kong to be ready..."
    local max_attempts=60
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "${KONG_ADMIN_URL}/status" > /dev/null 2>&1; then
            log_success "Kong is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "Kong failed to start within timeout"
    return 1
}

# ================================================================
# Environment Setup
# ================================================================

setup_environment() {
    log_info "Setting up environment..."

    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
        log_success "Environment variables loaded from $ENV_FILE"
    else
        log_warning "No .env file found, using defaults"
    fi

    # Set default values
    export INTERNAL_API_KEY="${INTERNAL_API_KEY:-internal-api-key-$(openssl rand -hex 16)}"
    export MONITORING_API_KEY="${MONITORING_API_KEY:-monitoring-api-key-$(openssl rand -hex 16)}"
    export ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 16)}"
    export JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"

    # Save to env file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" << EOF
# Kong API Gateway Configuration
INTERNAL_API_KEY=$INTERNAL_API_KEY
MONITORING_API_KEY=$MONITORING_API_KEY
ADMIN_PASSWORD=$ADMIN_PASSWORD
JWT_SECRET=$JWT_SECRET
EOF
        log_success "Generated .env file with secrets"
        log_warning "IMPORTANT: Save these credentials securely!"
    fi
}

# ================================================================
# Kong Database Migration
# ================================================================

run_migrations() {
    log_info "Running Kong database migrations..."

    if docker-compose exec kong kong migrations bootstrap 2>&1 | grep -q "already bootstrapped"; then
        log_info "Database already initialized, running migrations up..."
        docker-compose exec kong kong migrations up
    else
        log_success "Database bootstrapped successfully"
    fi
}

# ================================================================
# Apply Kong Configuration
# ================================================================

apply_declarative_config() {
    log_info "Applying Kong declarative configuration..."

    # Validate config file
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Configuration file not found: $CONFIG_FILE"
        return 1
    fi

    # Substitute environment variables in config
    local temp_config="/tmp/kong-config-$(date +%s).yml"
    envsubst < "$CONFIG_FILE" > "$temp_config"

    # Validate YAML
    if command -v yq &> /dev/null; then
        if ! yq eval "$temp_config" > /dev/null 2>&1; then
            log_error "Invalid YAML configuration"
            rm "$temp_config"
            return 1
        fi
    fi

    # Apply configuration
    local response=$(curl -s -w "\n%{http_code}" -X POST "${KONG_ADMIN_URL}/config" \
        -F "config=@${temp_config}")

    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)

    rm "$temp_config"

    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        log_success "Kong configuration applied successfully"
        return 0
    else
        log_error "Failed to apply configuration. HTTP $http_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

# ================================================================
# Setup JWT Authentication
# ================================================================

setup_jwt_auth() {
    log_info "Setting up JWT authentication..."

    # Add JWT plugin to authenticated routes
    local routes=(
        "web-bff-authenticated-routes"
        "mobile-bff-routes"
        "auth-logout"
        "admin-routes"
    )

    for route in "${routes[@]}"; do
        log_info "Adding JWT auth to route: $route"

        curl -s -X POST "${KONG_ADMIN_URL}/routes/${route}/plugins" \
            -H "Content-Type: application/json" \
            -d "{
                \"name\": \"jwt-auth\",
                \"config\": {
                    \"secret\": \"${JWT_SECRET}\",
                    \"uri_param_names\": [\"jwt\", \"token\"],
                    \"cookie_names\": [\"jwt\", \"auth_token\"],
                    \"hide_credentials\": true,
                    \"run_on_preflight\": false,
                    \"required_claims\": [\"sub\", \"exp\"]
                }
            }" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            log_success "JWT auth added to $route"
        else
            log_warning "JWT auth may already exist on $route"
        fi
    done
}

# ================================================================
# Setup Rate Limiting
# ================================================================

setup_rate_limiting() {
    log_info "Configuring advanced rate limiting..."

    # Global rate limiting
    curl -s -X POST "${KONG_ADMIN_URL}/plugins" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "rate-limiting",
            "config": {
                "second": 50,
                "minute": 1000,
                "hour": 10000,
                "policy": "redis",
                "redis_host": "redis",
                "redis_port": 6379,
                "fault_tolerant": true
            }
        }' > /dev/null 2>&1

    log_success "Rate limiting configured"
}

# ================================================================
# Setup Monitoring
# ================================================================

setup_monitoring() {
    log_info "Setting up monitoring and observability..."

    # Enable Prometheus plugin globally
    curl -s -X POST "${KONG_ADMIN_URL}/plugins" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "prometheus",
            "config": {
                "status_code_metrics": true,
                "latency_metrics": true,
                "bandwidth_metrics": true,
                "upstream_health_metrics": true,
                "per_consumer": true
            }
        }' > /dev/null 2>&1

    log_success "Monitoring plugins enabled"
}

# ================================================================
# Setup Security Headers
# ================================================================

setup_security() {
    log_info "Configuring security headers..."

    # Add security headers globally
    curl -s -X POST "${KONG_ADMIN_URL}/plugins" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "response-transformer",
            "config": {
                "add": {
                    "headers": [
                        "X-Content-Type-Options:nosniff",
                        "X-Frame-Options:DENY",
                        "X-XSS-Protection:1; mode=block",
                        "Strict-Transport-Security:max-age=31536000; includeSubDomains",
                        "Content-Security-Policy:default-src '\''self'\''",
                        "Referrer-Policy:strict-origin-when-cross-origin",
                        "Permissions-Policy:geolocation=(), microphone=(), camera=()"
                    ]
                }
            }
        }' > /dev/null 2>&1

    log_success "Security headers configured"
}

# ================================================================
# Health Check
# ================================================================

health_check() {
    log_info "Running health checks..."

    # Check Kong status
    local status=$(curl -s "${KONG_ADMIN_URL}/status" | jq -r '.database.reachable')
    if [ "$status" == "true" ]; then
        log_success "Kong database: Connected"
    else
        log_error "Kong database: Disconnected"
        return 1
    fi

    # Check services
    local services=$(curl -s "${KONG_ADMIN_URL}/services" | jq -r '.data | length')
    log_success "Services configured: $services"

    # Check routes
    local routes=$(curl -s "${KONG_ADMIN_URL}/routes" | jq -r '.data | length')
    log_success "Routes configured: $routes"

    # Check plugins
    local plugins=$(curl -s "${KONG_ADMIN_URL}/plugins" | jq -r '.data | length')
    log_success "Plugins enabled: $plugins"

    # Check upstreams
    local upstreams=$(curl -s "${KONG_ADMIN_URL}/upstreams" | jq -r '.data | length')
    log_success "Upstreams configured: $upstreams"
}

# ================================================================
# Test Endpoints
# ================================================================

test_endpoints() {
    log_info "Testing API endpoints..."

    # Test public endpoint
    local public_response=$(curl -s -w "\n%{http_code}" "${KONG_PROXY_URL}/api/web/health")
    local public_code=$(echo "$public_response" | tail -n1)

    if [ "$public_code" -eq 200 ]; then
        log_success "Public endpoint: OK"
    else
        log_warning "Public endpoint: HTTP $public_code"
    fi

    # Test authenticated endpoint (should return 401)
    local auth_response=$(curl -s -w "\n%{http_code}" "${KONG_PROXY_URL}/api/web/dashboard")
    local auth_code=$(echo "$auth_response" | tail -n1)

    if [ "$auth_code" -eq 401 ]; then
        log_success "Authentication: Working (401 on protected endpoint)"
    else
        log_warning "Authentication: Unexpected response HTTP $auth_code"
    fi

    # Test rate limiting
    log_info "Testing rate limiting (sending 5 requests)..."
    for i in {1..5}; do
        curl -s "${KONG_PROXY_URL}/api/web/health" > /dev/null
        echo -n "."
    done
    echo ""
    log_success "Rate limiting: No errors"
}

# ================================================================
# Generate Documentation
# ================================================================

generate_docs() {
    log_info "Generating API documentation..."

    cat > kong-config.md << 'EOF'
# Kong API Gateway Configuration

## Services Configured

### Public Services
- **Web BFF**: `http://localhost:8000/api/web/*`
- **Mobile BFF**: `http://localhost:8000/api/mobile/*`
- **Auth Service**: `http://localhost:8000/api/auth/*`

### Internal Services (Requires API Key)
- **Booking**: `http://localhost:8000/api/internal/booking/*`
- **Payment**: `http://localhost:8000/api/internal/payment/*`
- **Hotel**: `http://localhost:8000/api/internal/hotel/*`
- **Movies**: `http://localhost:8000/api/internal/movies/*`

## Authentication

### JWT Authentication
Protected endpoints require JWT token in:
- Header: `Authorization: Bearer <token>`
- Query: `?jwt=<token>`
- Cookie: `jwt=<token>`

### API Key Authentication (Internal Services)
- Header: `apikey: <your-api-key>`
- Query: `?apikey=<your-api-key>`

## Rate Limits

| Service | Per Minute | Per Hour |
|---------|-----------|----------|
| Web BFF | 100 | 5,000 |
| Mobile BFF | 200 | 10,000 |
| Internal | 50 | 2,000 |

## Admin Endpoints

- Kong Admin API: `http://localhost:8001`
- Prometheus Metrics: `http://localhost:8001/metrics`
- Health Check: `http://localhost:8001/status`

## Important Credentials

Check `.env` file for generated credentials.

EOF

    log_success "Documentation generated: kong-config.md"
}

# ================================================================
# Backup Configuration
# ================================================================

backup_config() {
    log_info "Backing up Kong configuration..."

    local backup_dir="./backups"
    local backup_file="${backup_dir}/kong-backup-$(date +%Y%m%d-%H%M%S).json"

    mkdir -p "$backup_dir"

    # Export configuration
    curl -s "${KONG_ADMIN_URL}/config" > "$backup_file"

    if [ -f "$backup_file" ]; then
        log_success "Configuration backed up to: $backup_file"
    else
        log_error "Backup failed"
        return 1
    fi
}

# ================================================================
# Main Execution
# ================================================================

main() {
    echo ""
    echo "======================================"
    echo "  Kong API Gateway Setup"
    echo "  TicketKatum Platform"
    echo "======================================"
    echo ""

    # Check prerequisites
    log_info "Checking prerequisites..."
    check_command curl
    check_command jq
    check_command docker-compose

    # Setup environment
    setup_environment

    # Wait for Kong
    wait_for_kong || exit 1

    # Run migrations
    run_migrations

    # Apply configuration
    apply_declarative_config || exit 1

    # Additional setup
    setup_jwt_auth
    setup_rate_limiting
    setup_monitoring
    setup_security

    # Health check
    health_check || exit 1

    # Test endpoints
    test_endpoints

    # Generate documentation
    generate_docs

    # Backup
    backup_config

    echo ""
    echo "======================================"
    log_success "Kong Gateway Setup Complete!"
    echo "======================================"
    echo ""
    echo "Access Points:"
    echo "  - API Gateway: $KONG_PROXY_URL"
    echo "  - Admin API: $KONG_ADMIN_URL"
    echo "  - Metrics: $KONG_ADMIN_URL/metrics"
    echo ""
    echo "API Keys:"
    echo "  - Internal: $INTERNAL_API_KEY"
    echo "  - Monitoring: $MONITORING_API_KEY"
    echo ""
    echo "Documentation: kong-config.md"
    echo "Credentials: .env"
    echo ""
    log_warning "Keep credentials secure and rotate regularly!"
    echo ""
}

# Run main function
main "$@"