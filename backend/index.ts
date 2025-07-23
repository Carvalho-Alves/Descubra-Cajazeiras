import express from 'express';
import cors from 'cors';
// import rotaLogin from './routes/routes'; 
import { conectarMongoDB, desconectarMongoDB } from './database/database'; 

const app = express();
const porta = process.env.PORT || 3000; // Boa prática: usar variável de ambiente para a porta

// Middlewares essenciais
app.use(cors());
app.use(express.json()); 


// Bloco de conexão com o banco de dados e inicialização do servidor
(async () => {
  try {
    await conectarMongoDB();

    app.listen(porta, () => {
      console.log(`✅ Servidor rodando na porta ${porta}`);
    });
  } catch (error) {
    console.error('❌ Erro fatal ao iniciar o servidor ou conectar ao MongoDB:', error);
    process.exit(1); // Encerra a aplicação em caso de erro na inicialização do DB
  }
})();

// Manipuladores para encerramento gracioso do servidor e desconexão do DB
process.on('SIGINT', async () => {
  console.log('👋 Sinal de encerramento (SIGINT) recebido. Desconectando do MongoDB...');
  await desconectarMongoDB();
  console.log('Servidor encerrado.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('👋 Sinal de encerramento (SIGTERM) recebido. Desconectando do MongoDB...');
  await desconectarMongoDB();
  console.log('Servidor encerrado.');
  process.exit(0);
});