import mongoose from 'mongoose';
import { env } from './env';

if (!env.MONGODB_URI) {
  throw new Error('A variável de ambiente MONGODB_URI deve ser definida.');
}

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME
    });
    console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
  }

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  
    await mongoose.disconnect();
    console.log('✅ Desconectado do banco de dados MongoDB.');
  }