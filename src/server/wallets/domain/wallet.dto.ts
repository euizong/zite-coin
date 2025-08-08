// src/server/wallets/domain/wallet.dto.ts


export interface WalletDTO {
  id: number;
  userId: number;
  address: string;
  wallet_type: 'EOA' | 'CONTRACT';
  status: 'active' | 'inactive' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}


export interface UpsertWalletDTO {
  userId: number;
  address: string;
  wallet_type: 'EOA' | 'CONTRACT';
  status?: 'active' | 'inactive' | 'blocked';
}
