import { Router } from 'express';
import * as usersController from '../controller';
import { getMyInfo } from '../controller/info';

const router = Router();

router.get('/', usersController.getAllUsers);
router.get('/info', getMyInfo); // 내 정보
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.patch('/:id/deactivate', usersController.deactivateUser);

export default router;
