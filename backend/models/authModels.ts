import { Schema, model, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  user: Schema.Types.ObjectId;
  expiresAt: Date;
  isValid: boolean;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  collection: 'refresh_tokens'
});

// Index para expirar documentos automaticamente (opcional)
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);