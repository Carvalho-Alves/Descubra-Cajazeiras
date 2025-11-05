import { Schema, model, Document, Types} from 'mongoose';

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
      required: true
    },
    longitude: { 
      type: Number,
      required: true
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