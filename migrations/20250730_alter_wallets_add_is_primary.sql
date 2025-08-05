ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- 기존 유저별 대표지갑 1개만 true로 만들고 싶으면 아래 쿼리 참고
-- (여기선 컬럼만 추가)
