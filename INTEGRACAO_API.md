# Integração Frontend + API - Imperial Pet Studio

Este documento descreve como o frontend React está integrado com a API .NET Core 6 hospedada na Railway.

## 🔗 URL da API

A API está hospedada em: **https://imperial-pet-studio-api-production.up.railway.app**

### Endpoints Disponíveis

#### Swagger/Documentação
- **GET** `/` - Interface Swagger da API

#### Autenticação
- **POST** `/api/auth/login` - Login de usuário
- **POST** `/api/auth/register` - Cadastro de usuário
- **GET** `/api/auth/profile` - Perfil do usuário logado
- **PUT** `/api/auth/profile` - Atualizar perfil

#### Pets
- **GET** `/api/pets` - Listar pets do usuário
- **POST** `/api/pets` - Criar novo pet
- **GET** `/api/pets/{id}` - Buscar pet específico
- **PUT** `/api/pets/{id}` - Atualizar pet
- **DELETE** `/api/pets/{id}` - Deletar pet

#### Serviços
- **GET** `/api/servicos` - Listar serviços
- **GET** `/api/servicos/{id}` - Buscar serviço específico
- **GET** `/api/servicos/tipos` - Tipos de serviços
- **GET** `/api/servicos/{id}/horarios-disponiveis` - Horários disponíveis

#### Produtos
- **GET** `/api/produtos` - Listar produtos
- **GET** `/api/produtos/{id}` - Buscar produto específico
- **GET** `/api/produtos/categorias` - Categorias de produtos
- **GET** `/api/produtos/destaques` - Produtos em destaque

#### Agendamentos
- **GET** `/api/agendamentos` - Listar agendamentos do usuário
- **POST** `/api/agendamentos` - Criar agendamento
- **GET** `/api/agendamentos/{id}` - Buscar agendamento específico
- **PUT** `/api/agendamentos/{id}` - Atualizar agendamento
- **PATCH** `/api/agendamentos/{id}/status` - Atualizar status
- **PATCH** `/api/agendamentos/{id}/cancel` - Cancelar agendamento

#### Pedidos
- **GET** `/api/pedidos` - Listar pedidos do usuário
- **POST** `/api/pedidos` - Criar novo pedido
- **GET** `/api/pedidos/{id}` - Buscar pedido específico
- **PATCH** `/api/pedidos/{id}/status` - Atualizar status do pedido

## 🛠️ Arquitetura da Integração

### Camada de API (`src/lib/api.ts`)

Contém todas as funções para comunicação com a API:
- Configuração base da URL da API
- Headers automáticos (Authorization com JWT)
- Tratamento de erros centralizados
- Interfaces TypeScript para tipagem

### Hooks Customizados

#### `src/hooks/use-pets.ts`
- `usePets()` - Lista todos os pets
- `usePet(id)` - Busca um pet específico
- `useCreatePet()` - Cria um novo pet
- `useUpdatePet()` - Atualiza um pet
- `useDeletePet()` - Remove um pet

#### `src/hooks/use-servicos.ts`
- `useServicos()` - Lista serviços com filtros
- `useServico(id)` - Busca um serviço
- `useTiposServicos()` - Lista tipos de serviços
- `useHorariosDisponiveis()` - Horários disponíveis para agendamento

#### `src/hooks/use-produtos.ts`
- `useProdutos()` - Lista produtos com filtros
- `useProduto(id)` - Busca um produto
- `useCategoriasProdutos()` - Lista categorias
- `useProdutosDestaque()` - Produtos em destaque

#### `src/hooks/use-agendamentos.ts`
- `useAgendamentos()` - Lista agendamentos do usuário
- `useCreateAgendamento()` - Cria agendamento
- `useUpdateAgendamento()` - Atualiza agendamento
- `useCancelAgendamento()` - Cancela agendamento

### Contexto de Autenticação (`src/context/AuthContext.tsx`)

Gerencia o estado de autenticação:
- Login/logout com JWT
- Armazenamento do token no localStorage
- Redirecionamento automático quando token expira
- Carregamento automático do perfil do usuário

## 🔄 Fluxo de Autenticação

1. **Login**: Usuario faz login → API retorna JWT token + dados do usuário
2. **Armazenamento**: Token salvo no localStorage
3. **Requests**: Todas as requisições incluem `Authorization: Bearer {token}`
4. **Expiração**: Se API retorna 401, token é removido e usuário redirecionado para login

## 📱 Páginas Integradas

### `/login` e `/register`
- Comunicação direta com API para autenticação
- Validação de dados no frontend e backend

### `/profile`
- Carrega dados do usuário logado via API
- Permite atualização de informações pessoais

### `/meus-pets`
- CRUD completo de pets do usuário
- Interface para adicionar, editar e remover pets

### `/agendamento`
- Lista serviços disponíveis da API
- Mostra horários disponíveis em tempo real
- Cria agendamentos vinculados aos pets do usuário
- Lista agendamentos existentes com status

### Homepage (`/`)
- Carrega produtos em destaque da API
- Exibe serviços disponíveis
- Integração com catálogo de produtos

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

A URL da API está configurada diretamente no código (`src/lib/api.ts`):

```typescript
const API_BASE_URL = 'https://imperial-pet-studio-api-production.up.railway.app/api';
```

### Cache e Performance

Utilizando TanStack Query para:
- Cache inteligente de dados
- Invalidação automática após mutações
- Loading states e error handling
- Refetch automático quando necessário

### Tratamento de Erros

- Erros de rede são capturados e exibidos via toast
- Tokens expirados redirecionam para login automaticamente
- Validações de formulário no frontend
- Mensagens de erro amigáveis ao usuário

## 🚀 Como Testar a Integração

1. **Cadastro**: Crie uma conta em `/register`
2. **Login**: Faça login em `/login`
3. **Pets**: Vá para `/meus-pets` e adicione um pet
4. **Agendamento**: Vá para `/agendamento` e crie um agendamento
5. **Perfil**: Atualize suas informações em `/profile`

## 📋 Status da Integração

✅ **Concluído**:
- Sistema de autenticação completo
- CRUD de pets
- Sistema de agendamentos
- Listagem de serviços e produtos
- Perfil do usuário

⏳ **Pendente**:
- Sistema de pedidos (carrinho de compras)
- Upload de imagens
- Notificações push
- Integração com pagamentos

## 🔍 Monitoramento

- API disponível 24/7 na Railway
- Logs de erro no console do navegador
- Status da API visível no Swagger: https://imperial-pet-studio-api-production.up.railway.app

## 📞 Suporte

Em caso de problemas com a integração:
1. Verifique o console do navegador para erros
2. Confirme se a API está respondendo
3. Verifique se o token JWT não expirou
4. Teste os endpoints diretamente no Swagger