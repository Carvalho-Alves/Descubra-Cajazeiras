import { Router } from 'express';
import eventoController from '../controller/eventoController';

const router = Router();


router.post('/eventos', eventoController.create);

router.get('/eventos', eventoController.findAll);

router.get('/eventos/:id', eventoController.findById);

router.put('/eventos/:id', eventoController.update);

router.delete('/eventos/:id', eventoController.delete);

export default router;