# Dockerize All Services Script
$ErrorActionPreference = "Stop"
$root = Get-Location
$backendRoot = "$root\backend"
$frontendRoot = "$root\frontend"
$dockerUsername = "mukeshsilwal"
$version = "latest"

# 1. Define Backend Services
# Paths are relative to 'backend' directory
$backendServices = @(
    @{ Name = "eureka-server"; Path = "services/eureka-server"; Port = 8761 },
    @{ Name = "gateway"; Path = "gateway"; Port = 8222 },
    @{ Name = "auth-service"; Path = "services/auth-service"; Port = 8081 },
    @{ Name = "booking-service"; Path = "services/booking-service"; Port = 8082 },
    @{ Name = "payment-service"; Path = "services/payment-service"; Port = 8083 },
    @{ Name = "web-bff"; Path = "services/web-bff"; Port = 8084 },
    @{ Name = "hotel-service"; Path = "services/hotel-service"; Port = 8085 },
    @{ Name = "bus-service"; Path = "services/bus-service"; Port = 8086 },
    @{ Name = "market-service"; Path = "services/market-service"; Port = 8087 },
    @{ Name = "event-service"; Path = "services/event-service"; Port = 8088 },
    @{ Name = "trip-service"; Path = "services/trip-service"; Port = 8089 },
    @{ Name = "guide-service"; Path = "services/guide-service"; Port = 8090 },
    @{ Name = "image-service"; Path = "services/image-service"; Port = 8091 },
    @{ Name = "journey-service"; Path = "services/journey-service"; Port = 8092 },
    @{ Name = "sos-service"; Path = "services/sos-service"; Port = 8093 },
    @{ Name = "timeline-service"; Path = "services/timeline-service"; Port = 8094 },
    @{ Name = "tracking-service"; Path = "services/tracking-service"; Port = 8095 },
    @{ Name = "ai-service"; Path = "services/ai-service"; Port = 8096 },
    @{ Name = "alert-service"; Path = "services/alert-service"; Port = 8097 },
    @{ Name = "analytics-service"; Path = "services/analytics-service"; Port = 8098 }
)

function Create-Java-Dockerfile ($name, $path, $port) {
    $dockerfile = "$backendRoot\$path\Dockerfile"
    $parentDir = Split-Path $dockerfile
    if (-not (Test-Path $parentDir)) {
        Write-Host "Skipping $name (Directory not found: $parentDir)"
        return $false
    }
    
    if (-not (Test-Path $dockerfile)) {
        Write-Host "Creating Dockerfile for $name at $dockerfile"
        $content = @"
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY $path/pom.xml ./$path/pom.xml
RUN chmod +x mvnw && ./mvnw -N install -DskipTests
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B
RUN ./mvnw -f $path/pom.xml dependency:go-offline -B
COPY $path/src ./$path/src
RUN ./mvnw -f $path/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder /app/$path/target/*.jar app.jar
EXPOSE $port
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
"@
        Set-Content -Path $dockerfile -Value $content
    }
    return $true
}

# 2. Build Backend Services
Write-Host "Entering Backend Directory..."
Push-Location $backendRoot

# Create Dockerfiles
foreach ($svc in $backendServices) {
    Create-Java-Dockerfile -name $svc.Name -path $svc.Path -port $svc.Port
}

# Build Images
foreach ($svc in $backendServices) {
    $imageName = "$dockerUsername/$($svc.Name):$version"
    $dockerfilePath = "$($svc.Path)/Dockerfile"
    
    if (Test-Path $dockerfilePath) {
        Write-Host "Building Docker Image: $imageName"
        # Check if image exists to avoid rebuild? No, force rebuild or rely on cache.
        docker build -t $imageName -f $dockerfilePath .
        if ($LASTEXITCODE -ne 0) { Write-Error "Build failed for $svc.Name" }
        
        Write-Host "Pushing Docker Image: $imageName"
        docker push $imageName
    }
}
Pop-Location

# 3. Build Frontend
Write-Host "Entering Frontend Directory..."
Push-Location $frontendRoot

$frontendImage = "$dockerUsername/frontend:$version"
Write-Host "Building Docker Image: $frontendImage"
docker build -t $frontendImage .
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed" }

Write-Host "Pushing Frontend Image..."
docker push $frontendImage

Pop-Location
Write-Host "All services processed."
