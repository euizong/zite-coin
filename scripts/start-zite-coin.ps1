# ZITE-COIN Blockchain Startup Script (PowerShell)
# 80 Billion ZITE Coins, 3-second blocks, POA consensus

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "   Starting ZITE-COIN Blockchain..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Configuration file paths
$NODE_CONFIG = "config\zite-node.toml"
$GENESIS_CONFIG = "config\zite-genesis.config.json"

# Create log directory
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# ZITE-COIN node execution
Write-Host "Starting ZITE-COIN node..." -ForegroundColor Green
Write-Host "- Total Supply: 80 Billion ZITE" -ForegroundColor Yellow
Write-Host "- Block Time: 3 seconds" -ForegroundColor Yellow
Write-Host "- Consensus: POA (Proof of Authority)" -ForegroundColor Yellow
Write-Host "- Administrators: 2" -ForegroundColor Yellow
Write-Host "- Users: 3" -ForegroundColor Yellow
Write-Host ""

# Current timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "logs\zite-coin-$timestamp.log"

try {
    # Start node with minimal components (RPC only)
    .\dist\zite-coin.exe run `
        --cfg $NODE_CONFIG `
        --network custom `
        --custom-network-file $GENESIS_CONFIG `
        --components "rpc" | Tee-Object -FilePath $logFile
}
catch {
    Write-Host "Error occurred: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "ZITE-COIN node has been terminated." -ForegroundColor Cyan
