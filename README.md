# 🌍 Descubra+ Cajazeiras

API RESTful desenvolvida para centralizar e disponibilizar informações turísticas da cidade de **Cajazeiras – PB**, incluindo **pontos turísticos, eventos, gastronomia e hospedagem**.

O projeto foi construído utilizando **Node.js + Express + TypeScript**, com banco de dados **PostgreSQL (PostGIS)** para dados geoespaciais, além de integrações com **MongoDB Atlas** e **Neo4j** para dados relacionais e de grafos.

---

## 🚀 Tecnologias Utilizadas

- **Node.js + Express**
- **TypeScript**
- **PostgreSQL + PostGIS**
- **MongoDB Atlas**
- **Neo4j**
- **Sequelize (ORM)**
- **Zod** → validações de dados
- **JWT** → autenticação
- **Swagger** → documentação interativa
- **Docker / Docker Compose** (opcional)

---

## 📦 Instalação e Execução

### 🔹 Clonar o repositório
```bash
git clone https://github.com/seu-usuario/Descubra-Cajazeiras.git
cd Descubra-Cajazeiras
🔹 Instalar dependências
bash
Copiar
Editar
npm install
🔹 Configurar variáveis de ambiente
Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

env
Copiar
Editar
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/descubra_cajazeiras
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/descubra
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=senha
JWT_SECRET=seu_segredo
🔹 Rodar localmente
bash
Copiar
Editar
npm run dev
🐳 Executando com Docker
Certifique-se de ter Docker e Docker Compose instalados.

bash
Copiar
Editar
docker-compose up --build
Isso irá subir a aplicação junto com o PostgreSQL, MongoDB e Neo4j.

📂 Estrutura do Projeto
bash
Copiar
Editar
backend/
 ├── controller/      # Controladores da API
 ├── database/        # Conexões com Postgres, MongoDB e Neo4j
 ├── middleware/      # Autenticação e tratamento de erros
 ├── routes/          # Definição das rotas
 ├── service/         # Serviços externos e integrações
 ├── utils/           # Helpers (ex: asyncHandler)
 ├── index.ts         # Ponto de entrada da API
docs/
 ├── swagger.json     # Documentação da API
frontend/
 ├── index.html       # Interface web
📖 Documentação da API
A documentação está disponível em Swagger após rodar o projeto:

bash
Copiar
Editar
http://localhost:3333/api-docs
📌 Funcionalidades
📍 Cadastro e consulta de pontos turísticos

🍽️ Informações sobre gastronomia e lazer

🏨 Locais de hospedagem

🎉 Listagem de eventos

🔑 Autenticação via JWT

🌐 Dados geoespaciais com PostGIS

🔗 Relações complexas com Neo4j

📜 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.