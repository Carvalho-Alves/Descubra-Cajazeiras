import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { estatisticasController } from '../controller/estatisticasController';

const router = Router();

router.get('/', asyncHandler(estatisticasController));

export default router;
