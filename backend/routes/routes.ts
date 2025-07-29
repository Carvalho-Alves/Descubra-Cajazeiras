// backend/routes/router.ts
import { Router } from 'express';
import { login, cadastrar, findUsers, findUser, deleteUser, editUser } from '../controller/controller';

const router = Router();

router.post('/login', login);
router.post('/cadastro', cadastrar);
router.get('/', findUsers);
router.get(':/id', findUser);
router.delete(':/id', deleteUser);
router.patch(':/id', editUser);

export default router;