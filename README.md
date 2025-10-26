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

## Contribuição

1. Fork no GitHub
2. `git checkout -b minha-feature`
3. `git commit -m "feat: minha nova feature"`
4. `git push origin minha-feature`
5. Abra um Pull Request

## Licença

MIT — veja LICENSE.