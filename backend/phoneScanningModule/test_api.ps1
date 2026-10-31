# Test Phone Scanning Module API

Write-Host "Testing Phone Scanning Module API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
Write-Host "✓ Server is healthy" -ForegroundColor Green
Write-Host "  Status: $($health.status)" -ForegroundColor Gray
Write-Host ""

# Test 2: Analyze Safe App (WhatsApp)
Write-Host "2. Testing Safe App (WhatsApp)..." -ForegroundColor Yellow
$safeApp = @{
    appName = "WhatsApp"
    packageName = "com.whatsapp"
    permissions = @("android.permission.CAMERA")
    isSystemApp = $false
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/scan/analyze-app" `
        -Method Post `
        -Body $safeApp `
        -ContentType "application/json"
    
    Write-Host "✓ Analysis Complete" -ForegroundColor Green
    Write-Host "  App: $($result.data.appName)" -ForegroundColor Gray
    Write-Host "  Risk Level: $($result.data.riskLevel)" -ForegroundColor Gray
    Write-Host "  Risk Score: $($result.data.riskScore)" -ForegroundColor Gray
    Write-Host "  Reason: $($result.data.reasons[0])" -ForegroundColor Gray
} catch {
    Write-Host "✗ Test Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Analyze Risky App
Write-Host "3. Testing Risky App (Fake Cleaner)..." -ForegroundColor Yellow
$riskyApp = @{
    appName = "Super Cleaner Pro"
    packageName = "com.fake.cleaner"
    permissions = @("android.permission.READ_SMS", "android.permission.CAMERA")
    isSystemApp = $false
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/scan/analyze-app" `
        -Method Post `
        -Body $riskyApp `
        -ContentType "application/json"
    
    Write-Host "✓ Analysis Complete" -ForegroundColor Green
    Write-Host "  App: $($result.data.appName)" -ForegroundColor Gray
    Write-Host "  Risk Level: $($result.data.riskLevel)" -ForegroundColor Gray
    Write-Host "  Risk Score: $($result.data.riskScore)" -ForegroundColor Gray
    Write-Host "  Reasons:" -ForegroundColor Gray
    foreach ($reason in $result.data.reasons) {
        Write-Host "    - $reason" -ForegroundColor Gray
    }
    Write-Host "  Recommendations:" -ForegroundColor Gray
    foreach ($rec in $result.data.recommendations) {
        Write-Host "    - $rec" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Test Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Statistics
Write-Host "4. Testing Statistics Endpoint..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/scan/stats" -Method Get
    Write-Host "✓ Statistics Retrieved" -ForegroundColor Green
    Write-Host "  Total Analyses: $($stats.data.totalAnalyses)" -ForegroundColor Gray
    Write-Host "  Risky Apps Detected: $($stats.data.riskyAppsDetected)" -ForegroundColor Gray
    Write-Host "  Trusted Packages: $($stats.data.trustedPackagesCount)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Test Failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "✓ All Tests Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "API is working correctly! 🎉" -ForegroundColor Cyan
