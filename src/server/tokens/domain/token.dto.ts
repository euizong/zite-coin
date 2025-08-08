// 토큰 전송 DTO
export interface TokenTransferDTO {
  id?: number;
  fromUserId: number;
  toUserId: number;
  fromWalletAddress: string;
  toWalletAddress: string;
  amount: string; // Decimal을 string으로 처리
  tokenContractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  failureReason?: string;
  network?: string;
  createdAt?: Date;
  updatedAt?: Date;
  confirmedAt?: Date;
}

// 전송 요청 DTO
export interface TransferRequestDTO {
  id?: number;
  userId: number;
  requestType: 'send' | 'receive' | 'batch' | 'mint' | 'burn';
  amount?: string;
  toAddress?: string;
  fromAddress?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transferId?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  processedAt?: Date;
}

// 사용자 지갑 DTO
export interface UserWalletDTO {
  id?: number;
  userId: number;
  walletAddress: string;
  walletType: 'metamask' | 'walletconnect' | 'coinbase' | 'other';
  isPrimary: boolean;
  isVerified: boolean;
  balance: string;
  lastBalanceUpdate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// 잔액 히스토리 DTO
export interface BalanceHistoryDTO {
  id?: number;
  userId: number;
  walletAddress: string;
  balanceBefore: string;
  balanceAfter: string;
  changeAmount: string;
  changeType: 'transfer_in' | 'transfer_out' | 'mint' | 'burn' | 'correction';
  referenceTransferId?: number;
  createdAt?: Date;
}

// 가스비 DTO
export interface GasFeeDTO {
  id?: number;
  transferId: number;
  estimatedGas?: number;
  actualGasUsed?: number;
  gasPrice?: string;
  totalFee?: string;
  feeInUsd?: number;
  network: string;
  createdAt?: Date;
}

// API 응답용 확장 DTO들
export interface TransferWithDetailsDTO extends TokenTransferDTO {
  fromUser?: {
    id: number;
    username: string;
    email: string;
  };
  toUser?: {
    id: number;
    username: string;
    email: string;
  };
  gasFee?: GasFeeDTO;
}

export interface UserWalletWithBalanceDTO extends UserWalletDTO {
  realtimeBalance?: string; // 실시간 블록체인 조회 잔액
  pendingTransfers?: {
    incoming: string;
    outgoing: string;
  };
}

// 전송 통계 DTO
export interface TransferStatsDTO {
  transferDate: string;
  totalTransfers: number;
  totalVolume: string;
  avgAmount: string;
  confirmedTransfers: number;
  failedTransfers: number;
}

// 사용자 잔액 뷰 DTO
export interface UserBalanceDTO {
  userId: number;
  username: string;
  walletAddress: string;
  cachedBalance: string;
  lastBalanceUpdate?: Date;
  isPrimary: boolean;
}
