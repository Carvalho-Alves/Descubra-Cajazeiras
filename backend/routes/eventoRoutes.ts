import { Router } from 'express';
import eventoController from '../controller/eventoController';
import { asyncHandler } from '../utils/asyncHandler'; 

const router = Router();



router.post('/', asyncHandler(eventoController.create)); 

router.get('/', asyncHandler(eventoController.findAll));

router.get('/:id', asyncHandler(eventoController.findById));

router.put('/:id', asyncHandler(eventoController.update));

router.delete('/:id', asyncHandler(eventoController.delete));

export default router;