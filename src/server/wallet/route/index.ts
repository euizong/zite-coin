import { Router } from 'express';
import * as walletController from '../controller';

const router = Router();


router.get('/user/:user_id', walletController.getWalletsByUser);
router.get('/:id', walletController.getWalletById);
router.post('/', walletController.createWallet);
router.delete('/:id', walletController.deleteWallet);
router.patch('/:id/primary', walletController.setPrimaryWallet);

export default router;
