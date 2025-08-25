import { Schema, model, Document, Types } from 'mongoose';

// Interface atualizada para refletir a estrutura de dados correta
export interface IServicoTuristico extends Document {
  _id: Types.ObjectId;
  nome: string;
  descricao?: string;
  tipo_servico: 'Hospedagem' | 'Alimentação/Lazer' | 'Ponto Turístico';
  categoria?: string;
  contato: {
    telefone?: string;
    instagram?: string;
  };
  localizacao: {
    latitude?: number;
    longitude?: number;
  };
  imagens?: string[];
  usuario: Types.ObjectId; // Referência ao usuário que cadastrou
  createdAt: Date;
  updatedAt: Date;
}

const ServicoTuristicoSchema = new Schema<IServicoTuristico>({
  nome: {
    type: String,
    required: [true, 'O nome do serviço é obrigatório.'],
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  tipo_servico: {
    type: String,
    required: [true, 'O tipo de serviço é obrigatório.'],
    // 'enum' garante que apenas os valores do formulário serão aceitos
    enum: ['Hospedagem', 'Alimentação/Lazer', 'Ponto Turístico']
  },
  categoria: {
    type: String,
    trim: true
  },
  // Objeto aninhado para organizar as informações de contato
  contato: {
    telefone: { type: String, trim: true },
    instagram: { type: String, trim: true }
  },
  // Objeto aninhado para organizar as coordenadas
  localizacao: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  // Campo para armazenar um array com as URLs das imagens
  imagens: {
    type: [String]
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'servicos_turisticos'
});

export const ServicoTuristico = model<IServicoTuristico>('ServicoTuristico', ServicoTuristicoSchema);