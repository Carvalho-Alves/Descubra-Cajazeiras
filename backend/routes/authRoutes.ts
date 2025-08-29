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

export default router;