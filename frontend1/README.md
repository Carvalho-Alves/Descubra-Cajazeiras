# Frontend1 - Descubra Cajazeiras

Este é o projeto frontend React para a aplicação Descubra Cajazeiras.

## Instalação

1. Instale as dependências:
   ```bash
   npm install
   ```

## Como rodar o projeto

- Para desenvolvimento:
  ```bash
  npm run dev
  ```
  Acesse http://localhost:5173/

- Para produção:
  ```bash
  npm run build
  npm run preview
  ```

## Como rodar o Storybook

```bash
npm run storybook
```
Acesse http://localhost:6006/

## Como rodar os testes

```bash
npm test
```

## Tecnologias usadas

- React 18
- Vite
- Jest
- React Testing Library
- Storybook
- CSS Modules

## Estrutura do projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── CardItem.jsx
│   ├── ListaItems.jsx
│   └── ModalFormulario.jsx
├── mocks/               # Dados fictícios
│   └── eventosMock.js
├── pages/               # Páginas da aplicação
└── styles/              # Estilos das páginas
```

## Componentes e Mocks

| Componente | Descrição | Mock Usado |
|------------|-----------|------------|
| Header | Cabeçalho com título e subtítulo | - |
| Footer | Rodapé com texto | - |
| CardItem | Card para exibir item | itensMock |
| ListaItems | Lista de cards | itensMock |
| ModalFormulario | Modal com formulário | - |

## Versão do Node recomendada

Node.js 18+ e npm 9+

## Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request