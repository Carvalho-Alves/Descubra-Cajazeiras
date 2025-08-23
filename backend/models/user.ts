import { Schema, model, HydratedDocument, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface do usuário
export interface IUser {
  _id: Types.ObjectId; // Corrige o problema de unknown
  nome: string;
  email: string;
  senha?: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  foto?: string; 

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema
const UserSchema = new Schema<IUser>(
  {
    nome: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    senha: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    foto: { type: String, required: false },
  },
  { timestamps: true }
);

// Middleware de hash da senha
UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha') || !this.senha) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = await User.findById(this._id).select('+senha');
  if (!user || !user.senha) return false;

  return bcrypt.compare(candidatePassword, user.senha);
};

// Tipo seguro para documentos de usuário
export type UserDocument = HydratedDocument<IUser>;

// Model
export const User = model<IUser>('User', UserSchema);
