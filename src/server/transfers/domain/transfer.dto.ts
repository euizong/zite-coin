// 토큰 전송 DTO
export interface TransferDTO {
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

// API 요청/응답 DTO들
export interface CreateTransferRequestDTO {
  toUserId?: number;
  toWalletAddress: string;
  amount: string;
  note?: string;
}

export interface TransferResponseDTO {
  id: number;
  status: string;
  transactionHash?: string;
  estimatedGas?: number;
  estimatedFee?: string;
  message: string;
}

export interface BalanceResponseDTO {
  walletAddress: string;
  balance: string;
  lastUpdate: Date;
  pendingTransfers: {
    incoming: string;
    outgoing: string;
  };
}

// 전송 히스토리 조회용
export interface TransferHistoryRequestDTO {
  userId?: number;
  walletAddress?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface TransferHistoryResponseDTO {
  transfers: TransferDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
