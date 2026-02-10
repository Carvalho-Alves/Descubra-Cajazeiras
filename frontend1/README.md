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
npm run test:storybook
```

E2E (Playwright):

```bash
npm run test:e2e
```

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