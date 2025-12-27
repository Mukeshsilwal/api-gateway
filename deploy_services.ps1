$ErrorActionPreference = "Stop"
$DockerUsername = "mukeshsilwal"
$Version = "latest"

Write-Host "Starting deployment for user: $DockerUsername" -ForegroundColor Cyan

# Check for Docker Login
Write-Host "Verifying Docker login..."
try {
    # This is a basic check. 'docker info' usually shows registry info, but explicit login check is harder without interaction.
    # We'll assume the user followed the SOP and is logged in, or the push will fail.
    docker info | Out-Null
}
catch {
    Write-Error "Docker is not running or not accessible."
}

function Build-And-Push {
    param (
        [string]$ServiceName,
        [string]$Dockerfile,
        [string]$Context
    )

    $ImageName = "$DockerUsername/$($ServiceName):$Version"
    Write-Host "--------------------------------------------------"
    Write-Host "Processing Service: $ServiceName" -ForegroundColor Yellow
    Write-Host "Dockerfile: $Dockerfile"
    Write-Host "Context: $Context"
    
    # Build
    Write-Host "Building $ImageName..."
    try {
        docker build -f $Dockerfile -t $ImageName $Context
        if ($LASTEXITCODE -ne 0) { throw "Build failed for $ServiceName" }
    }
    catch {
        Write-Error "Failed to build $ServiceName. Error: $_"
        return
    }

    # Push
    Write-Host "Pushing $ImageName..."
    try {
        docker push $ImageName
        if ($LASTEXITCODE -ne 0) { throw "Push failed for $ServiceName" }
        Write-Host "Successfully deployed $ServiceName" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to push $ServiceName. Please ensure you are logged in using 'docker login -u $DockerUsername'. Error: $_"
    }
}

# Backend Services (Context is always 'backend/')
$BackendContext = "./backend"

# 1. Gateway
Build-And-Push -ServiceName "gateway" -Dockerfile "$BackendContext/gateway/Dockerfile" -Context $BackendContext

# 2. Eureka Server
Build-And-Push -ServiceName "eureka-server" -Dockerfile "$BackendContext/services/eureka-server/Dockerfile" -Context $BackendContext

# 3. Standard Microservices
$Microservices = @(
    "auth-service",
    "booking-service",
    "payment-service",
    "web-bff",
    "hotel-service",
    "bus-service",
    "market-service",
    "event-service"
)

foreach ($Service in $Microservices) {
    Build-And-Push -ServiceName $Service -Dockerfile "$BackendContext/services/$Service/Dockerfile" -Context $BackendContext
}

# Frontend
Build-And-Push -ServiceName "frontend" -Dockerfile "./frontend/Dockerfile" -Context "./frontend"

Write-Host "--------------------------------------------------"
Write-Host "Deployment script finished." -ForegroundColor Cyan
