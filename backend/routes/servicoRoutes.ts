import { Router } from 'express';
import {createServicoController} from '../controller/createServico';
import {deleteServicoController} from '../controller/deleteServico';
import {editServicoController} from '../controller/editServico';
import {findAllServicoController} from '../controller/findAllServico';
import {findServicoController} from '../controller/findServico';
import { asyncHandler } from '../utils/asyncHandler'; 
import { ensureAuth } from '../middleware/auth';

const router = Router();

router.get('/', asyncHandler(findAllServicoController));

router.get('/:id', asyncHandler(findServicoController));

router.post('/', ensureAuth, asyncHandler(createServicoController));

router.put('/:id', ensureAuth, asyncHandler(editServicoController));

router.delete('/:id', ensureAuth, asyncHandler(deleteServicoController));

export default router;