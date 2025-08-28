import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as avaliacaoController from "../controller/avaliacaoController";
import { ensureAuth } from "../middleware/auth";

const router = Router();

// Criar avaliação (usuário autenticado ou anônimo)
router.post("/", asyncHandler(avaliacaoController.create));

// Listar avaliações e estatísticas por referência
// Ex.: GET /api/avaliacoes/servico/:id
router.get("/:tipo/:id", asyncHandler(avaliacaoController.listarPorReferencia));

// Buscar avaliação por ID
router.get("/id/:id", asyncHandler(avaliacaoController.getById));

// Atualizar avaliação (requer autenticação e ser dono da avaliação)
router.put("/:id", ensureAuth, asyncHandler(avaliacaoController.update));

// Remover avaliação (requer autenticação e ser dono da avaliação)
router.delete("/:id", ensureAuth, asyncHandler(avaliacaoController.remove));

export default router;
