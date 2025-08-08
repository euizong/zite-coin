const { Client } = require('pg');

async function testTables() {
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

    // 테이블 존재 확인
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename LIKE '%transfer%' OR tablename LIKE '%wallet%' OR tablename LIKE '%balance%' OR tablename LIKE '%gas%'
      ORDER BY tablename
    `);

    console.log('\n📊 Transfer 관련 테이블들:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.tablename}`);
    });

    // 샘플 데이터 삽입 테스트 (user_wallets)
    console.log('\n🧪 샘플 데이터 삽입 테스트...');
    
    const testWallet = await client.query(`
      INSERT INTO user_wallets (user_id, wallet_address, wallet_type, is_primary, is_verified, balance)
      VALUES (1, '0x1234567890123456789012345678901234567890', 'metamask', true, true, 1000.5)
      ON CONFLICT (wallet_address) DO UPDATE SET balance = EXCLUDED.balance
      RETURNING *
    `);

    console.log('✅ 지갑 데이터 삽입 성공:', testWallet.rows[0]);

    // 삽입된 데이터 조회
    const wallets = await client.query('SELECT * FROM user_wallets LIMIT 5');
    console.log('\n💰 지갑 데이터 조회:');
    wallets.rows.forEach(wallet => {
      console.log(`  ID: ${wallet.id}, User: ${wallet.user_id}, Address: ${wallet.wallet_address}, Balance: ${wallet.balance}`);
    });

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('상세 정보:', error);
  } finally {
    await client.end();
    console.log('\n🔌 DB 연결 종료');
  }
}

testTables();
