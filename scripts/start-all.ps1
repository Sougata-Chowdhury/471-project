# Start both Backend and Frontend for local development
# Usage: From repo root run: .\scripts\start-all.ps1

# Resolve proper paths
$backendPath = Resolve-Path (Join-Path $PSScriptRoot '..\bracunet\backend')
$frontendPath = Resolve-Path (Join-Path $PSScriptRoot '..\bracunet\frontend')

Write-Host "Starting Backend in: $backendPath"
# Launch backend in a new PowerShell window with -NoExit to keep it open
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node src/index.js" -WindowStyle Normal

Start-Sleep -Seconds 2
Write-Host "Starting Frontend in: $frontendPath"
# Launch frontend in a new PowerShell window with -NoExit to keep it open
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers started in new PowerShell windows"
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:3001"
Write-Host ""
Write-Host "Close those PowerShell windows to stop the servers."
