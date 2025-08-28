import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as avaliacaoController from "../controller/avaliacaoController";

const router = Router();

// Criar avaliação (opcionalmente autenticado)
router.post("/", asyncHandler(avaliacaoController.create));

// Listar avaliações e estatísticas por referência
// Ex.: GET /api/avaliacoes/servico/:id
router.get("/:tipo/:id", asyncHandler(avaliacaoController.listarPorReferencia));

export default router;
