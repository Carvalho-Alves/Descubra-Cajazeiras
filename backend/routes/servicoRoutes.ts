import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureAuth } from '../middleware/auth';
import { createServicoController, listServicosController, getServicoController, updateServicoController, deleteServicoController } from '../controller/servicoController';

const router = Router();

router.use(ensureAuth);

router.post('/create', asyncHandler(createServicoController));
router.get('/', asyncHandler(listServicosController));
router.get('/:id', asyncHandler(getServicoController));
router.put('/:id', asyncHandler(updateServicoController));
router.delete('/:id', asyncHandler(deleteServicoController));

export default router;


