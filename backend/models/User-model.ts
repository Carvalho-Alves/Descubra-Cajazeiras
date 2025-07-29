import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // password é opcional aqui porque será hashado antes de salvar
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>; // Método para comparar senhas
}

// 2. Define o Schema do Mongoose
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Não retorna a senha por padrão em consultas
  },
}, {
  timestamps: true, // Adiciona campos createdAt e updatedAt automaticamente
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) { // Só faz hash se a senha foi modificada ou é nova
    return next();
  }
  const salt = await bcrypt.genSalt(10); // Gera um salt
  this.password = await bcrypt.hash(this.password!, salt); // Faz o hash da senha
  next();
});

// 4. Método para comparar a senha (adicionado ao schema)
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password || '');
};

// 5. Crie e exporte o modelo
const User = model<IUser>('User', UserSchema);
export default User;