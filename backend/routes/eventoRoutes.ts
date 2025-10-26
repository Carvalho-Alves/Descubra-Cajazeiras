import { Router } from 'express';
import {createEventoController} from '../controller/createEvento';
import {deleteEventoController} from '../controller/deleteEvento';
import {editEventoController} from '../controller/editEvento';
import {findAllEventoController} from '../controller/findAllEvento';
import { findMyEventosController } from '../controller/findMyEventos';
import {findEventoController} from '../controller/findEvento';
import { asyncHandler } from '../utils/asyncHandler'; 
import { searchEventoController } from '../controller/searchEvento';
import { ensureAuth } from '../middleware/auth';
import multer from 'multer';
import uploadConfig from '../service/uploadConfig';

const router = Router();
const upload = multer(uploadConfig.upload('uploads'));

router.post('/', ensureAuth, upload.single('imagem'), asyncHandler(createEventoController)); 

router.get('/', asyncHandler(findAllEventoController));
router.get('/mine', ensureAuth, asyncHandler(findMyEventosController));
router.get('/search', asyncHandler(searchEventoController));

router.get('/:id', asyncHandler(findEventoController));

router.put('/:id', ensureAuth, upload.single('imagem'), asyncHandler(editEventoController));

router.delete('/:id', ensureAuth, asyncHandler(deleteEventoController));

export default router;