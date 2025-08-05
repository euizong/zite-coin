# ZITE-COIN 테스트 전송 스크립트
# Admin 1에서 User 1으로 ZITE 코인 전송 테스트

param(
    [Parameter(Mandatory=$false)]
    [string]$Amount = "1000",
    
    [Parameter(Mandatory=$false)]
    [string]$From = "0x742d35Cc6734C0532925a3b8D100fD4C27F0C50B",
    
    [Parameter(Mandatory=$false)]
    [string]$To = "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "     ZITE-COIN 전송 테스트" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "💸 전송 정보:" -ForegroundColor Green
Write-Host "   보내는 주소: $From" -ForegroundColor White
Write-Host "   받는 주소:   $To" -ForegroundColor White
Write-Host "   전송량:      $Amount ZITE" -ForegroundColor Yellow

Write-Host ""
Write-Host "📡 RPC 호출 중..." -ForegroundColor Yellow

# JSON-RPC 요청 데이터 생성
$jsonData = @{
    jsonrpc = "2.0"
    method = "eth_sendTransaction"
    params = @(
        @{
            from = $From
            to = $To
            value = "0x" + ([bigint]([decimal]$Amount * 1000000000000000000)).ToString("x")
            gas = "0x5208"
            gasPrice = "0x3b9aca00"
        }
    )
    id = 1
} | ConvertTo-Json -Depth 10

try {
    # RPC 호출
    $response = Invoke-RestMethod -Uri "http://localhost:8545" -Method Post -ContentType "application/json" -Body $jsonData
    
    if ($response.result) {
        Write-Host "✅ 전송 성공!" -ForegroundColor Green
        Write-Host "   트랜잭션 해시: $($response.result)" -ForegroundColor White
    } elseif ($response.error) {
        Write-Host "❌ 전송 실패:" -ForegroundColor Red
        Write-Host "   오류: $($response.error.message)" -ForegroundColor White
    }
}
catch {
    Write-Host "❌ RPC 연결 실패: $_" -ForegroundColor Red
    Write-Host "   ZITE-COIN 노드가 실행 중인지 확인하세요." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
