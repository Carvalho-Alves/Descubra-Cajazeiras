import { Types } from "mongoose";
import { Avaliacao } from "../models/avaliacao";
import { Servico } from "../models/servico";
import { Evento } from "../models/evento";

interface CriarAvaliacaoDTO {
  tipo: "servico" | "evento";
  referenciaId: string;
  nota: number;
  comentario?: string;
  usuarioId?: string;
}

// Criar avaliação
export const criarAvaliacao = async (dados: CriarAvaliacaoDTO) => {
  const { tipo, referenciaId, nota, comentario, usuarioId } = dados;

  if (!["servico", "evento"].includes(tipo)) {
    throw new Error("Tipo inválido. Use 'servico' ou 'evento'.");
  }

  if (!Types.ObjectId.isValid(referenciaId)) {
    throw new Error("ID de referência inválido.");
  }

  if (nota < 1 || nota > 5) {
    throw new Error("A nota deve ser entre 1 e 5.");
  }

  // Verifica se o serviço/evento existe
  if (tipo === "servico") {
    const servico = await Servico.findById(referenciaId);
    if (!servico) throw new Error("Serviço não encontrado.");
  } else {
    const evento = await Evento.findById(referenciaId);
    if (!evento) throw new Error("Evento não encontrado.");
  }

  const avaliacao = await Avaliacao.create({
    tipo,
    referenciaId,
    nota,
    comentario,
    usuarioId,
  });

  return avaliacao.toObject();
};

// Listar avaliações de um serviço/evento
export const listarAvaliacoesPorReferencia = async (
  tipo: "servico" | "evento",
  referenciaId: string,
  limit = 20,
  page = 1
) => {
  return Avaliacao.find({ tipo, referenciaId })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};

// Estatísticas (média e total)
export const obterEstatisticas = async (
  tipo: "servico" | "evento",
  referenciaId: string
) => {
  const stats = await Avaliacao.aggregate([
    { $match: { tipo, referenciaId: new Types.ObjectId(referenciaId) } },
    {
      $group: {
        _id: null,
        media: { $avg: "$nota" },
        total: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) return { media: 0, total: 0 };

  return {
    media: Number(stats[0].media.toFixed(2)),
    total: stats[0].total,
  };
};

// Buscar por ID
export const buscarPorId = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("ID inválido.");
  const avaliacao = await Avaliacao.findById(id).lean();
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  return avaliacao; 
};

// Atualizar
export const atualizar = async (
  id: string,
  usuarioId: string,
  data: { nota?: number; comentario?: string }
) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("ID inválido.");
  const avaliacao = await Avaliacao.findById(id);
  if (!avaliacao) throw new Error("Avaliação não encontrada.");

  if (usuarioId && avaliacao.usuarioId?.toString() !== usuarioId) {
    throw new Error("Não autorizado a atualizar esta avaliação.");
  }

  if (data.nota) avaliacao.nota = data.nota;
  if (data.comentario !== undefined) avaliacao.comentario = data.comentario;

  await avaliacao.save();
  return avaliacao.toObject();
};

// Remover
export const remover = async (id: string, usuarioId: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("ID inválido.");
  const avaliacao = await Avaliacao.findById(id);
  if (!avaliacao) throw new Error("Avaliação não encontrada.");

  if (usuarioId && avaliacao.usuarioId?.toString() !== usuarioId) {
    throw new Error("Não autorizado a deletar esta avaliação.");
  }
  await Avaliacao.findByIdAndDelete(id);
  return true;
};

// Lista todos
export const listarTodas = async (limit = 20, page = 1) => {
  return Avaliacao.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};
