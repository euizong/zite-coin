
import { WalletDTO, UpsertWalletDTO } from '../domain/wallet.dto';
import walletRepository from '../repository/wallet.repository';

class WalletService {
  // 지갑 생성
  async createWallet(wallet: UpsertWalletDTO): Promise<WalletDTO> {
    return walletRepository.createWallet(wallet);
  }

  // 지갑 단건 조회 (지갑 id)
  async getWalletById(walletId: number): Promise<WalletDTO | null> {
    return walletRepository.getWalletById(walletId);
  }

  // 사용자별 지갑 목록 조회
  async getWalletsByUser(userId: number): Promise<WalletDTO[]> {
    return walletRepository.getWalletsByUser(userId);
  }

  // 지갑 정보 수정
  async updateWallet(walletId: number, update: Partial<UpsertWalletDTO>): Promise<WalletDTO | null> {
    return walletRepository.updateWallet(walletId, update);
  }

  // 지갑 삭제
  async deleteWallet(walletId: number): Promise<boolean> {
    return walletRepository.deleteWallet(walletId);
  }

  // 사용자-지갑 매핑 (userId로 기본 지갑 지정 등)
  async setUserDefaultWallet(userId: number, walletId: number): Promise<boolean> {
    return walletRepository.setUserDefaultWallet(userId, walletId);
  }

  // 사용자별 기본 지갑 조회
  async getUserDefaultWallet(userId: number): Promise<WalletDTO | null> {
    return walletRepository.getUserDefaultWallet(userId);
  }
}

export default new WalletService();
