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

---

## 📱 App Mobile — Descubra+ Cajazeiras (Expo Go)

O diretório `mobile/` contém o aplicativo React Native + Expo que espelha as principais funcionalidades do sistema em uma interface mobile nativa.

### Stack Mobile

| Tecnologia | Versão |
|---|---|
| Expo SDK | ~51.0.0 |
| React Native | 0.74.x |
| React Navigation | ^6.x |
| TypeScript | ~5.3.x |
| Fontes | Poppins + Open Sans (Google Fonts) |
| Ícones | @expo/vector-icons (Ionicons) |

### Instalação das dependências

```powershell
cd mobile
npm install
```

### Executando no dispositivo físico com Expo Go

> O flag `--lan` faz o Expo expor o servidor na rede local (LAN), permitindo que qualquer dispositivo na mesma rede Wi-Fi se conecte.

**Passo a passo:**

1. **Instale o Expo Go** no seu celular:
   - Android → [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS → [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Conecte celular e computador na mesma rede Wi-Fi.**
   > Redes corporativas/universitárias podem bloquear a comunicação entre dispositivos. Use uma rede doméstica ou um hotspot do celular.

3. **Inicie o servidor Expo** no terminal do VS Code, dentro da pasta `mobile/`:

   ```powershell
   cd mobile
   npm run dev
   ```

   O terminal exibirá um QR Code e uma URL no formato `exp://192.168.x.x:8081`.

4. **Escaneie o QR Code**:
   - **Android**: Abra o Expo Go → toque em **"Scan QR code"** e aponte a câmera.
   - **iOS**: Use a câmera nativa do iPhone; um banner aparecerá para abrir no Expo Go.

5. O app carregará automaticamente no seu celular. Mudanças no código são refletidas em tempo real (Fast Refresh).

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor Expo em modo LAN (padrão para dispositivo físico) |
| `npm run android` | Abre diretamente em emulador/dispositivo Android |
| `npm run ios` | Abre diretamente no simulador iOS (requer macOS) |
| `npm run web` | Abre versão web no navegador |

### Telas implementadas

| Tela | Rota | Descrição |
|---|---|---|
| Login | `Login` | Autenticação com e-mail e senha |
| Home | `Tabs > Home` | Descoberta de serviços e eventos |
| Favoritos | `Tabs > Favoritos` | Itens salvos pelo usuário |
| Perfil | `Tabs > Perfil` | Dashboard pessoal do usuário |
| Gerenciar Eventos | `GerenciarEventos` | CRUD de eventos do usuário |
| Novo Serviço | `NovoServico` | Formulário de cadastro de serviço |
| Gerenciar Serviços | `GerenciarServicos` | CRUD de serviços com toggle ativo/inativo |
| Avaliações | `Avaliacoes` | Listagem e filtro de avaliações |
| Sobre | `Sobre` | Informações do app, equipe e links |

### Solução de problemas comuns

| Problema | Solução |
|---|---|
| QR Code não conecta | Verifique se estão na mesma rede Wi-Fi; desative VPN |
| Expo Go mostra erro de rede | Rode `npm run dev` com `-- --tunnel` para usar tunnel ngrok |
| Fonte não carrega | Certifique-se de que `expo-font` e `@expo-google-fonts/*` estão instalados |
| Cache antigo | No app Expo Go, agite o celular → "Reload" ou "Clear cache" |

---

## Contribuição

## Licença

MIT — veja LICENSE.