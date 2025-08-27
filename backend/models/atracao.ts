import { Schema, model, Document, Types } from "mongoose";

// --- DEFINIÇÃO DOS LIMITES GEOGRÁFICOS ---
const limitesCajazeiras = {
  latMin: -6.95, // Sul
  latMax: -6.83, // Norte
  lonMin: -38.62, // Oeste
  lonMax: -38.50  // Leste
};

export interface IAtracao extends Document {
  nome: string;
  tipo: "Histórico" | "Cultural" | "Natural" | "Religioso" | "Gastronômico" | "Esportivo" | "Lazer" | "Outros";
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
    telefone?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    site?: string;
    email?: string;
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
  informacoes: {
    entrada_gratuita: boolean;
    preco_entrada?: number;
    duracao_media?: string; // Tempo médio de visita
    melhor_epoca?: string; // Melhor época para visitar
    acessibilidade?: string[]; // Para pessoas com deficiência
    estacionamento: boolean;
    banheiros: boolean;
    restaurante: boolean;
    loja_souvenirs: boolean;
  };
  servicos: string[]; // Guia turístico, Áudio guia, etc.
  atividades: string[]; // Trilhas, Passeios, Workshops, etc.
  imagens: string[];
  status: "ativo" | "inativo" | "em_manutencao" | "temporariamente_fechado";
  destaque: boolean; // Se é um ponto turístico destacado
  avaliacao_media: number; // Média das avaliações dos usuários
  total_avaliacoes: number; // Total de avaliações
  usuario: Types.ObjectId;
}

const AtracaoSchema = new Schema<IAtracao>(
  {
    nome: {
      type: String,
      required: [true, "O nome da atração é obrigatório."],
      trim: true,
    },
    tipo: {
      type: String,
      required: [true, "O tipo da atração é obrigatório."],
      enum: ["Histórico", "Cultural", "Natural", "Religioso", "Gastronômico", "Esportivo", "Lazer", "Outros"],
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
      telefone: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      site: { type: String, trim: true },
      email: { type: String, trim: true },
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
    informacoes: {
      entrada_gratuita: {
        type: Boolean,
        required: [true, "Informar se a entrada é gratuita é obrigatório."],
      },
      preco_entrada: { type: Number, min: 0 },
      duracao_media: { type: String, trim: true },
      melhor_epoca: { type: String, trim: true },
      acessibilidade: { type: [String], default: [] },
      estacionamento: { type: Boolean, default: false },
      banheiros: { type: Boolean, default: false },
      restaurante: { type: Boolean, default: false },
      loja_souvenirs: { type: Boolean, default: false },
    },
    servicos: {
      type: [String],
      default: [],
    },
    atividades: {
      type: [String],
      default: [],
    },
    imagens: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["ativo", "inativo", "em_manutencao", "temporariamente_fechado"],
      default: "ativo",
    },
    destaque: {
      type: Boolean,
      default: false,
    },
    avaliacao_media: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    total_avaliacoes: {
      type: Number,
      default: 0,
      min: 0,
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
    collection: "atracoes_turisticas",
  }
);

// Criar índices
AtracaoSchema.index({ localizacao: "2dsphere" });
AtracaoSchema.index({ "endereco.bairro": 1 });
AtracaoSchema.index({ tipo: 1, status: 1 });
AtracaoSchema.index({ destaque: 1 });
AtracaoSchema.index({ avaliacao_media: -1 });

// Exportações
export const Atracao = model<IAtracao>("Atracao", AtracaoSchema);
export default Atracao;
