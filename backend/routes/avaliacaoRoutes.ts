import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createAvaliacaoController } from '../controller/createAvaliacao';
import { removeAvaliacaoController } from '../controller/deleteAvaliacao';
import { editAvaliacaoController } from '../controller/editAvaliacao';
import { findAllAvaliacaoController } from '../controller/findAllAvaliacao';
import { findAvaliacaoController } from '../controller/findAvaliacao';
import { listarAvaliacoesPorReferenciaController } from '../controller/listarAvaliacaoRefe';
import { ensureAuth } from "../middleware/auth";

const router = Router();

// Listar todas as avaliações (paginado)
router.get("/", asyncHandler(findAllAvaliacaoController));

// Listar avaliações e estatísticas por referência
router.get("/referencia/:tipo/:id", asyncHandler(listarAvaliacoesPorReferenciaController));

// Criar avaliação (usuário autenticado)
router.post("/", ensureAuth, asyncHandler(createAvaliacaoController));

// Buscar avaliação por ID
router.get("/:id", asyncHandler(findAvaliacaoController));

// Atualizar avaliação (requer autenticação e ser dono da avaliação)
router.put("/:id", ensureAuth, asyncHandler(editAvaliacaoController));

// Remover avaliação (requer autenticação e ser dono da avaliação)
router.delete("/:id", ensureAuth, asyncHandler(removeAvaliacaoController));

export default router;