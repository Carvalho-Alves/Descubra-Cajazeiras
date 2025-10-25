import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createAvaliacaoController } from "../controller/createAvaliacao";
import { removeAvaliacaoController } from "../controller/deleteAvaliacao";
import { editAvaliacaoController } from "../controller/editAvaliacao";
import { findAllAvaliacaoController } from "../controller/findAllAvaliacao";
import { findAvaliacaoController } from "../controller/findAvaliacao";
import { listarAvaliacoesPorReferenciaController } from "../controller/findAvaliacaoRefe";
import { ensureAuth } from "../middleware/auth";
import { handleValidation } from "../middleware/handleValidation";
import {
	idParamValidator,
	referenciaParamsValidator,
	createAvaliacaoValidator,
	updateAvaliacaoValidator,
} from "../validators/avaliacaoValidators";

const router = Router();

// Listar todas (paginado)
router.get("/", asyncHandler(findAllAvaliacaoController));

// Listar por referência (tipo + id) + estatísticas
router.get(
	"/referencia/:tipo/:id",
	referenciaParamsValidator,
	handleValidation,
	asyncHandler(listarAvaliacoesPorReferenciaController)
);

// Criar (usuário autenticado)
router.post(
	"/",
	ensureAuth,
	createAvaliacaoValidator,
	handleValidation,
	asyncHandler(createAvaliacaoController)
);

// Buscar por ID
router.get(
	"/:id",
	idParamValidator,
	handleValidation,
	asyncHandler(findAvaliacaoController)
);

// Atualizar (dono)
router.put(
	"/:id",
	ensureAuth,
	idParamValidator,
	updateAvaliacaoValidator,
	handleValidation,
	asyncHandler(editAvaliacaoController)
);

// Remover (dono)
router.delete(
	"/:id",
	ensureAuth,
	idParamValidator,
	handleValidation,
	asyncHandler(removeAvaliacaoController)
);

export default router;
