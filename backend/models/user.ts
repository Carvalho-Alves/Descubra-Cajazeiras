import { Schema, model, HydratedDocument, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  senha?: string;
  role: 'turista' | 'admin';
  foto?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['turista', 'admin'],
      default: 'turista',
    },
    foto: {
      type: String,
      required: false, 
    },
  },
  { timestamps: true, collection: 'users' }
);

UserSchema.pre<HydratedDocument<IUser>>('save', async function (next) {
  if (!this.isModified('senha') || !this.senha) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
        return next(error);
    }
    return next(new Error('Erro ao criptografar a senha'));
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = await User.findById(this._id).select('+senha');
  if (!user || !user.senha) return false;

  return bcrypt.compare(candidatePassword, user.senha);
};

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser>('User', UserSchema);