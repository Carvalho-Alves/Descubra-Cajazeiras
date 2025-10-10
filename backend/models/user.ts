import { Schema, model, HydratedDocument, Types, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @interface IUser
 * @description Define a estrutura e os métodos para um documento de usuário no Mongoose.
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  senha: string;
  role: 'Turista' | 'Organizador';
  foto?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * @const UserSchema
 * @description Schema do Mongoose para a coleção de usuários.
 */
const UserSchema = new Schema<IUser>(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
      trim: true,
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
      enum: ['Turista', 'Organizador'],
      default: 'Turista'
    },
    foto: {
      type: String,
      required: false,
    },
  },
  { timestamps: true, collection: 'users' }
);

/**
 * Middleware 'pre-save' para criptografar a senha do usuário
 * antes de salvá-la no banco de dados.
 */
UserSchema.pre<HydratedDocument<IUser>>('save', async function (next) {
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha!, salt);
    next();
  } catch (error) {

    if (error instanceof Error) {
        return next(error);
    }
    return next(new Error('Erro ao criptografar a senha'));
  }
});

/**
 * Método de instância para comparar a senha fornecida com a do banco.
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.senha) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.senha);
};

export type UserDocument = HydratedDocument<IUser>;

export const User = model<IUser>('User', UserSchema);