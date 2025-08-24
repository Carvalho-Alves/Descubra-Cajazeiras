import { Schema, model, Document, Types } from 'mongoose';

export interface IServico extends Document {
  _id: Types.ObjectId;
  titulo: string;
  descricao?: string;
  categoria?: string;
  preco?: number;
  contato?: string;
  usuario: Schema.Types.ObjectId; // Referência ao usuário dono do serviço
  createdAt: Date;
  updatedAt: Date;
}

const ServicoSchema = new Schema<IServico>({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String
  },
  categoria: {
    type: String
  },
  preco: {
    type: Number,
    min: 0
  },
  contato: {
    type: String
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'servicos'
});

export const Servico = model<IServico>('Servico', ServicoSchema);


