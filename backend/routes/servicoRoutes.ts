import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureAuth } from '../middleware/auth';

// 1. Importa todas as funções do controller de uma vez com um "apelido"
import * as servicoController from '../controller/servicoController';

const router = Router();

// =================================================================
// ROTAS PÚBLICAS (para qualquer visitante/turista)
// =================================================================

// GET /api/servicos -> Lista todos os serviços
router.get('/', asyncHandler(servicoController.listAll));

// GET /api/servicos/:id -> Vê os detalhes de um serviço
router.get('/:id', asyncHandler(servicoController.getById));


// =================================================================
// ROTAS PRIVADAS (apenas para administradores logados)
// =================================================================

// POST /api/servicos -> Cria um novo serviço
// O middleware 'ensureAuth' é adicionado aqui, protegendo apenas esta rota
router.post('/', ensureAuth, asyncHandler(servicoController.create));

// PUT /api/servicos/:id -> Atualiza um serviço existente
router.put('/:id', ensureAuth, asyncHandler(servicoController.update));

// DELETE /api/servicos/:id -> Deleta um serviço
router.delete('/:id', ensureAuth, asyncHandler(servicoController.remove));

export default router;