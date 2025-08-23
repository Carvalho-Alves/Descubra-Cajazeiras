import { Router } from 'express';
import { ensureAuth } from '../middleware/auth';
import { Foto } from '../models/fotos';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(ensureAuth);

router.post('/', asyncHandler(async (req, res) => {
  
    const foto = await Foto.create(req.body);
    res.status(201).json(foto);
  }));

router.get('/', asyncHandler(async (_req, res) => {
  const lista = await Foto.find().populate('autor local').limit(200);
  res.json(lista);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await Foto.findById(req.params.id).populate('autor local');
  if (!item) return res.status(404).json({ erro: 'Foto não encontrada' });
  res.json(item);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const item = await Foto.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Foto não encontrada' });
  res.status(204).end();
}));

export default router;