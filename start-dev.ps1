# 2099.studio — iniciar servidor local
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  2099.studio — servidor local" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "node_modules")) {
  Write-Host "Instalando dependencias..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

npx astro dev stop 2>$null

Write-Host "Iniciando en http://localhost:4321/" -ForegroundColor Green
Write-Host "No cierres esta ventana mientras navegues el sitio." -ForegroundColor DarkGray
Write-Host ""

Start-Process "http://localhost:4321/"
npm run dev
