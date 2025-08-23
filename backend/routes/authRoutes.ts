import { Router } from 'express';
import { loginController } from '../controller/loginUser';
import { registerController } from '../controller/createUser';
import { findUser } from '../controller/findUser';
import { getUsers } from '../controller/findUsers';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/login', asyncHandler(loginController));
router.post('/register', asyncHandler(registerController));
router.get('/:id', asyncHandler(findUser));
router.get('/', asyncHandler(getUsers));

export default router;