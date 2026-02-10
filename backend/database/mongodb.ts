import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env';

if (!env.MONGODB_URI) {
  throw new Error('A variável de ambiente MONGODB_URI deve ser definida.');
}

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Workaround: em alguns PCs o Node pode ficar com DNS apontando para localhost (127.0.0.1)
  // e falhar em consultas SRV usadas por `mongodb+srv://` (erro: querySrv ECONNREFUSED).
  // Forçamos DNS públicos apenas quando detectamos esse cenário.
  if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
    const dnsServers = dns.getServers();
    const looksLikeLocalDns =
      dnsServers.length === 0 ||
      (dnsServers.length === 1 && (dnsServers[0] === '127.0.0.1' || dnsServers[0] === '::1'));

    if (looksLikeLocalDns) {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      console.log('ℹ️ DNS do Node ajustado para resolver SRV do MongoDB Atlas.');
    }
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