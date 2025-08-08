-- 토큰 전송 테이블 (Token Transfers)
CREATE TABLE token_transfers (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    from_wallet_address VARCHAR(42) NOT NULL, -- 0x로 시작하는 지갑 주소
    to_wallet_address VARCHAR(42) NOT NULL,   -- 0x로 시작하는 지갑 주소
    amount DECIMAL(36, 18) NOT NULL,          -- 토큰 수량 (18자리 소수점)
    token_contract_address VARCHAR(42) NOT NULL DEFAULT '0x319080F850811DCd0caf0E0184cc2CA39Aa37A42', -- ZITE 토큰 주소
    transaction_hash VARCHAR(66),             -- 블록체인 트랜잭션 해시
    block_number BIGINT,                      -- 블록 번호
    gas_used BIGINT,                          -- 사용된 가스
    gas_price DECIMAL(36, 18),                -- 가스 가격
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, failed
    failure_reason TEXT,                      -- 실패 사유
    network VARCHAR(20) NOT NULL DEFAULT 'polygon', -- polygon, ethereum 등
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,                   -- 블록체인 확정 시간
    
    -- 인덱스 및 제약조건
    CONSTRAINT check_amount_positive CHECK (amount > 0),
    CONSTRAINT check_different_users CHECK (from_user_id != to_user_id),
    CONSTRAINT check_status VALUES ('pending', 'confirmed', 'failed', 'cancelled')
);

-- 사용자 지갑 테이블 (User Wallets)
CREATE TABLE user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    wallet_address VARCHAR(42) NOT NULL UNIQUE, -- 지갑 주소
    wallet_type VARCHAR(20) NOT NULL DEFAULT 'metamask', -- metamask, walletconnect 등
    is_primary BOOLEAN DEFAULT FALSE,         -- 기본 지갑 여부
    is_verified BOOLEAN DEFAULT FALSE,        -- 검증된 지갑 여부
    balance DECIMAL(36, 18) DEFAULT 0,        -- 캐시된 잔액
    last_balance_update TIMESTAMP,            -- 마지막 잔액 업데이트 시간
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 하나의 사용자는 하나의 기본 지갑만 가질 수 있음
    CONSTRAINT unique_primary_wallet_per_user UNIQUE (user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- 토큰 잔액 히스토리 테이블 (Balance History)
CREATE TABLE balance_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    wallet_address VARCHAR(42) NOT NULL,
    balance_before DECIMAL(36, 18) NOT NULL,
    balance_after DECIMAL(36, 18) NOT NULL,
    change_amount DECIMAL(36, 18) NOT NULL,   -- 변경량 (+ 또는 -)
    change_type VARCHAR(20) NOT NULL,         -- transfer_in, transfer_out, mint, burn
    reference_transfer_id INTEGER REFERENCES token_transfers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_change_type VALUES ('transfer_in', 'transfer_out', 'mint', 'burn', 'correction')
);

-- 가스비 추적 테이블 (Gas Fees)
CREATE TABLE gas_fees (
    id SERIAL PRIMARY KEY,
    transfer_id INTEGER NOT NULL REFERENCES token_transfers(id),
    estimated_gas BIGINT,                     -- 예상 가스
    actual_gas_used BIGINT,                   -- 실제 사용된 가스
    gas_price DECIMAL(36, 18),                -- 가스 가격 (Wei)
    total_fee DECIMAL(36, 18),                -- 총 수수료 (MATIC)
    fee_in_usd DECIMAL(10, 4),                -- USD 환산 수수료
    network VARCHAR(20) NOT NULL DEFAULT 'polygon',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 전송 요청 테이블 (Transfer Requests) - API 요청 로그
CREATE TABLE transfer_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    request_type VARCHAR(20) NOT NULL,        -- send, receive, batch
    amount DECIMAL(36, 18),
    to_address VARCHAR(42),
    from_address VARCHAR(42),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transfer_id INTEGER REFERENCES token_transfers(id),
    ip_address INET,                          -- 요청자 IP
    user_agent TEXT,                          -- 브라우저 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    CONSTRAINT check_request_type VALUES ('send', 'receive', 'batch', 'mint', 'burn')
);

-- 인덱스 생성
CREATE INDEX idx_token_transfers_from_user ON token_transfers(from_user_id);
CREATE INDEX idx_token_transfers_to_user ON token_transfers(to_user_id);
CREATE INDEX idx_token_transfers_status ON token_transfers(status);
CREATE INDEX idx_token_transfers_hash ON token_transfers(transaction_hash);
CREATE INDEX idx_token_transfers_created ON token_transfers(created_at);
CREATE INDEX idx_token_transfers_addresses ON token_transfers(from_wallet_address, to_wallet_address);

CREATE INDEX idx_user_wallets_user ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX idx_user_wallets_primary ON user_wallets(user_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX idx_balance_history_user ON balance_history(user_id);
CREATE INDEX idx_balance_history_wallet ON balance_history(wallet_address);
CREATE INDEX idx_balance_history_created ON balance_history(created_at);

CREATE INDEX idx_gas_fees_transfer ON gas_fees(transfer_id);
CREATE INDEX idx_transfer_requests_user ON transfer_requests(user_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_token_transfers_updated_at 
    BEFORE UPDATE ON token_transfers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at 
    BEFORE UPDATE ON user_wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 뷰: 전송 통계
CREATE VIEW transfer_stats AS
SELECT 
    DATE(created_at) as transfer_date,
    COUNT(*) as total_transfers,
    SUM(amount) as total_volume,
    AVG(amount) as avg_amount,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_transfers,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transfers
FROM token_transfers 
GROUP BY DATE(created_at)
ORDER BY transfer_date DESC;

-- 뷰: 사용자별 토큰 잔액
CREATE VIEW user_balances AS
SELECT 
    u.id as user_id,
    u.username,
    uw.wallet_address,
    uw.balance as cached_balance,
    uw.last_balance_update,
    uw.is_primary
FROM users u
JOIN user_wallets uw ON u.id = uw.user_id
WHERE uw.is_verified = TRUE
ORDER BY u.id, uw.is_primary DESC;
