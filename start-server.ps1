# ZITE 서버 시작 스크립트
Write-Host "🚀 ZITE 서버 빌드 및 실행 중..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 TypeScript 빌드 중..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ 빌드 완료!" -ForegroundColor Green
Write-Host "🌟 서버 시작 중..." -ForegroundColor Blue

npm start
