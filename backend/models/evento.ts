import { Schema, model, Document } from 'mongoose';

export interface IEvento extends Document {
  nome: string;
  descricao?: string;
  data: Date;
  horario?: string;
  local?: string;
  latitude?: number;
  longitude?: number;
  imagem?: string;
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
  local: {
    type: String
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  imagem: {
    type: String 
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