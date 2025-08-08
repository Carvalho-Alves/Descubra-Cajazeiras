// backend/routes/router.ts
import { Router } from 'express';
import { loginUser, createUser, findUsers, findUser, deleteUser, editUser } from '../controller/controller';

const router = Router();

router.post('/login', loginUser);
router.post('/cadastro', createUser);
router.get('/', findUsers);
router.get(':/id', findUser);
router.delete(':/id', deleteUser);
router.patch(':/id', editUser);

export default router;