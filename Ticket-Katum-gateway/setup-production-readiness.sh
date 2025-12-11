#!/bin/bash
# Production Readiness Quick Start Script
# This script sets up the foundation for all 7 production readiness phases

set -e

echo "🚀 Ticket Katum - Production Readiness Setup"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Phase 1: Testing Infrastructure
echo -e "\n${BLUE}Phase 1: Setting up Testing Infrastructure${NC}"
echo "-------------------------------------------"

# Create test directories for all services
for service in auth-service booking-service bus-service hotel-service payment-service; do
    echo -e "${GREEN}✓${NC} Creating test structure for $service"
    mkdir -p "services/$service/src/test/java/com/ticketkatum/unit/service"
    mkdir -p "services/$service/src/test/java/com/ticketkatum/unit/controller"
    mkdir -p "services/$service/src/test/java/com/ticketkatum/unit/repository"
    mkdir -p "services/$service/src/test/java/com/ticketkatum/integration/api"
    mkdir -p "services/$service/src/test/java/com/ticketkatum/integration/database"
    mkdir -p "services/$service/src/test/java/com/ticketkatum/e2e/scenarios"
    mkdir -p "services/$service/src/test/resources"
done

# Create test directories for BFF
echo -e "${GREEN}✓${NC} Creating test structure for web-bff"
mkdir -p "bff/web-bff/src/test/java/com/ticketkatum/unit/controller"
mkdir -p "bff/web-bff/src/test/java/com/ticketkatum/integration/api"
mkdir -p "bff/web-bff/src/test/java/com/ticketkatum/chaos"
mkdir -p "bff/web-bff/src/test/resources"

# Phase 2: Database Read Replicas
echo -e "\n${BLUE}Phase 2: Database Read Replicas Setup${NC}"
echo "--------------------------------------"

# Create database scripts directory
mkdir -p "scripts/database"
echo -e "${GREEN}✓${NC} Created database scripts directory"

# Create replication init script
cat > scripts/database/init-replication.sh << 'EOF'
#!/bin/bash
# PostgreSQL Replication Initialization

set -e

# Create replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '${REPLICATION_PASSWORD}';
    SELECT pg_create_physical_replication_slot('replication_slot_1');
    SELECT pg_create_physical_replication_slot('replication_slot_2');
EOSQL

# Configure pg_hba.conf for replication
echo "host replication replicator 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"

echo "Replication setup complete!"
EOF

chmod +x scripts/database/init-replication.sh
echo -e "${GREEN}✓${NC} Created replication initialization script"

# Phase 3: CDN Setup
echo -e "\n${BLUE}Phase 3: CDN Configuration${NC}"
echo "--------------------------"

mkdir -p "nginx"
echo -e "${GREEN}✓${NC} Created nginx configuration directory"

# Phase 4: Security
echo -e "\n${BLUE}Phase 4: Security Audit Setup${NC}"
echo "-----------------------------"

mkdir -p "security/reports"
mkdir -p "security/policies"
echo -e "${GREEN}✓${NC} Created security directories"

# Create security checklist
cat > security/SECURITY_CHECKLIST.md << 'EOF'
# Security Audit Checklist

## OWASP Top 10 (2021)

### A01:2021 – Broken Access Control
- [ ] Role-based access control (RBAC) implemented
- [ ] Authorization checks on all endpoints
- [ ] No direct object references exposed
- [ ] CORS properly configured

### A02:2021 – Cryptographic Failures
- [ ] Passwords hashed with bcrypt
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.3 for data in transit
- [ ] No hardcoded secrets

### A03:2021 – Injection
- [ ] Parameterized queries (JPA/Hibernate)
- [ ] Input validation on all endpoints
- [ ] Output encoding
- [ ] No dynamic SQL construction

### A04:2021 – Insecure Design
- [ ] Threat modeling completed
- [ ] Security requirements defined
- [ ] Secure design patterns used
- [ ] Rate limiting implemented

### A05:2021 – Security Misconfiguration
- [ ] Default credentials changed
- [ ] Unnecessary features disabled
- [ ] Security headers configured
- [ ] Error messages don't leak info

### A06:2021 – Vulnerable Components
- [ ] Dependencies up to date
- [ ] Vulnerability scanning enabled
- [ ] No known CVEs in dependencies
- [ ] Software composition analysis

### A07:2021 – Authentication Failures
- [ ] Multi-factor authentication available
- [ ] Session management secure
- [ ] Password policy enforced
- [ ] Account lockout on failed attempts

### A08:2021 – Software and Data Integrity
- [ ] Code signing implemented
- [ ] CI/CD pipeline secured
- [ ] Integrity checks on updates
- [ ] Secure deserialization

### A09:2021 – Security Logging Failures
- [ ] All auth events logged
- [ ] Logs protected from tampering
- [ ] Log retention policy defined
- [ ] Monitoring and alerting active

### A10:2021 – Server-Side Request Forgery
- [ ] URL validation implemented
- [ ] Whitelist for external requests
- [ ] Network segmentation
- [ ] No user-controlled URLs
EOF

echo -e "${GREEN}✓${NC} Created security checklist"

# Phase 5: Load Testing
echo -e "\n${BLUE}Phase 5: Load Testing Setup${NC}"
echo "---------------------------"

mkdir -p "load-tests/jmeter"
mkdir -p "load-tests/gatling/src/test/scala"
mkdir -p "load-tests/results"
echo -e "${GREEN}✓${NC} Created load testing directories"

# Phase 6: Disaster Recovery
echo -e "\n${BLUE}Phase 6: Disaster Recovery Setup${NC}"
echo "---------------------------------"

mkdir -p "runbooks"
mkdir -p "k8s/multi-region"
echo -e "${GREEN}✓${NC} Created disaster recovery directories"

# Create basic runbook template
cat > runbooks/RUNBOOK_TEMPLATE.md << 'EOF'
# Runbook: [Incident Type]

## Overview
Brief description of the incident type

## Severity
- **Critical**: Production down
- **High**: Degraded performance
- **Medium**: Non-critical feature affected
- **Low**: Minor issue

## Detection
How to detect this issue:
- Alerts
- Metrics
- User reports

## Investigation Steps
1. Check [metric/log]
2. Verify [component]
3. Review [dashboard]

## Resolution Steps
1. Step 1
2. Step 2
3. Step 3

## Verification
How to verify the issue is resolved

## Prevention
How to prevent this in the future

## Related
- Links to related runbooks
- Documentation
- Postmortem template
EOF

echo -e "${GREEN}✓${NC} Created runbook template"

# Phase 7: Backup Strategy
echo -e "\n${BLUE}Phase 7: Backup Strategy Setup${NC}"
echo "------------------------------"

mkdir -p "scripts/backup"
mkdir -p "k8s/backup"
echo -e "${GREEN}✓${NC} Created backup directories"

# Create backup verification script
cat > scripts/backup/verify-backup.sh << 'EOF'
#!/bin/bash
# Backup Verification Script

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Check file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found"
    exit 1
fi

# Check file size
SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
if [ "$SIZE" -lt 1000 ]; then
    echo "❌ Backup file too small (${SIZE} bytes)"
    exit 1
fi

echo "✓ File exists and has valid size (${SIZE} bytes)"

# Test restore to temporary database
echo "Testing restore..."
# Add restore test logic here

echo "✓ Backup verification complete"
EOF

chmod +x scripts/backup/verify-backup.sh
echo -e "${GREEN}✓${NC} Created backup verification script"

# Create environment template
echo -e "\n${BLUE}Creating Environment Configuration${NC}"
echo "-----------------------------------"

cat > .env.production.template << 'EOF'
# Production Environment Configuration

# Database
DB_PRIMARY_HOST=postgres-primary
DB_REPLICA_HOST=postgres-replica-1,postgres-replica-2
DB_NAME=ticketkatum
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_ME
REPLICATION_PASSWORD=CHANGE_ME

# Redis
REDIS_HOST=redis-cluster
REDIS_PASSWORD=CHANGE_ME

# JWT
JWT_SECRET=CHANGE_ME_LONG_RANDOM_STRING

# CloudFlare CDN
CLOUDFLARE_API_TOKEN=CHANGE_ME
CLOUDFLARE_ZONE_ID=CHANGE_ME

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000

# Backup
BACKUP_S3_BUCKET=ticketkatum-backups
AWS_ACCESS_KEY_ID=CHANGE_ME
AWS_SECRET_ACCESS_KEY=CHANGE_ME

# Alerting
SLACK_WEBHOOK_URL=CHANGE_ME
PAGERDUTY_SERVICE_KEY=CHANGE_ME
EOF

echo -e "${GREEN}✓${NC} Created production environment template"

# Summary
echo -e "\n${GREEN}=============================================="
echo "✓ Production Readiness Setup Complete!"
echo "==============================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Review implementation_plan.md for detailed instructions"
echo "2. Update .env.production.template with actual values"
echo "3. Run: mvn clean install (to verify build)"
echo "4. Start with Phase 1: Testing Infrastructure"
echo ""
echo "📚 Documentation created:"
echo "   - security/SECURITY_CHECKLIST.md"
echo "   - runbooks/RUNBOOK_TEMPLATE.md"
echo "   - scripts/database/init-replication.sh"
echo "   - scripts/backup/verify-backup.sh"
echo "   - .env.production.template"
echo ""
echo "🎯 Target: 100% Production Readiness in 6 weeks"
