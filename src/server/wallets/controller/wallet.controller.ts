
import { Request, Response } from 'express';
import walletService from '../service/wallet.service';

class WalletController {
  // 지갑 생성
  async createWallet(req: Request, res: Response) {
    const { userId, address, wallet_type, status } = req.body;
    if (!userId || !address || !wallet_type) {
      return res.status(400).json({ message: 'userId, address, wallet_type required' });
    }
    const wallet = await walletService.createWallet({ userId, address, wallet_type, status });
    res.status(201).json(wallet);
  }

  // 지갑 단건 조회 (지갑 id)
  async getWalletById(req: Request, res: Response) {
    const walletId = Number(req.params.walletId);
    if (!walletId) return res.status(400).json({ message: 'walletId required' });
    const wallet = await walletService.getWalletById(walletId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  }

  // 사용자별 지갑 목록 조회
  async getWalletsByUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const wallets = await walletService.getWalletsByUser(userId);
    res.json(wallets);
  }

  // 지갑 정보 수정
  async updateWallet(req: Request, res: Response) {
    const walletId = Number(req.params.walletId);
    if (!walletId) return res.status(400).json({ message: 'walletId required' });
    const update = req.body;
    const wallet = await walletService.updateWallet(walletId, update);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  }

  // 지갑 삭제
  async deleteWallet(req: Request, res: Response) {
    const walletId = Number(req.params.walletId);
    if (!walletId) return res.status(400).json({ message: 'walletId required' });
    const deleted = await walletService.deleteWallet(walletId);
    if (!deleted) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ success: true });
  }

  // 사용자-지갑 매핑 (userId로 기본 지갑 지정)
  async setUserDefaultWallet(req: Request, res: Response) {
    const userId = Number(req.body.userId);
    const walletId = Number(req.body.walletId);
    if (!userId || !walletId) return res.status(400).json({ message: 'userId, walletId required' });
    const result = await walletService.setUserDefaultWallet(userId, walletId);
    if (!result) return res.status(404).json({ message: 'User or wallet not found' });
    res.json({ success: true });
  }

  // 사용자별 기본 지갑 조회
  async getUserDefaultWallet(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const wallet = await walletService.getUserDefaultWallet(userId);
    if (!wallet) return res.status(404).json({ message: 'Default wallet not found' });
    res.json(wallet);
  }
}

export default new WalletController();
