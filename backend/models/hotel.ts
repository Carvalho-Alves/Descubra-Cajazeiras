import { Schema, model, Document, Types } from "mongoose";

// --- DEFINIÇÃO DOS LIMITES GEOGRÁFICOS ---
const limitesCajazeiras = {
  latMin: -6.95, // Sul
  latMax: -6.83, // Norte
  lonMin: -38.62, // Oeste
  lonMax: -38.50  // Leste
};

export interface IHotel extends Document {
  nome: string;
  categoria: "Pousada" | "Hotel" | "Resort" | "Hostel" | "Camping";
  classificacao: 1 | 2 | 3 | 4 | 5; // Estrelas
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
    email?: string;
  };
  hospedagem: {
    checkIn: string; // Horário padrão
    checkOut: string; // Horário padrão
    capacidade: number; // Número de hóspedes
    quartos: {
      simples: number;
      duplo: number;
      triplo: number;
      suite: number;
    };
  };
  servicos: string[]; // Wi-Fi, Piscina, Academia, Restaurante, etc.
  comodidades: string[]; // Ar condicionado, TV, Frigobar, etc.
  pagamentos: string[]; // Dinheiro, Cartão, PIX, etc.
  imagens: string[];
  status: "ativo" | "inativo" | "em_manutencao";
  preco_medio: {
    simples: number;
    duplo: number;
    triplo: number;
    suite: number;
  };
  usuario: Types.ObjectId;
}

const HotelSchema = new Schema<IHotel>(
  {
    nome: {
      type: String,
      required: [true, "O nome do hotel é obrigatório."],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, "A categoria do hotel é obrigatória."],
      enum: ["Pousada", "Hotel", "Resort", "Hostel", "Camping"],
    },
    classificacao: {
      type: Number,
      required: [true, "A classificação é obrigatória."],
      min: [1, "Classificação mínima é 1 estrela"],
      max: [5, "Classificação máxima é 5 estrelas"],
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
      email: { type: String, trim: true },
    },
    hospedagem: {
      checkIn: {
        type: String,
        required: [true, "Horário de check-in é obrigatório."],
        trim: true,
      },
      checkOut: {
        type: String,
        required: [true, "Horário de check-out é obrigatório."],
        trim: true,
      },
      capacidade: {
        type: Number,
        required: [true, "A capacidade é obrigatória."],
        min: [1, "Capacidade mínima é 1 hóspede"],
      },
      quartos: {
        simples: { type: Number, default: 0, min: 0 },
        duplo: { type: Number, default: 0, min: 0 },
        triplo: { type: Number, default: 0, min: 0 },
        suite: { type: Number, default: 0, min: 0 },
      },
    },
    servicos: {
      type: [String],
      default: [],
    },
    comodidades: {
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
      enum: ["ativo", "inativo", "em_manutencao"],
      default: "ativo",
    },
    preco_medio: {
      simples: { type: Number, min: 0 },
      duplo: { type: Number, min: 0 },
      triplo: { type: Number, min: 0 },
      suite: { type: Number, min: 0 },
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
    collection: "hoteis",
  }
);

// Criar índices
HotelSchema.index({ localizacao: "2dsphere" });
HotelSchema.index({ "endereco.bairro": 1 });
HotelSchema.index({ categoria: 1, status: 1 });
HotelSchema.index({ classificacao: 1 });

// Exportações
export const Hotel = model<IHotel>("Hotel", HotelSchema);
export default Hotel;
