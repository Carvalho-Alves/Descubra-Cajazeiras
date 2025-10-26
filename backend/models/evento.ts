import { Schema, model, Document, Types} from 'mongoose';

// --- DEFINIÇÃO DOS LIMITES GEOGRÁFICOS ---
const limitesCajazeiras = {
  latMin: -6.95, // Sul
  latMax: -6.83, // Norte
  lonMin: -38.62, // Oeste
  lonMax: -38.50  // Leste
};

export interface IEvento extends Document {
  nome: string;
  descricao?: string;
  data: Date;
  horario: string;
  localizacao: {
    latitude: number;
    longitude: number;
  };
  imagem?: string;
  usuario: Types.ObjectId;
  status: 'ativo' | 'cancelado' | 'encerrado';
}

const EventoSchema = new Schema<IEvento>({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  data: {
    type: Date,
    required: true
  },
  horario: {
    type: String
  },
    localizacao: {
      latitude: { 
        type: Number,
        validate: {
          validator: (lat: number) => lat >= limitesCajazeiras.latMin && lat <= limitesCajazeiras.latMax,
          message: 'A latitude fornecida está fora da área de Cajazeiras.'
        }
      },
    longitude: { 
      type: Number,
      validate: {
        validator: (lon: number) => lon >= limitesCajazeiras.lonMin && lon <= limitesCajazeiras.lonMax,
        message: 'A longitude fornecida está fora da área de Cajazeiras.'
      }
    }
  },
  imagem: {
    type: String
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['ativo', 'cancelado', 'encerrado'],
    default: 'ativo'
  }
}, {
  timestamps: true,
  collection: 'eventos'
});

export const Evento = model<IEvento>('Evento', EventoSchema);