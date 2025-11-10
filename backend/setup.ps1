# UniAttend Backend Setup Script for PowerShell

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "UniAttend Backend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "[1/6] Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to create virtual environment" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[✓] Virtual environment created" -ForegroundColor Green

# Activate virtual environment
Write-Host ""
Write-Host "[2/6] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "[✓] Virtual environment activated" -ForegroundColor Green

# Upgrade pip
Write-Host ""
Write-Host "[3/6] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip | Out-Null
Write-Host "[✓] Pip upgraded" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "[4/6] Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[✓] Dependencies installed" -ForegroundColor Green

# Setup environment variables
Write-Host ""
Write-Host "[5/6] Setting up environment variables..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "[✓] Created .env file from .env.example" -ForegroundColor Green
    Write-Host "[!] IMPORTANT: Please edit .env and update your configuration!" -ForegroundColor Yellow
} else {
    Write-Host "[!] .env file already exists, skipping..." -ForegroundColor Yellow
}

# Initialize database
Write-Host ""
Write-Host "[6/6] Initializing database..." -ForegroundColor Yellow
$env:FLASK_APP = "run.py"
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
Write-Host "[✓] Database initialized" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your database credentials"
Write-Host "2. Run: python run.py"
Write-Host "3. API will be available at http://localhost:5000"
Write-Host ""
Write-Host "To activate virtual environment in future:" -ForegroundColor Yellow
Write-Host "  .\venv\Scripts\Activate.ps1"
Write-Host ""
Read-Host "Press Enter to exit"
