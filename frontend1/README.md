# Frontend1 - Descubra Cajazeiras (SPA)

Frontend moderno em React + Vite + TypeScript, integrado ao backend (Node/Express) do projeto.

## Requisitos atendidos (disciplina)

- SPA com React Router
- Estado global com Redux Toolkit
- HTTP com Axios + interceptor JWT
- PWA/Service Worker (vite-plugin-pwa/Workbox) com cache de GET em `/api/servicos` e `/api/eventos`
- Storybook para documentação de componentes
- Testes unitários com Vitest + React Testing Library
- Testes E2E com Playwright

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Por padrão, a API é `http://localhost:3333/api`.

Para apontar para outro host/porta, defina `VITE_API_BASE_URL` (ex.: `http://localhost:3333/api`).

## Como rodar

```bash
npm run dev
```

Acesse http://localhost:5173/

## Storybook

```bash
npm run storybook
```

Acesse http://localhost:6006/

## Testes

Unitários (Vitest + RTL):

```bash
npm test
```

Testes de Storybook (Vitest browser):

```bash
npx test-storybook
```

E2E (Playwright):

```bash
npm run test:e2e
```

## Funcionalidades que Utilizam Redux

O Redux Toolkit gerencia o estado global para:

- **Autenticação (auth)**: Controle de login, tokens JWT e dados do usuário.
- **Eventos (eventos)**: Estado de listagem, criação e edição de eventos.
- **Serviços (servicos)**: Estado de listagem, criação e edição de serviços.

Configurado em `src/store/store.ts`, com slices em `src/features/`. Use Redux DevTools no navegador para inspecionar mudanças de estado.

## Funcionalidades que Utilizam Cache com Service Worker

O Service Worker (via vite-plugin-pwa/Workbox) implementa cache offline:

- Cache de requisições GET para `/api/servicos` e `/api/eventos`, permitindo acesso rápido/offline a listagens.
- Para demonstrar: Execute `npm run build` e `npm run preview`, desconecte internet e recarregue – dados persistem.

## Componentes no Storybook

O Storybook documenta componentes React isoladamente (`src/stories/`):

- **Header/Footer**: Layouts responsivos.
- **ServiceCard/EventCard**: Cards para serviços/eventos com avaliações.
- **RatingModal**: Modal para avaliações por estrelas.
- **ListaItems**: Listas filtráveis.
- Execute com `npm run storybook` (porta 6006) para visualizar e testar props/estados.

## Demonstração do Sistema e Funcionalidades

Execute com `npm run dev` (backend rodando). Explore:

- **Cadastro/Login**: Crie conta, faça login.
- **Serviços/Eventos**: Liste, crie, edite, delete; busque/filtre.
- **Avaliações**: Adicione estrelas/comentários via modal.
- **Mapa**: Visualize marcadores, clique para detalhes/avaliações.
- **Dashboard**: Estatísticas.
- **Offline**: Em PWA, teste cache desconectando internet.

## Execução dos Testes Unitários e de Sistema

- **Unitários**: Cobrem componentes e lógica (ex.: auth, CRUD). Execute `npm run test` para ver cobertura.
- **E2E**: Testam fluxos completos (login, criação de itens). Execute `npm run test:e2e` para simular usuário real.

## PWA / Cache de API

A configuração fica em `vite.config.ts` via `vite-plugin-pwa`.

- `GET /api/servicos*` usa `NetworkFirst` e cache `api-servicos`
- `GET /api/eventos*` usa `NetworkFirst` e cache `api-eventos`

## Estrutura (pasta `src/`)

```text
src/
  components/    # UI (com .stories.* e .test.* quando aplicável)
  features/      # Redux slices + thunks (auth/servicos/eventos)
  hooks/         # useAppDispatch/useAppSelector
  layouts/       # Layouts (ex.: AppLayout)
  pages/         # Home/Login/Register/Dashboard
  router/        # Rotas + proteção (RequireAuth)
  services/      # Axios + endpoints
  store/         # configureStore
  utils/         # helpers (storage, leaflet icon, etc)
  App.tsx
  main.tsx
```