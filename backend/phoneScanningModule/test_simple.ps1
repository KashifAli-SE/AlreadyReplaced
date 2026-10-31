# Simple API Test
Write-Host "Testing Phone Scanning Module..." -ForegroundColor Cyan

# Test Risky App
$body = @{
    appName = "Super Cleaner Pro"
    packageName = "com.fake.cleaner"
    permissions = @("android.permission.READ_SMS")
} | ConvertTo-Json

Write-Host "Sending request..." -ForegroundColor Yellow
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/scan/analyze-app" -Method Post -Body $body -ContentType "application/json"

Write-Host ""
Write-Host "RESULT:" -ForegroundColor Green
Write-Host "App: $($result.data.appName)"
Write-Host "Risk Level: $($result.data.riskLevel)"
Write-Host "Risk Score: $($result.data.riskScore)"
Write-Host ""
Write-Host "Reasons:"
$result.data.reasons | ForEach-Object { Write-Host "  - $_" }
Write-Host ""
Write-Host "Recommendations:"
$result.data.recommendations | ForEach-Object { Write-Host "  - $_" }
Write-Host ""
Write-Host "SUCCESS! API is working!" -ForegroundColor Green
