import { Router } from 'express';
import walletController from '../controller/wallet.controller';

const router = Router();

// 지갑 생성
router.post('/', walletController.createWallet);

// 지갑 단건 조회 (지갑 id)
router.get('/id/:walletId', walletController.getWalletById);

// 사용자별 지갑 목록 조회
router.get('/user/:userId', walletController.getWalletsByUser);

// 지갑 정보 수정
router.put('/:walletId', walletController.updateWallet);

// 지갑 삭제
router.delete('/:walletId', walletController.deleteWallet);

// 사용자-지갑 매핑 (userId로 기본 지갑 지정)
router.post('/set-default', walletController.setUserDefaultWallet);

// 사용자별 기본 지갑 조회
router.get('/default/:userId', walletController.getUserDefaultWallet);

export default router;
