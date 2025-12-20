$ErrorActionPreference = "Continue"
$services = @('web-bff', 'payment-service', 'hotel-service', 'bus-service', 'market-service', 'auth-service', 'booking-service', 'eureka-server', 'event-service')
$registry = "572638914672.dkr.ecr.us-east-1.amazonaws.com"
$region = "us-east-1"

Write-Host "Logging into ECR..."
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $registry

Set-Location "c:\project\api-gateway\backend"

foreach ($service in $services) {
    Write-Host "`n----------------------------------------"
    Write-Host "Processing $service..."
    $dockerfile = "services/$service/Dockerfile"
    $imageTag = "$registry/$service:latest"
    
    Write-Host "Building $service..."
    # using 'call' operator & to ensuring proper command parsing
    & docker buildx build -t "$service:latest" -f $dockerfile .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Tagging $service..."
        & docker tag "$service:latest" $imageTag
        
        Write-Host "Pushing $service..."
        & docker push $imageTag
    }
    else {
        Write-Error "Build FAILED for $service"
    }
}
