🌍 Descubra+ Cajazeiras

API RESTful desenvolvida para centralizar e disponibilizar informações turísticas da cidade de Cajazeiras – PB, incluindo pontos turísticos, eventos, gastronomia e hospedagem.

O projeto utiliza Node.js + Express + TypeScript, banco de dados PostgreSQL (com PostGIS) e integrações com MongoDB Atlas e Neo4j para fornecer dados relacionais e geoespaciais.

🚀 Tecnologias Utilizadas

Node.js com Express

TypeScript

PostgreSQL + PostGIS

MongoDB Atlas

Neo4j

Sequelize (ORM)

Zod para validações

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

docker compose up --build

📖 Documentação da API

Acesse a documentação Swagger após iniciar o servidor:

http://localhost:3333/api-docs

🛡️ Autenticação

O login retorna um JWT que deve ser incluído no Authorization Header:

Authorization: Bearer <token>

🧪 Testes

Para rodar os testes:

npm run test

📌 Funcionalidades

🔑 Cadastro e autenticação de usuários

🗺️ Gerenciamento de locais turísticos

📸 Upload e associação de fotos

🏷️ Categorias de pontos turísticos

🌐 Integração com MongoDB e Neo4j

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