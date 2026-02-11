🌍 Descubra+ Cajazeiras

Aplicação web para centralizar e disponibilizar informações turísticas de Cajazeiras–PB: serviços (hospedagem, alimentação/lazer, pontos turísticos), eventos, mapa interativo, avaliações por estrelas e dashboard.

Stack:
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- Neo4j (opcional)
- JWT, Helmet, CORS, Rate Limit, Multer
- Frontend: Vanilla JS + Bootstrap + Leaflet + Chart.js

## Principais novidades desta versão

- Avaliações por estrelas para serviços e eventos
	- Modal único reutilizável nas páginas Home, Serviços e Eventos.
	- Botões “Avaliações” nos popups do mapa e também diretamente na lista lateral.
	- Payload de criação padronizado: `{ tipo, referenciaId, nota, comentario }`.
	- Endpoints utilizados: `GET /api/avaliacoes/referencia/:tipo/:referenciaId` e `POST /api/avaliacoes`.

- Busca e filtros integrados na Home
	- Alternância Serviços | Eventos mantendo busca e filtros.
	- Filtros de Serviços: Todos | Hospedagem | Alimentação/Lazer | Ponto Turístico (lista e marcadores sincronizados).
	- Busca de Eventos com endpoint dedicado (`/api/eventos/search`).

- UX e responsividade
	- Títulos padronizados com cor `#212528` e layout mais responsivo.
	- Logo redimensionada de forma responsiva no header; auth.html agora usa `.navbar-brand` e título menor `.brand-title`.
	- Botões “Avaliações” não são comprimidos; textos quebram linha corretamente nas listas.
	- Botão “Minha Localização” funcional na Home, Serviços e Eventos (com spinner/feedback na Home).

- Imagens e avatar de usuário
	- Novo avatar padrão `assets/images/default-avatar.svg` (leve e sem 404).
	- Backend expõe `/uploads` para fotos enviadas; login normaliza o caminho de `foto` para começar com `/uploads/...`.
	- Upload com nomes de arquivos sanitizados (sem acentos/espaços problemáticos) para URLs estáveis.

- Segurança e CSP
	- Helmet com CSP para permitir CDNs e inline mínimos necessários.

## Estrutura do Projeto

```
backend/
	controller/      # Controllers da API
	database/        # Conexões (MongoDB, Neo4j)
	middleware/      # Auth, rate limit, erros
	routes/          # Rotas da API
	service/         # Serviços, upload, etc.
	utils/           # Helpers
	index.ts         # Bootstrap do servidor
docs/              # OpenAPI/Swagger
frontend/          # HTML, CSS, JS (servido estaticamente)
```

## Pré‑requisitos

- Node.js 18+
- MongoDB (Atlas recomendado)
- (Opcional) Neo4j

## Configuração

Arquivo `.env` na raiz do projeto (exemplo mínimo):

```
PORT=3333
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/descubra
JWT_SECRET=sua_chave_secreta
# MONGODB_DB_NAME=descubra   # opcional, se não estiver no URI
```

Variáveis adicionais (opcional):

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=senha
NEO4J_ENABLED=false
```

## Executando em desenvolvimento

```powershell
npm install
npm run dev
```

Por padrão: http://localhost:3333

O backend serve o diretório `frontend/` como estático e expõe `/uploads` (imagens enviadas).

## Documentação da API

Acesse o Swagger após iniciar o servidor:

http://localhost:3333/api-docs

## Autenticação

O login retorna um JWT que deve ser enviado em `Authorization`:

```
Authorization: Bearer <token>
```

## Endpoints (resumo)

- Serviços
	- `GET /api/servicos`
	- `GET /api/servicos/:id`
	- `POST /api/servicos` (com imagem opcional via Multer)
	- `PUT /api/servicos/:id` (com imagem opcional)
	- `DELETE /api/servicos/:id`
	- `GET /api/servicos/search?q=...`

- Eventos
	- `GET /api/eventos`
	- `GET /api/eventos/:id`
	- `POST /api/eventos` (imagem opcional)
	- `PUT /api/eventos/:id` (imagem opcional)
	- `DELETE /api/eventos/:id`
	- `GET /api/eventos/search?q=...`

- Avaliações
	- `GET /api/avaliacoes/referencia/:tipo/:referenciaId`
	- `POST /api/avaliacoes` — body: `{ tipo: 'servico'|'evento', referenciaId: string, nota: 1..5, comentario?: string }`

- Autenticação
	- `POST /api/auth/register` (campo `foto` opcional com upload)
	- `POST /api/auth/login`
	- `PUT /api/auth/:id` (atualiza nome/email/role e `foto`)

- Dashboard
	- `GET /api/estatisticas`

## Notas sobre Imagens

- Uploads são salvos em `backend/uploads` e servidos em `/uploads/...`.
- Em Docker/produção, use volume persistente para `uploads`.
- Para storage externo (S3, etc.), adapte o serviço de upload e salve a URL pública no Mongo.

## Geolocalização

- A centralização “Minha Localização” usa `navigator.geolocation`.
- Em produção, geolocalização exige HTTPS (ou `localhost` em dev).

## Funcionalidades que Utilizam Redux

No frontend React (`frontend1/`), o Redux Toolkit gerencia o estado global para:

- **Autenticação (auth)**: Controle de login, tokens JWT e dados do usuário.
- **Eventos (eventos)**: Estado de listagem, criação e edição de eventos.
- **Serviços (servicos)**: Estado de listagem, criação e edição de serviços.

Configurado em `frontend1/src/store/store.ts`, com slices em `features/`. Use Redux DevTools no navegador para inspecionar mudanças de estado.

## Funcionalidades que Utilizam Cache com Service Worker

O Service Worker (via vite-plugin-pwa/Workbox) implementa cache offline no frontend React (`frontend1/`):

- Cache de requisições GET para `/api/servicos` e `/api/eventos`, permitindo acesso rápido/offline a listagens.
- Para demonstrar: Build o app (`npm run build` em `frontend1/`), sirva com `npm run preview`, desconecte internet e recarregue – dados persistem.

## Componentes no Storybook

O Storybook documenta componentes React isoladamente (`frontend1/src/stories/`):

- **Header/Footer**: Layouts responsivos.
- **ServiceCard/EventCard**: Cards para serviços/eventos com avaliações.
- **RatingModal**: Modal para avaliações por estrelas.
- **ListaItems**: Listas filtráveis.
- Execute com `npm run storybook` em `frontend1/` (porta 6006) para visualizar e testar props/estados.

## Tutorial de Execução do Projeto

### Backend
1. Navegue para `backend/`: `cd backend`
2. Instale dependências: `npm install`
3. Configure `.env` (veja exemplo acima).
4. Execute: `npm run dev` (porta 3333). Ou com Docker: `docker-compose up` (inclui MongoDB/Neo4j).

### Frontend1 (React)
1. Navegue para `frontend1/`: `cd frontend1`
2. Instale dependências: `npm install`
3. Execute em dev: `npm run dev` (porta 5173, proxy para API).
4. Para PWA: `npm run build` e `npm run preview` (porta 4173).

### Storybook
1. Em `frontend1/`: `npm run storybook` (porta 6006).

### Testes
- **Unitários**: `npm run test` (Vitest + React Testing Library).
- **E2E**: `npm run test:e2e` (Playwright).

## Demonstração do Sistema e Funcionalidades

Execute o backend e frontend1. Explore:

- **Cadastro/Login**: Crie conta, faça login.
- **Serviços/Eventos**: Liste, crie, edite, delete; busque/filtre.
- **Avaliações**: Adicione estrelas/comentários via modal.
- **Mapa**: Visualize marcadores, clique para detalhes/avaliações.
- **Dashboard**: Estatísticas em `/estatisticas`.
- **Offline**: Em PWA, teste cache desconectando internet.

## Execução dos Testes Unitários e de Sistema

- **Unitários**: Cobrem componentes e lógica (ex.: auth, CRUD). Execute `npm run test` em `frontend1/` para ver cobertura.
- **E2E**: Testam fluxos completos (login, criação de itens). Execute `npm run test:e2e` para simular usuário real.

Esses pontos destacam os requisitos atendidos (SPA, Redux, PWA, testes, etc.).

## Contribuição

## Licença

MIT — veja LICENSE.