# Start both Backend and Frontend for local development
# Usage: From repo root run: .\scripts\start-all.ps1

# Resolve backend/frontend paths relative to this script
$backendPath = Join-Path $PSScriptRoot '..\bracunet\backend'
$frontendPath = Join-Path $PSScriptRoot '..\bracunet\frontend'

# Prefer pwsh (PowerShell Core) when available, otherwise fall back to Windows PowerShell
if (Get-Command pwsh -ErrorAction SilentlyContinue) {
	$shell = (Get-Command pwsh).Source
} else {
	$shell = 'powershell.exe'
}

Write-Host "Starting Backend in: $backendPath"
# Use Start-Process with -WorkingDirectory so the command runs in the correct folder
Start-Process -FilePath $shell -ArgumentList '-NoProfile','-NoExit','-Command','npm run dev' -WorkingDirectory $backendPath -WindowStyle Normal

Start-Sleep -Seconds 2
Write-Host "Starting Frontend in: $frontendPath"
Start-Process -FilePath $shell -ArgumentList '-NoProfile','-NoExit','-Command','npm run dev' -WorkingDirectory $frontendPath -WindowStyle Normal

Write-Host "Both processes started in new PowerShell windows. Close them to stop servers."
