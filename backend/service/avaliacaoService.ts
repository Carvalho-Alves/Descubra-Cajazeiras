import { Types } from "mongoose";
import { Avaliacao } from "../models/avaliacao";
import { Servico } from "../models/servico";
import { Evento } from "../models/evento";
import { ref } from "process";

interface CriarAvaliacaoDTO {
  tipo: "servico" | "evento";
  referenciaId: string;
  nota: number;
  comentario?: string;
  usuarioId: string;
}

export const validarId = (id: string, nomeCampo = "ID") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`${nomeCampo}ID inválido.`);
  }
}

// Criar avaliação
export const criarAvaliacao = async (dados: CriarAvaliacaoDTO) => {
  const { tipo, referenciaId, nota, comentario, usuarioId } = dados;

  if (!["servico", "evento"].includes(tipo)) {
    throw new Error("Tipo inválido. Use 'servico' ou 'evento'.");
  }

  validarId(referenciaId, "ID de Referência ");

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
export const obterEstatisticasAvaliacao = async (
  tipo: "servico" | "evento",
  referenciaId: string
) => {
  validarId(referenciaId, "ID de Referência ");
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
export const buscarPorIdAvaliacao = async (id: string) => {
  validarId(id, "ID");
  const avaliacao = await Avaliacao.findById(id).lean();
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  return avaliacao; 
};

// Atualizar
export const atualizarAvaliacao = async (
  id: string,
  usuarioId: string,
  data: { nota?: number; comentario?: string }
) => {
  validarId(id, "ID");
  if (data.nota && (data.nota < 1 || data.nota > 5)) {
    throw new Error("A nota deve ser entre 1 e 5.");
  }
  const avaliacao = await Avaliacao.findByIdAndUpdate(
    {_id: id, usuarioId: usuarioId},
    data,
    { new: true , lean: true}
  );
  if (!avaliacao) {
    throw new Error("Avaliação não encontrada.");
  }

  return avaliacao;
};

// Remover
export const removerAvaliacao = async (id: string, usuarioId: string) => {
  validarId(id, "ID");
  
  const avaliacao = await Avaliacao.findOneAndDelete(
    { _id: id, usuarioId: usuarioId }
  );

  if (!avaliacao) {
    throw new Error("Avaliação não encontrada ou não autorizada a deletar.");
  }

  return true;
};

// Lista todos
export const listarTodasAValiacao = async (limit = 20, page = 1) => {
  return Avaliacao.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
};
