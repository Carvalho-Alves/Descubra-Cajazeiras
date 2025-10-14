import { Types } from "mongoose";

export type TipoAvaliacao = "servico" | "evento";

export interface CriarAvaliacaoDTO {
  tipo: TipoAvaliacao;
  nota: number;
  comentario?: string;
  usuarioId: string;
}

export const validarId = (id: string, nomeCampo = "ID") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`${nomeCampo} inválido.`);
  }
};

export const validarTipo = (tipo: string) => {
  if (!["servico", "evento"].includes(tipo)) {
    throw new Error("Tipo inválido. Use 'servico' ou 'evento'.");
  }
};

export const validarNota = (nota: number) => {
  if (typeof nota !== "number" || nota < 1 || nota > 5) {
    throw new Error("A nota deve ser entre 1 e 5.");
  }
};

/**
 * Validação de entrada para criação
 */
export const validarCriacaoAvaliacao = (dados: CriarAvaliacaoDTO) => {
  validarTipo(dados.tipo);
  validarNota(dados.nota);
  if (!dados.usuarioId) {
    throw new Error("Usuário não informado.");
  }
  if (!Types.ObjectId.isValid(dados.usuarioId)) {
    throw new Error("UsuárioID inválido.");
  }
};
