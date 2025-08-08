import knex from 'knex';
import { WalletDTO, UpsertWalletDTO } from '../domain/wallet.dto';

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

class WalletRepository {
  // 지갑 정보 조회
  async getUserWallet(userId: number): Promise<WalletDTO | null> {
    const row = await db('wallets').where('user_id', userId).first();
    return row ? this.mapToWalletDTO(row) : null;
  }

  // 지갑 정보 upsert
  async upsertUserWallet(wallet: UpsertWalletDTO): Promise<WalletDTO> {
    const [result] = await db('wallets')
      .insert({
        user_id: wallet.userId,
        address: wallet.address,
        wallet_type: wallet.wallet_type,
        status: wallet.status || 'active',
      })
      .onConflict('user_id')
      .merge({
        address: wallet.address,
        wallet_type: wallet.wallet_type,
        status: wallet.status || 'active',
        updated_at: new Date(),
      })
      .returning('*');
    return this.mapToWalletDTO(result);
  }

  // 지갑 생성
  async createWallet(wallet: UpsertWalletDTO): Promise<WalletDTO> {
    const [result] = await db('wallets')
      .insert({
        user_id: wallet.userId,
        address: wallet.address,
        wallet_type: wallet.wallet_type,
        status: wallet.status || 'active',
      })
      .returning('*');
    return this.mapToWalletDTO(result);
  }

  // 지갑 단건 조회 (지갑 id)
  async getWalletById(walletId: number): Promise<WalletDTO | null> {
    const row = await db('wallets').where('id', walletId).first();
    return row ? this.mapToWalletDTO(row) : null;
  }

  // 사용자별 지갑 목록 조회
  async getWalletsByUser(userId: number): Promise<WalletDTO[]> {
    const rows = await db('wallets').where('user_id', userId);
    return rows.map(this.mapToWalletDTO);
  }

  // 지갑 정보 수정
  async updateWallet(walletId: number, update: Partial<UpsertWalletDTO>): Promise<WalletDTO | null> {
    const [result] = await db('wallets')
      .where('id', walletId)
      .update({ ...update, updated_at: new Date() })
      .returning('*');
    return result ? this.mapToWalletDTO(result) : null;
  }

  // 지갑 삭제
  async deleteWallet(walletId: number): Promise<boolean> {
    const deleted = await db('wallets').where('id', walletId).del();
    return deleted > 0;
  }

  // 사용자-지갑 매핑 (userId로 기본 지갑 지정)
  async setUserDefaultWallet(userId: number, walletId: number): Promise<boolean> {
    // 예시: users 테이블에 default_wallet_id 컬럼이 있다고 가정
    const updated = await db('users').where('id', userId).update({ default_wallet_id: walletId });
    return updated > 0;
  }

  // 사용자별 기본 지갑 조회
  async getUserDefaultWallet(userId: number): Promise<WalletDTO | null> {
    // 예시: users 테이블에 default_wallet_id 컬럼이 있다고 가정
    const user = await db('users').where('id', userId).first();
    if (!user || !user.default_wallet_id) return null;
    return this.getWalletById(user.default_wallet_id);
  }

  private mapToWalletDTO(row: any): WalletDTO {
    return {
      id: row.id,
      userId: row.user_id,
      address: row.address,
      wallet_type: row.wallet_type,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new WalletRepository();
