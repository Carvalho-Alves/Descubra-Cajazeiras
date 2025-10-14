import { Schema, model, Document, Types } from "mongoose";

export interface IAvaliacao extends Document {
  tipo: "servico" | "evento";
  referenciaId: Types.ObjectId;   // <- aponta para Servico ou Evento, conforme "tipo"
  usuarioId: Types.ObjectId;      // <- obrigatório (vem do token)
  nota: number;                   // 1..5
  comentario?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const AvaliacaoSchema = new Schema<IAvaliacao>(
  {
    tipo: {
      type: String,
      enum: ["servico", "evento"],
      required: true,
      index: true,
    },
    referenciaId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nota: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comentario: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    collection: "avaliacoes",
  }
);

/**
 * Índices úteis
 * - Busca cronológica por item avaliado
 * - Evitar avaliações duplicadas do mesmo usuário no mesmo item
 */
AvaliacaoSchema.index({ tipo: 1, referenciaId: 1, criadoEm: -1 });
AvaliacaoSchema.index({ tipo: 1, referenciaId: 1, usuarioId: 1 }, { unique: true });

export const Avaliacao = model<IAvaliacao>("Avaliacao", AvaliacaoSchema);
