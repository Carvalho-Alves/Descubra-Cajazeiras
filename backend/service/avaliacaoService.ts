import { Types } from "mongoose";
import { Avaliacao } from "../models/avaliacao";

export const buscarPorId = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("ID inválido.");
  const avaliacao = await Avaliacao.findById(id).lean();
  if (!avaliacao) throw new Error("Avaliação não encontrada.");
  return avaliacao;
};

export const atualizar = async (
  id: string,
  usuarioId: string,
  data: { nota?: number; comentario?: string }
) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("ID inválido.");
  const avaliacao = await Avaliacao.findById(id);
  if (!avaliacao) throw new Error("Avaliação não encontrada.");

  // regra simples: só o criador pode editar
  if (usuarioId && avaliacao.usuarioId?.toString() !== usuarioId) {
    throw new Error("Não autorizado a atualizar esta avaliação.");
  }

  if (data.nota) avaliacao.nota = data.nota;
  if (data.comentario !== undefined) avaliacao.comentario = data.comentario;

  await avaliacao.save();
  return avaliacao.toObject();
};

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
export function criarAvaliacao(arg0: { tipo: any; referenciaId: any; nota: any; comentario: any; usuarioId: any; }) {
    throw new Error("Function not implemented.");
}

export function listarAvaliacoesPorReferencia(arg0: any, id: string, limit: number, page: number) {
    throw new Error("Function not implemented.");
}

export function obterEstatisticas(arg0: any, id: string) {
    throw new Error("Function not implemented.");
}

