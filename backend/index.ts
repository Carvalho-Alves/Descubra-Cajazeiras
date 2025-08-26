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
import authRoutes from './routes/authRoutes';
import servicoRoutes from './routes/servicoRoutes';
import eventoRoutes from './routes/eventoRoutes';

const app = express();

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": [
        "'self'",
        "data:",
        "https://*.tile.openstreetmap.org",
        "https://unpkg.com" 
      ],
      "script-src": [
        "'self'",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      "font-src": [
        "'self'",
        "https://cdnjs.cloudflare.com"
      ],
      "connect-src": [
        "'self'",
        "https://nominatim.openstreetmap.org"
      ],
      "script-src-attr": [
        "'self'",
        "'unsafe-inline'"
      ],
    },
  },
}));

app.use(express.json());
app.use(morgan('dev'));

const frontendPath = path.resolve(__dirname, '..', 'frontend');

app.use(express.static(frontendPath));
app.get('/health', (_req, res) => res.json({ status: 'UP' }));

const openapiPath = path.join(process.cwd(), 'docs', 'openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf-8');
  const swaggerDoc = yaml.parse(file);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

app.use('/api/auth', authRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/eventos', eventoRoutes);

app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});
app.use(erroHandler);

let server: Server;

const startServer = async () => {
  try {
    await connectMongo();
    await getNeo4jDriver().verifyAuthentication();
    console.log('✅ Conexão com Neo4j estabelecida com sucesso!');
    
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('\n🔌 Recebido sinal para desligar. Fechando conexões...');
  
  server.close(async () => {
    console.log('✅ Servidor HTTP fechado.');
    try {
      await disconnectMongo();
      await closeNeo4j();
      console.log('👋 Aplicação encerrada com sucesso!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erro ao fechar as conexões:', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();