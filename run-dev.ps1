# ============================================
# AI Content Detector - Full Dev Launcher
# ============================================

$ErrorActionPreference = "Continue"

# --- Resolve paths safely ---
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host "Root:     $root"
Write-Host "Backend:  $backend"
Write-Host "Frontend: $frontend"
Write-Host ""

# --- 1) Ollama: only start if API not responding ---
Write-Host "Checking Ollama..." -ForegroundColor Yellow
$ollamaUp = $false
try {
    Invoke-WebRequest -Uri "http://localhost:11434/v1/models" -UseBasicParsing -TimeoutSec 2 | Out-Null
    $ollamaUp = $true
    Write-Host "Ollama is already running." -ForegroundColor Green
} catch {
    Write-Host "Ollama not responding. Starting Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "ollama serve"
    Start-Sleep -Seconds 3
}

# --- 2) Backend ---
Write-Host "Starting Backend..." -ForegroundColor Cyan

if (!(Test-Path (Join-Path $backend "app.py"))) {
    Write-Host "ERROR: backend\app.py not found at: $backend" -ForegroundColor Red
} else {
    $backendCmd = @"
Set-Location -LiteralPath '$backend'
if (Test-Path '.\.venv\Scripts\Activate.ps1') { . '.\.venv\Scripts\Activate.ps1' }
python app.py
"@
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $backendCmd
}

Start-Sleep -Seconds 2

# --- 3) Frontend ---
Write-Host "Starting Frontend..." -ForegroundColor Cyan

if (!(Test-Path (Join-Path $frontend "package.json"))) {
    Write-Host "ERROR: frontend\package.json not found at: $frontend" -ForegroundColor Red
    Write-Host "Make sure you're using Vite/React inside the frontend folder." -ForegroundColor Yellow
} else {
    $frontendCmd = @"
Set-Location -LiteralPath '$frontend'
npm run dev
"@
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $frontendCmd
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host " Backend:  http://127.0.0.1:5000"
Write-Host " Frontend: http://localhost:5173"
Write-Host " Ollama:   http://localhost:11434"
Write-Host "=============================================" -ForegroundColor Green
