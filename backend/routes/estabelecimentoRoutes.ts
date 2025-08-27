import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureAuth } from '../middleware/auth';

// Importa todas as funções do controller
import * as estabelecimentoController from '../controller/estabelecimentoController';

// Importa as validações
import {
  validateCreateEstabelecimento,
  validateUpdateEstabelecimento,
  validateGetById,
  validateGetByType,
  validateGetNearby,
  validateRemove
} from '../validations/estabelecimentoValidation';

const router = Router();

// =================================================================
// ROTAS PÚBLICAS (para qualquer visitante/turista)
// =================================================================

// GET /api/estabelecimentos -> Lista todos os estabelecimentos
router.get('/', asyncHandler(estabelecimentoController.listAll));

// GET /api/estabelecimentos/proximos -> Busca estabelecimentos próximos
router.get('/proximos', validateGetNearby, asyncHandler(estabelecimentoController.getNearby));

// GET /api/estabelecimentos/tipo/:tipo -> Lista estabelecimentos por tipo
router.get('/tipo/:tipo', validateGetByType, asyncHandler(estabelecimentoController.getByType));

// GET /api/estabelecimentos/:id -> Vê os detalhes de um estabelecimento
router.get('/:id', validateGetById, asyncHandler(estabelecimentoController.getById));

// =================================================================
// ROTAS PRIVADAS (apenas para administradores logados)
// =================================================================

// POST /api/estabelecimentos -> Cria um novo estabelecimento
router.post('/', ensureAuth, validateCreateEstabelecimento, asyncHandler(estabelecimentoController.create));

// PUT /api/estabelecimentos/:id -> Atualiza um estabelecimento existente
router.put('/:id', ensureAuth, validateUpdateEstabelecimento, asyncHandler(estabelecimentoController.update));

// DELETE /api/estabelecimentos/:id -> Deleta um estabelecimento
router.delete('/:id', ensureAuth, validateRemove, asyncHandler(estabelecimentoController.remove));

export default router;
