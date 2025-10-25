🌍 Descubra+ Cajazeiras

API e Frontend para centralizar e disponibilizar informações turísticas da cidade de Cajazeiras – PB, incluindo pontos turísticos, eventos, gastronomia e hospedagem.

Stack atual:
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- Neo4j (opcional, desabilitado por padrão via NEO4J_ENABLED=false)
- JWT, Helmet, CORS, Rate Limit, Multer
- Frontend vanilla JS + Bootstrap + Leaflet + Chart.js

🚀 Tecnologias Utilizadas

Node.js com Express

TypeScript

MongoDB (Mongoose)

Neo4j (opcional)

Zod e express-validator para validações

JWT para autenticação

Swagger para documentação

Docker (opcional)

📂 Estrutura do Projeto

backend/
 ├── controller/      # Lógica dos controllers
 ├── database/        # Conexões com bancos (Postgres, MongoDB, Neo4j)
 ├── middleware/      # Autenticação e tratamento de erros
 ├── routes/          # Definição das rotas da API
 ├── service/         # Serviços externos (ex: Neo4j)
 ├── utils/           # Helpers como asyncHandler
 ├── index.ts         # Inicialização da API
 └── ...
docs/                 # Documentação (Swagger)

⚙️ Pré-requisitos

Node.js (>= 18.x)

PostgreSQL com extensão PostGIS

MongoDB Atlas

Neo4j

🔧 Instalação e Uso

Clone o repositório e instale as dependências:

git clone https://github.com/seu-usuario/descubra-cajazeiras.git
cd descubra-cajazeiras/backend
npm install


Configure as variáveis de ambiente em um arquivo .env:

# Banco Postgres
POSTGRES_HOST=localhost
POSTGRES_USER=usuario
POSTGRES_PASSWORD=senha
POSTGRES_DB=descubra

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/descubra

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=senha

# JWT
JWT_SECRET=sua_chave_secreta


Execute a aplicação em modo desenvolvimento:

Instância local (recomendado para desenvolvimento):

```powershell
npm install
npm run dev
```

Por padrão, o app inicia em http://localhost:3333 e serve os arquivos estáticos do diretório `frontend/`.

📖 Documentação da API

Acesse a documentação Swagger após iniciar o servidor:

http://localhost:3333/api-docs

🛡️ Autenticação

O login retorna um JWT que deve ser incluído no Authorization Header:

```
Authorization: Bearer <token>
```

📚 Principais Endpoints

- GET /api/servicos — lista serviços
- GET /api/servicos/{id} — detalhe do serviço
- POST /api/servicos — cria serviço
- PUT /api/servicos/{id} — atualiza serviço
- DELETE /api/servicos/{id} — remove serviço
- GET /api/servicos/search?q=termo — busca textual com fallback acento-insensível
- GET /api/estatisticas — dados para o dashboard (totais, por tipo, por mês, recentes)

Outros grupos: /api/eventos, /api/avaliacoes, /api/auth

📌 Funcionalidades

🔑 Cadastro e autenticação de usuários

🗺️ Gerenciamento de locais turísticos

📸 Upload e associação de fotos

🏷️ Categorias de pontos turísticos

🌐 Integração com MongoDB e (opcionalmente) Neo4j

📑 Documentação interativa com Swagger

🚨 Tratamento centralizado de erros via middleware

🤝 Contribuição

Faça um fork do repositório

Crie uma branch: git checkout -b minha-feature

Commit suas alterações: git commit -m "feat: minha nova feature"

Push para sua branch: git push origin minha-feature

Abra um Pull Request

📜 Licença

Este projeto está sob a licença MIT.
Sinta-se livre para usá-lo e contribuir!