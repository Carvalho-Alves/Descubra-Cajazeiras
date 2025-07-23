import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Recupera variáveis de ambiente de forma segura
const {
  MONGODB_URI,
  MONGODB_DB_NAME
} = process.env;

if (!MONGODB_URI) {
  throw new Error('❌ A variável de ambiente MONGODB_URI deve ser definida no arquivo .env');
}

async function conectarMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      dbName: MONGODB_DB_NAME // Especifica o nome do banco de dados se não estiver na URI
    });
    console.log('✅ Conexão com o banco de dados MongoDB (Mongoose) estabelecida com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados MongoDB (Mongoose):', error);
    throw error; // Relança o erro para tratamento externo
  }
}

// Função para desconectar (opcional, o Mongoose gerencia as conexões automaticamente)
async function desconectarMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Desconectado do banco de dados MongoDB (Mongoose).');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados MongoDB (Mongoose):', error);
  }
}

// Exporta a função de conexão e a instância do Mongoose
export {
  conectarMongoDB,
  desconectarMongoDB,
  mongoose
};