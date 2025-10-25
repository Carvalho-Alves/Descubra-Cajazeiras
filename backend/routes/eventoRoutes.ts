import { Router } from 'express';
import {createEventoController} from '../controller/createEvento';
import {deleteEventoController} from '../controller/deleteEvento';
import {editEventoController} from '../controller/editEvento';
import {findAllEventoController} from '../controller/findAllEvento';
import {findEventoController} from '../controller/findEvento';
import { asyncHandler } from '../utils/asyncHandler'; 
import { searchEventoController } from '../controller/searchEvento';
import { ensureAuth } from '../middleware/auth';

const router = Router();

router.post('/', ensureAuth, asyncHandler(createEventoController)); 

router.get('/', asyncHandler(findAllEventoController));
router.get('/search', asyncHandler(searchEventoController));

router.get('/:id', asyncHandler(findEventoController));

router.put('/:id', ensureAuth, asyncHandler(editEventoController));

router.delete('/:id', ensureAuth, asyncHandler(deleteEventoController));

export default router;