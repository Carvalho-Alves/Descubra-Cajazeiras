import { Schema, model, Document, Types } from "mongoose";

// --- DEFINIÇÃO DOS LIMITES GEOGRÁFICOS ---
const limitesCajazeiras = {
  latMin: -6.95, // Sul
  latMax: -6.83, // Norte
  lonMin: -38.62, // Oeste
  lonMax: -38.50  // Leste
};

export interface IEstabelecimento extends Document {
  nome: string;
  tipo: "Restaurante" | "Bar" | "Loja" | "Farmácia" | "Supermercado" | "Outros";
  categoria: string;
  descricao: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cep: string;
  };
  localizacao: {
    latitude: number;
    longitude: number;
  };
  contato: {
    telefone: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    site?: string;
  };
  horario_funcionamento: {
    segunda?: { abertura: string; fechamento: string; fechado: boolean };
    terca?: { abertura: string; fechamento: string; fechado: boolean };
    quarta?: { abertura: string; fechamento: string; fechado: boolean };
    quinta?: { abertura: string; fechamento: string; fechado: boolean };
    sexta?: { abertura: string; fechamento: string; fechado: boolean };
    sabado?: { abertura: string; fechamento: string; fechado: boolean };
    domingo?: { abertura: string; fechamento: string; fechado: boolean };
  };
  servicos: string[]; // Delivery, Wi-Fi, Estacionamento, etc.
  pagamentos: string[]; // Dinheiro, Cartão, PIX, etc.
  imagens: string[];
  status: "ativo" | "inativo" | "temporariamente_fechado";
  usuario: Types.ObjectId;
}

const EstabelecimentoSchema = new Schema<IEstabelecimento>(
  {
    nome: {
      type: String,
      required: [true, "O nome do estabelecimento é obrigatório."],
      trim: true,
    },
    tipo: {
      type: String,
      required: [true, "O tipo do estabelecimento é obrigatório."],
      enum: ["Restaurante", "Bar", "Loja", "Farmácia", "Supermercado", "Outros"],
    },
    categoria: {
      type: String,
      required: [true, "A categoria é obrigatória."],
      trim: true,
    },
    descricao: {
      type: String,
      required: [true, "A descrição é obrigatória."],
      trim: true,
    },
    endereco: {
      rua: {
        type: String,
        required: [true, "A rua é obrigatória."],
        trim: true,
      },
      numero: {
        type: String,
        required: [true, "O número é obrigatório."],
        trim: true,
      },
      bairro: {
        type: String,
        required: [true, "O bairro é obrigatório."],
        trim: true,
      },
      cep: {
        type: String,
        required: [true, "O CEP é obrigatório."],
        trim: true,
      },
    },
    localizacao: {
      latitude: {
        type: Number,
        required: [true, "A latitude é obrigatória."],
        validate: {
          validator: (lat: number) => lat >= limitesCajazeiras.latMin && lat <= limitesCajazeiras.latMax,
          message: "A latitude fornecida está fora da área de Cajazeiras."
        }
      },
      longitude: {
        type: Number,
        required: [true, "A longitude é obrigatória."],
        validate: {
          validator: (lon: number) => lon >= limitesCajazeiras.lonMin && lon <= limitesCajazeiras.lonMax,
          message: "A longitude fornecida está fora da área de Cajazeiras."
        }
      },
    },
    contato: {
      telefone: {
        type: String,
        required: [true, "O telefone é obrigatório."],
        trim: true,
      },
      whatsapp: { type: String, trim: true },
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      site: { type: String, trim: true },
    },
    horario_funcionamento: {
      segunda: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
      terca: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
      quarta: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
      quinta: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
      sexta: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
      sabado: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
      domingo: {
        abertura: { type: String, trim: true },
        fechamento: { type: String, trim: true },
        fechado: { type: Boolean, default: false }
      },
    },
    servicos: {
      type: [String],
      default: [],
    },
    pagamentos: {
      type: [String],
      default: [],
    },
    imagens: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["ativo", "inativo", "temporariamente_fechado"],
      default: "ativo",
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
    collection: "estabelecimentos_comerciais",
  }
);

// Exportações para compatibilidade
export const EstabelecimentoComercial = model<IEstabelecimento>(
  "EstabelecimentoComercial",
  EstabelecimentoSchema
);

// Export padrão para uso no service
export const Estabelecimento = EstabelecimentoComercial;

// Export default para compatibilidade
export default EstabelecimentoComercial;

// Criar índices geospaciais
EstabelecimentoSchema.index({ localizacao: "2dsphere" });
EstabelecimentoSchema.index({ "endereco.bairro": 1 });
EstabelecimentoSchema.index({ tipo: 1, status: 1 });
