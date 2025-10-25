import { Router } from 'express';
import { loginController } from '../controller/loginUser';
import { registerController } from '../controller/createUser';
import { editUser } from '../controller/editUser';
import { findUser } from '../controller/findUser';
import { getUsers } from '../controller/findUsers';
import { deleteUser } from '../controller/deleteUser';
import { asyncHandler } from '../utils/asyncHandler';
import multer from 'multer';

import uploadConfig from '../service/uploadConfig'; 

const router = Router();
const upload = multer(uploadConfig.upload('uploads'));

router.post('/login', asyncHandler(loginController));
router.get('/:id', asyncHandler(findUser));
router.get('/', asyncHandler(getUsers));
router.post('/register', upload.single('foto'), asyncHandler(registerController));
router.put('/:id', upload.single('foto'), asyncHandler(editUser));
router.delete('/:id', asyncHandler(deleteUser));

// Rota utilitária (dev) para atualizar senha por e-mail quando necessário
// ATENÇÃO: mantenha desabilitada em produção
router.put('/reset-password/by-email/:email', asyncHandler(async (req, res) => {
	const { email } = req.params;
	const { senha } = req.body || {};
	if (!senha || senha.length < 6) return res.status(400).json({ message: 'Senha inválida' });
	const user = await (await import('../models/user')).User.findOne({ email });
	if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
	user.senha = senha;
	await user.save();
	return res.json({ message: 'Senha atualizada' });
}));

export default router;