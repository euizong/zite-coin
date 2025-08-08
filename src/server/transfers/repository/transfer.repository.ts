import knex from 'knex';
import { TransferDTO, UserWalletDTO, BalanceHistoryDTO, GasFeeDTO, TransferRequestDTO } from '../domain/transfer.dto';

// DB 연결 설정
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

class TransferRepository {
  // 전송 기록 생성
  async createTransfer(transfer: Omit<TransferDTO, 'id'>): Promise<TransferDTO> {
    const [result] = await db('token_transfers').insert({
      from_user_id: transfer.fromUserId,
      to_user_id: transfer.toUserId,
      from_wallet_address: transfer.fromWalletAddress,
      to_wallet_address: transfer.toWalletAddress,
      amount: transfer.amount,
      token_contract_address: transfer.tokenContractAddress,
      transaction_hash: transfer.transactionHash,
      block_number: transfer.blockNumber,
      gas_used: transfer.gasUsed,
      gas_price: transfer.gasPrice,
      status: transfer.status,
      failure_reason: transfer.failureReason,
      network: transfer.network || 'polygon',
    }).returning('*');

    return this.mapToTransferDTO(result);
  }

  // 전송 기록 조회
  async getTransferById(id: number): Promise<TransferDTO | null> {
    const result = await db('token_transfers').where('id', id).first();
    return result ? this.mapToTransferDTO(result) : null;
  }

  // 사용자별 전송 히스토리
  async getTransfersByUser(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transfers: TransferDTO[]; total: number }> {
    const offset = (page - 1) * limit;

    const [transfers, totalCount] = await Promise.all([
      db('token_transfers')
        .where('from_user_id', userId)
        .orWhere('to_user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      
      db('token_transfers')
        .where('from_user_id', userId)
        .orWhere('to_user_id', userId)
        .count('* as count')
        .first()
    ]);

    return {
      transfers: transfers.map(this.mapToTransferDTO),
      total: Number(totalCount?.count || 0)
    };
  }

  // 전송 상태 업데이트
  async updateTransferStatus(
    id: number,
    status: TransferDTO['status'],
    updateData: Partial<TransferDTO> = {}
  ): Promise<TransferDTO | null> {
    const [result] = await db('token_transfers')
      .where('id', id)
      .update({
        status,
        transaction_hash: updateData.transactionHash,
        block_number: updateData.blockNumber,
        gas_used: updateData.gasUsed,
        gas_price: updateData.gasPrice,
        failure_reason: updateData.failureReason,
        confirmed_at: status === 'confirmed' ? new Date() : null,
        updated_at: new Date()
      })
      .returning('*');

    return result ? this.mapToTransferDTO(result) : null;
  }


  // 잔액 히스토리 추가
  async addBalanceHistory(history: Omit<BalanceHistoryDTO, 'id'>): Promise<BalanceHistoryDTO> {
    const [result] = await db('balance_history').insert({
      user_id: history.userId,
      wallet_address: history.walletAddress,
      balance_before: history.balanceBefore,
      balance_after: history.balanceAfter,
      change_amount: history.changeAmount,
      change_type: history.changeType,
      reference_transfer_id: history.referenceTransferId
    }).returning('*');

    return this.mapToBalanceHistoryDTO(result);
  }

  // 가스비 기록 추가
  async addGasFee(gasFee: Omit<GasFeeDTO, 'id'>): Promise<GasFeeDTO> {
    const [result] = await db('gas_fees').insert({
      transfer_id: gasFee.transferId,
      estimated_gas: gasFee.estimatedGas,
      actual_gas_used: gasFee.actualGasUsed,
      gas_price: gasFee.gasPrice,
      total_fee: gasFee.totalFee,
      fee_in_usd: gasFee.feeInUsd,
      network: gasFee.network
    }).returning('*');

    return this.mapToGasFeeDTO(result);
  }

  // 전송 요청 기록
  async createTransferRequest(request: Omit<TransferRequestDTO, 'id'>): Promise<TransferRequestDTO> {
    const [result] = await db('transfer_requests').insert({
      user_id: request.userId,
      request_type: request.requestType,
      amount: request.amount,
      to_address: request.toAddress,
      from_address: request.fromAddress,
      status: request.status,
      transfer_id: request.transferId,
      ip_address: request.ipAddress,
      user_agent: request.userAgent
    }).returning('*');

    return this.mapToTransferRequestDTO(result);
  }

  // DTO 매핑 함수들
  private mapToTransferDTO(row: any): TransferDTO {
    return {
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      fromWalletAddress: row.from_wallet_address,
      toWalletAddress: row.to_wallet_address,
      amount: row.amount,
      tokenContractAddress: row.token_contract_address,
      transactionHash: row.transaction_hash,
      blockNumber: row.block_number,
      gasUsed: row.gas_used,
      gasPrice: row.gas_price,
      status: row.status,
      failureReason: row.failure_reason,
      network: row.network,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      confirmedAt: row.confirmed_at
    };
  }


  private mapToBalanceHistoryDTO(row: any): BalanceHistoryDTO {
    return {
      id: row.id,
      userId: row.user_id,
      walletAddress: row.wallet_address,
      balanceBefore: row.balance_before,
      balanceAfter: row.balance_after,
      changeAmount: row.change_amount,
      changeType: row.change_type,
      referenceTransferId: row.reference_transfer_id,
      createdAt: row.created_at
    };
  }

  private mapToGasFeeDTO(row: any): GasFeeDTO {
    return {
      id: row.id,
      transferId: row.transfer_id,
      estimatedGas: row.estimated_gas,
      actualGasUsed: row.actual_gas_used,
      gasPrice: row.gas_price,
      totalFee: row.total_fee,
      feeInUsd: row.fee_in_usd,
      network: row.network,
      createdAt: row.created_at
    };
  }

  private mapToTransferRequestDTO(row: any): TransferRequestDTO {
    return {
      id: row.id,
      userId: row.user_id,
      requestType: row.request_type,
      amount: row.amount,
      toAddress: row.to_address,
      fromAddress: row.from_address,
      status: row.status,
      transferId: row.transfer_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
      processedAt: row.processed_at
    };
  }
}

export default new TransferRepository();
