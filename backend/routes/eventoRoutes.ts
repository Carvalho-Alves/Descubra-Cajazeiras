import { Router } from 'express';
import eventoController from '../controller/eventoController';

const router = Router();


router.post('/', eventoController.create); 

router.get('/', eventoController.findAll);

router.get('//:id', eventoController.findById);

router.put('/:id', eventoController.update);

router.delete('/:id', eventoController.delete);

export default router;