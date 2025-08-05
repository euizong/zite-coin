#!/bin/bash

# ZITE-COIN 블록체인 실행 스크립트
# 80억 개의 ZITE 코인, 3초 블록 생성, POA 합의

echo "==================================="
echo "   ZITE-COIN 블록체인 시작 중..."
echo "==================================="

# 설정 파일 경로
NODE_CONFIG="config/zite-node.toml"
GENESIS_CONFIG="config/zite-genesis.config.json"

# 로그 디렉토리 생성
mkdir -p logs

# ZITE-COIN 노드 실행
echo "ZITE-COIN 노드를 시작합니다..."
echo "- 총 발행량: 80억 ZITE"
echo "- 블록 생성 주기: 3초"
echo "- 합의 방식: POA (Proof of Authority)"
echo "- 관리자: 2명"
echo "- 사용자: 3명"
echo ""

# 노드 실행
./dist/zite-coin.exe run \
    --cfg "$NODE_CONFIG" \
    --network custom \
    --custom-network-file "$GENESIS_CONFIG" \
    --components "sequencer,rpc,synchronizer" \
    2>&1 | tee logs/zite-coin-$(date +%Y%m%d-%H%M%S).log

echo ""
echo "ZITE-COIN 노드가 종료되었습니다."
