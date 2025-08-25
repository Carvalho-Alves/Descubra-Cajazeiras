import { Schema, model, Document, Types } from "mongoose";

// --- DEFINIÇÃO DOS LIMITES GEOGRÁFICOS ---
const limitesCajazeiras = {
  latMin: -6.95, // Sul
  latMax: -6.83, // Norte
  lonMin: -38.62, // Oeste
  lonMax: -38.50  // Leste
};

export interface IServico extends Document {
  nome: string;
  descricao?: string;
  tipo_servico: "Hospedagem" | "Alimentação/Lazer" | "Ponto Turístico";
  categoria?: string;
  contato?: {
    telefone?: string;
    instagram?: string;
  };
  localizacao?: {
    latitude?: number;
    longitude?: number;
  };
  imagens?: string[];
  usuario: Types.ObjectId;
}

const ServicoTuristicoSchema = new Schema<IServico>(
  {
    nome: {
      type: String,
      required: [true, "O nome do serviço é obrigatório."],
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    tipo_servico: {
      type: String,
      required: [true, "O tipo de serviço é obrigatório."],
      enum: ["Hospedagem", "Alimentação/Lazer", "Ponto Turístico"],
    },
    categoria: {
      type: String,
      trim: true,
    },
    contato: {
      telefone: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    localizacao: {
      latitude: { 
        type: Number,
        // --- VALIDAÇÃO ADICIONADA AQUI ---
        validate: {
          validator: (lat: number) => lat >= limitesCajazeiras.latMin && lat <= limitesCajazeiras.latMax,
          message: 'A latitude fornecida está fora da área de Cajazeiras.'
        }
      },
      longitude: { 
        type: Number,
        // --- VALIDAÇÃO ADICIONADA AQUI ---
        validate: {
          validator: (lon: number) => lon >= limitesCajazeiras.lonMin && lon <= limitesCajazeiras.lonMax,
          message: 'A longitude fornecida está fora da área de Cajazeiras.'
        }
      },
    },
    imagens: {
      type: [String],
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "servicos_turisticos",
  }
);

// Exportações para compatibilidade
export const ServicoTuristico = model<IServico>(
  "ServicoTuristico",
  ServicoTuristicoSchema
);

// Export padrão para uso no service
export const Servico = ServicoTuristico;