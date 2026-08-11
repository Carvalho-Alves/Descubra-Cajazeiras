🌍 Descubra+ Cajazeiras

Aplicação web para centralizar e disponibilizar informações turísticas de Cajazeiras–PB: serviços (hospedagem, alimentação/lazer, pontos turísticos), eventos, mapa interativo, avaliações por estrelas e dashboard.

Stack:
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: MongoDB (Mongoose)
- **Mobile**: React Native + Expo + TypeScript
- **Segurança**: JWT, Helmet, CORS, Rate Limit, Multer

## Principais novidades desta versão

### Backend & Frontend Web

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

### App Mobile (React Native + Expo)

- Mapa interativo com limites de Cajazeiras
	- Restrição de zoom e pan apenas dentro do município
	- Marcadores de serviços e eventos em tempo real
	- Modal com opções ao clicar em um ponto

- Telas de detalhes completas
	- Página de detalhes de Serviço: informações completas, imagem, rating, contato
	- Página de detalhes de Evento: data, local, horário, rating, contato
	- Acesso direto a avaliações a partir das telas de detalhes

- Validação de formulários com Yup
	- Schemas de validação para Serviço e Evento
	- Feedback em tempo real ao usuário
	- Integração com formulários de criação

- Geolocalização e Maps
	- Captura de localização atual do dispositivo
	- Botão “Usar Minha Localização” nos formulários
	- Integração com react-native-maps (mobile) e fallback para web

- Filtros dinâmicos
	- Filtros por categoria de Serviço (Todos, Hospedagem, Alimentação, Turístico)
	- Filtros por status de Evento (Todos, Ativo, Cancelado, Encerrado)
	- Busca por nome em tempo real

- Dashboard de Perfil
	- Abas: Resumo, Atividades, Favoritos, Configurações
	- Estatísticas do usuário
	- Gerenciamento de favoritos
	- Edição de informações pessoais

- Cache local com AsyncStorage
	- Persistência de autenticação
	- Armazenamento de favoritos
	- Dados offline

- Sistema completo de avaliações
	- Visualização de avaliações por serviço/evento
	- Listagem de avaliações em destaque
	- Criação de novas avaliações com rating e comentários

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

## Funcionalidades de Cache Local (Mobile)

No app mobile, o AsyncStorage gerencia persistência de dados:

- **Autenticação**: Armazena JWT e dados do usuário logado
- **Favoritos**: Salvamento de serviços/eventos favoritados
- **Cache de listagens**: Dados offline disponíveis quando sem conexão

## Tutorial de Execução do Projeto

### Backend
1. Navegue para `backend/`: `cd backend`
2. Instale dependências: `npm install`
3. Configure `.env` (veja exemplo acima).
4. Execute: `npm run dev` (porta 3333). Ou com Docker: `docker-compose up` (inclui MongoDB/Neo4j).

### App Mobile (React Native + Expo)
1. Navegue para `mobile/`: `cd mobile`
2. Instale dependências: `npm install`
3. Execute em dev: `npm run dev` (inicia servidor Expo em LAN).
4. Escaneie o QR Code com Expo Go no seu celular.

## Demonstração do Sistema e Funcionalidades

Execute o backend e o app mobile. Explore:

- **Cadastro/Login**: Crie conta, faça login com seus dados.
- **Mapa Interativo**: Visualize serviços e eventos em tempo real, limitado a Cajazeiras.
- **Serviços/Eventos**: Liste, crie, edite, delete; busque/filtre por categoria.
- **Detalhes Completos**: Clique em um item do mapa ou da lista para ver detalhes completos com minimap.
- **Avaliações**: Veja e crie avaliações com estrelas e comentários.
- **Dashboard**: Visualize seu perfil com estatísticas, atividades, favoritos e configurações.
- **Geolocalização**: Use "Minha Localização" para capturar sua posição ao criar novos itens.
- **Offline**: Seus dados em cache permanecem disponíveis mesmo sem conexão.

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

### Funcionalidades implementadas (Mobile)

- **Mapa Interativo**: Visualização de todos os serviços e eventos em tempo real, limitado ao município de Cajazeiras
- **Filtros dinâmicos**: Por categoria de serviço e status de evento
- **Busca**: Busca rápida de serviços e eventos pelo nome
- **Detalhes completos**: Cada serviço e evento tem página de detalhes com:
  - Imagem principal
  - Descrição
  - Avaliação média (rating)
  - Informações de contato (telefone, horário, local)
  - Minimap com localização
  - Botão direto para ver avaliações
- **Validação de formulários**: Usando Yup para validação de dados nos formulários de cadastro
- **Cache local**: AsyncStorage para persistência de dados (autenticação, favoritos)
- **Geolocalização**: 
  - Posicionamento atual do usuário no mapa
  - Captura de localização ao cadastrar serviço/evento
- **Avaliações**: Sistema completo de avaliações com estrelas (1-5) e comentários
- **Dashboard do usuário**: Perfil com estatísticas, atividades recentes, favoritos e configurações

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
| Home | `Tabs > Home` | Mapa interativo com serviços e eventos de Cajazeiras |
| Favoritos | `Tabs > Favoritos` | Itens salvos pelo usuário |
| Perfil | `Tabs > Perfil` | Dashboard pessoal do usuário com abas (Resumo, Atividades, Favoritos, Configurações) |
| Gerenciar Eventos | `GerenciarEventos` | CRUD de eventos do usuário com filtros (Todos, Ativo, Cancelado, Encerrado) |
| Gerenciar Serviços | `GerenciarServicos` | CRUD de serviços com filtros (Todos, Hospedagem, Alimentação, Turístico) |
| Detalhes do Serviço | `GerenciarServicosDetail` | Visualização completa de um serviço com mapa mini, rating e botão para avaliações |
| Detalhes do Evento | `GerenciarEventosDetail` | Visualização completa de um evento com data, local, rating e botão para avaliações |
| Novo Serviço | `NovoServico` | Formulário de cadastro de serviço com localização via GPS |
| Novo Evento | `NovoEvento` | Formulário de cadastro de evento com localização via GPS |
| Avaliações | `Avaliacoes` | Listagem e filtro de avaliações por serviço/evento |
| Avaliações em Destaque | `AvaliacoesDestaque` | Resenhas destacadas com estatísticas |
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