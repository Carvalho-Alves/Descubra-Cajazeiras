import { Types } from "mongoose";
import { Avaliacao } from "../models/avaliacao";
import { Servico } from "../models/servico";
import { Evento } from "../models/evento";

interface CriarAvaliacaoDTO {
  tipo: "servico" | "evento";
  referenciaId: string;
  usuarioId: string;
  nota: number;
  comentario?: string;
}

export const validarId = (id: string, nomeCampo = "ID") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`${nomeCampo} inválido.`);
  }
};

const assertTipo = (tipo: string) => {
  if (!["servico", "evento"].includes(tipo)) {
    throw new Error("Tipo inválido. Use 'servico' ou 'evento'.");
  }
};

const assertNota = (nota: number) => {
  if (typeof nota !== "number" || nota < 1 || nota > 5) {
    throw new Error("A nota deve ser entre 1 e 5.");
  }
};

/* ------------------------------- Criar ---------------------------------- */
export const criarAvaliacao = async (dados: CriarAvaliacaoDTO) => {
  const { tipo, referenciaId, usuarioId, nota, comentario } = dados;

  assertTipo(tipo);
  assertNota(nota);
  validarId(referenciaId, "Referência");
  validarId(usuarioId, "Usuário");

  // Garante que o item existe
  if (tipo === "servico") {
    const servico = await Servico.findById(referenciaId).select("_id").lean();
    if (!servico) throw new Error("Serviço não encontrado.");
  } else {
    const evento = await Evento.findById(referenciaId).select("_id").lean();
    if (!evento) throw new Error("Evento não encontrado.");
  }

  // Regra anti-duplicidade: 1 avaliação por usuário para o mesmo item
  const existing = await Avaliacao.findOne({ tipo, referenciaId, usuarioId }).lean();
  if (existing) {
    throw new Error("Você já avaliou este item.");
  }

  const doc = await Avaliacao.create({
    tipo,
    referenciaId,
    usuarioId,
    nota,
    comentario,
  });

  return doc.toObject();
};

/* -------------- Listar avaliações por referência (item) ----------------- */
export const listarAvaliacoesPorReferencia = async (
  tipo: "servico" | "evento",
  referenciaId: string,
  limit = 20,
  page = 1
) => {
  assertTipo(tipo);
  validarId(referenciaId, "Referência");

  return Avaliacao.find({ tipo, referenciaId })
    .sort({ criadoEm: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

/* ------------------- Estatísticas por referência (item) ------------------ */
export const obterEstatisticasAvaliacao = async (
  tipo: "servico" | "evento",
  referenciaId: string
) => {
  assertTipo(tipo);
  validarId(referenciaId, "Referência");

  const stats = await Avaliacao.aggregate([
    { $match: { tipo, referenciaId: new Types.ObjectId(referenciaId) } },
    { $group: { _id: null, media: { $avg: "$nota" }, total: { $sum: 1 } } },
  ]);

  if (stats.length === 0) return { media: 0, total: 0 };
  return {
    media: Number(stats[0].media.toFixed(2)),
    total: stats[0].total,
  };
};

/* ----------------------------- Buscar por ID ----------------------------- */
export const buscarPorIdAvaliacao = async (id: string) => {
  validarId(id, "ID");
  const avaliacao = await Avaliacao.findById(id).lean();
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  return avaliacao;
};

/* ------------------------------- Atualizar ------------------------------- */
export const atualizarAvaliacao = async (
  id: string,
  usuarioId: string,
  data: { nota?: number; comentario?: string }
) => {
  validarId(id, "ID");
  validarId(usuarioId, "Usuário");

  if (data.nota !== undefined) assertNota(data.nota);

  // Só o dono pode atualizar
  const updated = await Avaliacao.findOneAndUpdate(
    { _id: id, usuarioId },
    { $set: data },
    { new: true, lean: true }
  );

  if (!updated) throw new Error("Avaliação não encontrada ou não autorizada.");
  return updated;
};

/* -------------------------------- Remover -------------------------------- */
export const removerAvaliacao = async (id: string, usuarioId: string) => {
  validarId(id, "ID");
  validarId(usuarioId, "Usuário");

  const removed = await Avaliacao.findOneAndDelete({ _id: id, usuarioId });
  if (!removed) throw new Error("Avaliação não encontrada ou não autorizada a deletar.");
  return true;
};

/* -------------------------- Listar todas (paginado) ---------------------- */
export const listarTodasAValiacao = async (limit = 20, page = 1) => {
  return Avaliacao.find()
    .sort({ criadoEm: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};
