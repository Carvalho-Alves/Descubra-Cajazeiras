import { Router } from 'express';
import {createServicoController} from '../controller/createServico';
import {deleteServicoController} from '../controller/deleteServico';
import {editServicoController} from '../controller/editServico';
import {findAllServicoController} from '../controller/findAllServico';
import { findMyServicosController } from '../controller/findMyServicos';
import {findServicoController} from '../controller/findServico';
import { searchServicoController } from '../controller/searchServico';
import { asyncHandler } from '../utils/asyncHandler'; 
import { ensureAuth } from '../middleware/auth';
import multer from 'multer';
import uploadConfig from '../service/uploadConfig';

const router = Router();
const upload = multer(uploadConfig.upload('uploads'));

router.get('/', asyncHandler(findAllServicoController));
router.get('/mine', ensureAuth, asyncHandler(findMyServicosController));

router.get('/search', asyncHandler(searchServicoController));

router.get('/:id', asyncHandler(findServicoController));

router.post('/', ensureAuth, upload.single('imagem'), asyncHandler(createServicoController));

router.put('/:id', ensureAuth, upload.single('imagem'), asyncHandler(editServicoController));

router.delete('/:id', ensureAuth, asyncHandler(deleteServicoController));

export default router;