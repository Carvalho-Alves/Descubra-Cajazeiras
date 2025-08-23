import { Schema, model, Document } from 'mongoose';

export interface IFoto extends Document {
  url: string;
  descricao?: string;
  autor: Schema.Types.ObjectId; // Referência ao usuário que enviou
  local: Schema.Types.ObjectId; // Referência ao local da foto
}

const FotoSchema = new Schema<IFoto>({
    url: { 
      type: String, 
      required: true 
    },
    descricao: { 
      type: String 
    },
    autor: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    local: {
      type: Schema.Types.ObjectId,
      ref: 'Local',
      required: true
    }
}, { 
  timestamps: true,
  collection: 'fotos'
});

export const Foto = model<IFoto>('Foto', FotoSchema);