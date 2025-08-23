import { env } from './database/env';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Server } from 'http';
import { connectMongo, disconnectMongo } from './database/mongodb';
import { getNeo4jDriver, closeNeo4j } from './database/neo4j';
import { erroHandler } from './middleware/error';

// Importando as rotas da aplicação
import authRoutes from './routes/authRoutes';
import fotosRoutes from './routes/fotosRoutes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Rota de Health Check
app.get('/health', (_req, res) => res.json({ status: 'UP' }));

// Configuração do Swagger/OpenAPI
const openapiPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf-8');
  const swaggerDoc = yaml.parse(file);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

// Usando as rotas da aplicação
app.use('/auth', authRoutes);
app.use('/fotos', fotosRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(erroHandler);

let server: Server;

const startServer = async () => {
  
    await connectMongo();
    await getNeo4jDriver().verifyAuthentication();
    console.log('✅ Conexão com Neo4j estabelecida com sucesso!');
    
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
    });
  };

const gracefulShutdown = async () => {
  console.log('\n🔌 Recebido sinal para desligar. Fechando conexões...');
  
    server.close(async () => {
      console.log('✅ Servidor HTTP fechado.');
      await disconnectMongo();
      await closeNeo4j();
      console.log('👋 Aplicação encerrada com sucesso!');
      process.exit(0);
    });
  };

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();