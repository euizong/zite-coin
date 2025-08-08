@echo off
echo 🚀 ZITE 서버 빌드 및 실행 중...
echo.

echo 📦 TypeScript 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 빌드 실패!
    pause
    exit /b 1
)

echo ✅ 빌드 완료!
echo 🌟 서버 시작 중...
call npm start

pause
