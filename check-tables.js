const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    host: 'dreamworks.co.kr',
    port: 15432,
    user: 'euizong',
    password: 'Test12!@',
    database: 'zitecoin_service_db'
  });

  try {
    await client.connect();
    console.log('✅ DB 연결 성공');

    // 현재 테이블 목록 확인
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('token_transfers', 'user_wallets', 'balance_history', 'gas_fees', 'transfer_requests')
      ORDER BY table_name, ordinal_position
    `);

    if (result.rows.length === 0) {
      console.log('❌ Transfer 관련 테이블이 없습니다. 테이블을 생성하겠습니다.');
      
      // 간단한 버전으로 테이블 생성
      await createTables(client);
    } else {
      console.log('✅ 이미 생성된 테이블들:');
      
      let currentTable = '';
      result.rows.forEach(row => {
        if (row.table_name !== currentTable) {
          currentTable = row.table_name;
          console.log(`\n📋 ${row.table_name}:`);
        }
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ DB 에러:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 DB 연결 종료');
  }
}

async function createTables(client) {
  try {
    // 1. token_transfers 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_transfers (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        from_wallet_address VARCHAR(42) NOT NULL,
        to_wallet_address VARCHAR(42) NOT NULL,
        amount DECIMAL(36, 18) NOT NULL,
        token_contract_address VARCHAR(42) NOT NULL DEFAULT '0x319080F850811DCd0caf0E0184cc2CA39Aa37A42',
        transaction_hash VARCHAR(66),
        block_number BIGINT,
        gas_used BIGINT,
        gas_price DECIMAL(36, 18),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        failure_reason TEXT,
        network VARCHAR(20) NOT NULL DEFAULT 'polygon',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP
      )
    `);
    console.log('✅ token_transfers 테이블 생성');

    // 2. user_wallets 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        wallet_address VARCHAR(42) NOT NULL UNIQUE,
        wallet_type VARCHAR(20) NOT NULL DEFAULT 'metamask',
        is_primary BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        balance DECIMAL(36, 18) DEFAULT 0,
        last_balance_update TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_wallets 테이블 생성');

    // 3. balance_history 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS balance_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        wallet_address VARCHAR(42) NOT NULL,
        balance_before DECIMAL(36, 18) NOT NULL,
        balance_after DECIMAL(36, 18) NOT NULL,
        change_amount DECIMAL(36, 18) NOT NULL,
        change_type VARCHAR(20) NOT NULL,
        reference_transfer_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ balance_history 테이블 생성');

    // 4. gas_fees 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS gas_fees (
        id SERIAL PRIMARY KEY,
        transfer_id INTEGER NOT NULL,
        estimated_gas BIGINT,
        actual_gas_used BIGINT,
        gas_price DECIMAL(36, 18),
        total_fee DECIMAL(36, 18),
        fee_in_usd DECIMAL(10, 4),
        network VARCHAR(20) NOT NULL DEFAULT 'polygon',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ gas_fees 테이블 생성');

    // 5. transfer_requests 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS transfer_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        request_type VARCHAR(20) NOT NULL,
        amount DECIMAL(36, 18),
        to_address VARCHAR(42),
        from_address VARCHAR(42),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        transfer_id INTEGER,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      )
    `);
    console.log('✅ transfer_requests 테이블 생성');

    console.log('\n🎉 모든 Transfer 테이블이 성공적으로 생성되었습니다!');

  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error.message);
  }
}

checkTables();
