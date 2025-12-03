# Start both Backend and Frontend for local development
# Usage: From repo root run: .\scripts\start-all.ps1

$backendPath = Join-Path $PSScriptRoot '..\bracunet\Backend'
$frontendPath = Join-Path $PSScriptRoot '..\bracunet\Frontend'

Write-Host "Starting Backend in: $backendPath"
Start-Process -FilePath pwsh -ArgumentList "-NoProfile -NoExit -Command \"Set-Location -Path '$backendPath'; npm run dev\"" -WindowStyle Normal

Start-Sleep -Seconds 2
Write-Host "Starting Frontend in: $frontendPath"
Start-Process -FilePath pwsh -ArgumentList "-NoProfile -NoExit -Command \"Set-Location -Path '$frontendPath'; npm run dev\"" -WindowStyle Normal

Write-Host "Both processes started in new PowerShell windows. Close them to stop servers."
