# Build all services locally
Write-Host "Building Docker images..." -ForegroundColor Green

# Array of services map: ServiceName -> Dockerfile path
$services = @{
    "web-bff"         = "bff/web-bff/Dockerfile"
    "booking-service" = "services/booking-service/Dockerfile"
    "payment-service" = "services/payment-service/Dockerfile"
    "hotel-service"   = "services/hotel-service/Dockerfile"
    "auth-service"    = "services/auth-service/Dockerfile"
    "market-service"  = "services/market-service/Dockerfile"
    "bus-service"     = "services/bus-service/Dockerfile"
}

foreach ($service in $services.Keys) {
    $dockerfile = $services[$service]
    Write-Host "Building $service..." -ForegroundColor Yellow
    
    if (Test-Path $dockerfile) {
        docker build -t ticketkatum/$service:latest -f $dockerfile .
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to build $service" -ForegroundColor Red
        }
        else {
            Write-Host "Successfully built $service" -ForegroundColor Green
        }
    }
    else {
        Write-Host "Dockerfile not found for $service at $dockerfile" -ForegroundColor Red
    }
}

Write-Host "Build process completed." -ForegroundColor Green
