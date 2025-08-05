export const deleteWallet = async (req: Request, res: Response) => {
  try {
    await walletService.deleteWallet(Number(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setPrimaryWallet = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.body.user_id);
    const wallet_id = Number(req.params.id);
    const wallet = await walletService.setPrimaryWallet(user_id, wallet_id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
import { Request, Response } from 'express';
import * as walletService from '../service';

export const getWalletsByUser = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);
    const wallets = await walletService.getWalletsByUser(user_id);
    res.json(wallets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getWalletById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const wallet = await walletService.getWalletById(id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createWallet = async (req: Request, res: Response) => {
  try {
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
