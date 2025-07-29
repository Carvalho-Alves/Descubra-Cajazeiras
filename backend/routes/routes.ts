// backend/routes/router.ts
import { Router } from 'express';
import { login, cadastrar } from '../controller/controller';

const router = Router();

router.post('/login', login);
router.post('/cadastro', cadastrar);

export default router;