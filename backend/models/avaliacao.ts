import { Schema, model, Document, Types } from "mongoose";

export interface IAvaliacao extends Document {
  tipo: "servico" | "evento";
  referenciaId: Types.ObjectId;
  usuarioId?: Types.ObjectId;
  nota: number;
  comentario?: string;
  criadoEm: Date;
}

const AvaliacaoSchema = new Schema<IAvaliacao>(
  {
    tipo: {
      type: String,
      enum: ["servico", "evento"],
      required: true,
    },
    referenciaId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    usuarioId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    nota: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comentario: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    collection: "avaliacoes",
  }
);

AvaliacaoSchema.index({ tipo: 1, referenciaId: 1 });

export const Avaliacao = model<IAvaliacao>("Avaliacao", AvaliacaoSchema);
