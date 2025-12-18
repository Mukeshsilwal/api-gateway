# Push images to ECR
$Registry = "572638914672.dkr.ecr.us-east-1.amazonaws.com"
$Services = @(
    "auth-service",
    "booking-service",
    "hotel-service",
    "payment-service",
    "web-bff",
    "market-service",
    "bus-service"
)

foreach ($Service in $Services) {
    Write-Host "Processing $Service..." -ForegroundColor Yellow
    $LocalImage = "ticketkatum/$Service:latest"
    $TargetImage = "$Registry/$Service:latest"
    
    # Tag
    docker tag $LocalImage $TargetImage
    
    # Push
    Write-Host "Pushing $TargetImage..." -ForegroundColor Cyan
    docker push $TargetImage
    
    # Update Deployment
    # Note: Using kubectl set image here to immediately update the cluster
    Write-Host "Updating deployment for $Service..." -ForegroundColor Magenta
    kubectl set image deployment/$Service $Service=$TargetImage
}

Write-Host "All services pushed and updated." -ForegroundColor Green
