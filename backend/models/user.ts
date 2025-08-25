import { Schema, model, HydratedDocument, Types } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * @interface IUser
 * @description Define a estrutura e os métodos para um documento de usuário no Mongoose.
 */
export interface IUser extends Document {
  _id: Types.ObjectId;
  nome: string;
  email: string;
  senha?: string; // Propriedade opcional por causa do 'select: false' no schema
  role: 'turista' | 'admin'; // Alinhado com a documentação do projeto
  foto?: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Compara uma senha fornecida com a senha criptografada do usuário.
   * @param candidatePassword A senha a ser comparada.
   * @returns {Promise<boolean>} True se as senhas corresponderem, false caso contrário.
   */
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
      select: false, // Garante que a senha não seja retornada em queries por padrão
    },
    role: {
      type: String,
      enum: ['turista', 'admin'],
      default: 'turista',
    },
    foto: {
      type: String,
      required: false, // Opcional
    },
  },
  { timestamps: true, collection: 'users' }
);

/**
 * Middleware (hook) 'pre-save' para criptografar a senha do usuário
 * antes de salvá-la no banco de dados.
 */
UserSchema.pre<HydratedDocument<IUser>>('save', async function (next) {
  // Executa o hash apenas se a senha foi modificada (ou é nova)
  if (!this.isModified('senha') || !this.senha) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    // Se ocorrer um erro no bcrypt, passa o erro para o Mongoose
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
  // Re-busca o usuário com o campo 'senha' incluído para a comparação
  const user = await User.findById(this._id).select('+senha');
  if (!user || !user.senha) return false;

  return bcrypt.compare(candidatePassword, user.senha);
};

// Tipo seguro para documentos de usuário, melhora a integração com TypeScript
export type UserDocument = HydratedDocument<IUser>;

// Exporta o model final
export const User = model<IUser>('User', UserSchema);