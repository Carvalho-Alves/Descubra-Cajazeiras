import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as avaliacaoController from "../controller/avaliacaoController";
import { ensureAuth } from "../middleware/auth";

const router = Router();

// Listar todas as avaliações (paginado)
router.get("/", asyncHandler(avaliacaoController.listarTodas));

// Criar avaliação (usuário autenticado)
router.post("/", ensureAuth, asyncHandler(avaliacaoController.create));

// Listar avaliações e estatísticas por referência
router.get("/:tipo/:id", asyncHandler(avaliacaoController.listarPorReferencia));

// Buscar avaliação por ID
router.get("/:id", asyncHandler(avaliacaoController.getById));

// Atualizar avaliação (requer autenticação e ser dono da avaliação)
router.put("/:id", ensureAuth, asyncHandler(avaliacaoController.update));

// Remover avaliação (requer autenticação e ser dono da avaliação)
router.delete("/:id", ensureAuth, asyncHandler(avaliacaoController.remove));

export default router;