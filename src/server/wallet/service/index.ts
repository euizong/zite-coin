import db from '../../db';
import WalletDTO from '../domain/wallet.dto';

export interface IWallet {
  user_id: number;
  address: string;
  type?: string;
  is_primary?: boolean;
}
export const deleteWallet = async (id: number): Promise<void> => {
  await db('wallets').where({ id }).del();
};

export const setPrimaryWallet = async (user_id: number, wallet_id: number): Promise<WalletDTO | null> => {
  // 모든 지갑의 is_primary를 false로
  await db('wallets').where({ user_id }).update({ is_primary: false });
  // 해당 지갑만 true로
  const [updated] = await db('wallets')
    .where({ id: wallet_id, user_id })
    .update({ is_primary: true })
    .returning('*');
  return updated ? new WalletDTO(updated) : null;
};

export const getWalletsByUser = async (user_id: number): Promise<WalletDTO[]> => {
  const rows = await db('wallets').where({ user_id });
  return rows.map((row: any) => new WalletDTO(row));
};

export const getWalletById = async (id: number): Promise<WalletDTO | null> => {
  const row = await db('wallets').where({ id }).first();
  return row ? new WalletDTO(row) : null;
};

export const createWallet = async (wallet: IWallet): Promise<WalletDTO> => {
  if (!wallet) throw new Error('Wallet data is required');
  const { user_id, address, type } = wallet;
  const [created] = await db('wallets')
    .insert({ user_id, address, type })
    .returning('*');
  return new WalletDTO(created);
};
