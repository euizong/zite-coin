const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
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

    // SQL 파일 읽기
    const sqlFile = path.join(__dirname, 'database', 'migrations', 'token_transfers_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL 파일 실행 중...');
    await client.query(sql);
    
    console.log('🎉 Transfer 테이블들이 성공적으로 생성되었습니다!');

    // 생성된 테이블 확인
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('token_transfers', 'user_wallets', 'balance_history', 'gas_fees', 'transfer_requests')
      ORDER BY tablename
    `);
    
    console.log('\n📊 생성된 테이블들:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.tablename}`);
    });

  } catch (error) {
    console.error('❌ 에러:', error.message);
    
    // 구체적인 에러 정보
    if (error.code === '42P07') {
      console.log('💡 테이블이 이미 존재합니다.');
    } else if (error.code === '42703') {
      console.log('💡 컬럼이나 테이블이 존재하지 않습니다.');
    }
  } finally {
    await client.end();
    console.log('🔌 DB 연결 종료');
  }
}

runMigration();
