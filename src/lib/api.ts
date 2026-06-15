// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://imperial-pet-studio-api-production.up.railway.app/api';

// URL do Swagger (para acessar documentação da API)
export const API_SWAGGER_URL = import.meta.env.VITE_API_SWAGGER_URL || 'https://imperial-pet-studio-api-production.up.railway.app/swagger';

// Interface para respostas da API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Interface para erros da API
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Erro de conexão com o servidor'
    }));
    
    // Se o token expirou, remover do localStorage
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    // O backend pode retornar { mensagem } ou { message }
    throw new Error(errorData.mensagem || errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Se a resposta está vazia (como em DELETE), retornar null
  const text = await response.text();
  if (!text) {
    return null as T;
  }
  
  try {
    return JSON.parse(text);
  } catch {
    // Se não conseguir fazer parse do JSON, retornar null
    return null as T;
  }
}

// Interfaces dos dados
export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  dataCadastro: string;
  isAdmin?: boolean;
  ativo?: boolean;
}

export interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  sexo: string;
  dataNascimento: string;
  peso: number;
  porte: string;
  cor: string;
  observacoes: string;
  clienteId: number;
}

export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  precoBase: number;
  categoria: string;
  duracaoMinutos: number;
  ativo: boolean;
  dataCadastro: string;
  // Campos de compatibilidade (caso a API mude)
  preco?: number;
  Preco?: number;
  duracao?: number;
  Duracao?: number;
  tipo?: string;
  Tipo?: string;
  tipoPet?: string;
  TipoPet?: string;
  Ativo?: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
  marca?: string;
  estoque: number;
  tipoPet?: string;
  imagemUrl?: string;
  ativo: boolean;
}

export interface Agendamento {
  id: number;
  dataHora: string;
  status: string;
  observacoes?: string;
  valorTotal: number;
  dataCriacao: string;
  dataConclusao?: string | null;
  clienteId: number;
  nomeCliente: string;
  petId: number;
  nomePet: string;
  servicos: Servico[];
  // Campos de compatibilidade para versões antigas
  servicoId?: number;
  dataHorario?: string;
  pet?: Pet;
  servico?: Servico;
}

export interface Pedido {
  id: number;
  clienteId: number;
  dataPedido: string;
  status: string;
  valorTotal: number;
  itens: PedidoItem[];
}

export interface PedidoItem {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  produto?: Produto;
}

// APIs de Autenticação
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ token: string; cliente: Cliente }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha: password }),
    });
  },

  register: async (userData: {
    nome: string;
    email: string;
    password: string;
    telefone: string;
    cpf?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  }) => {
    return apiRequest<{ token: string; cliente: Cliente }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, senha: userData.password, password: undefined }),
    });
  },

  getProfile: async () => {
    return apiRequest<Cliente>('/auth/profile');
  },

  updateProfile: async (userData: Partial<Cliente>) => {
    return apiRequest<Cliente>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// APIs de Pets
export const petsApi = {
  getAll: async () => {
    return apiRequest<Pet[]>('/Pets');
  },

  getById: async (id: number) => {
    return apiRequest<Pet>(`/Pets/${id}`);
  },

  create: async (petData: Omit<Pet, 'id'>) => {
    return apiRequest<Pet>('/Pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  },

  update: async (id: number, petData: Omit<Pet, 'id' | 'clienteId'>) => {
    return apiRequest<Pet>(`/Pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  },

  delete: async (id: number) => {
    return apiRequest<void>(`/Pets/${id}`, {
      method: 'DELETE',
    });
  },
};

// APIs de Serviços
export const servicosApi = {
  getAll: async (tipo?: string, tipoPet?: string) => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (tipoPet) params.append('tipoPet', tipoPet);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Servico[]>(`/Servicos${query}`);
  },

  getById: async (id: number) => {
    return apiRequest<Servico>(`/Servicos/${id}`);
  },

  getTipos: async () => {
    return apiRequest<string[]>('/Servicos/tipos');
  },

  getHorariosDisponiveis: async (servicoId: number, data: string) => {
    const response = await apiRequest<{ horariosDisponiveis: string[] } | string[]>(
      `/Servicos/${servicoId}/horarios-disponiveis?data=${data}`
    );
    // A API retorna um objeto { horariosDisponiveis: [...] } ou diretamente um array
    if (Array.isArray(response)) {
      return response;
    }
    return response.horariosDisponiveis ?? [];
  },
};

// APIs de Produtos
export const produtosApi = {
  getAll: async (categoria?: string, tipoPet?: string, busca?: string) => {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (tipoPet) params.append('tipoPet', tipoPet);
    if (busca) params.append('busca', busca);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Produto[]>(`/produtos${query}`);
  },

  getById: async (id: number) => {
    return apiRequest<Produto>(`/produtos/${id}`);
  },

  getCategorias: async () => {
    return apiRequest<string[]>('/produtos/categorias');
  },

  getDestaques: async () => {
    return apiRequest<Produto[]>('/produtos/destaques');
  },
};

// APIs de Agendamentos
export const agendamentosApi = {
  getAll: async () => {
    return apiRequest<Agendamento[]>('/Agendamentos');
  },

  getById: async (id: number) => {
    return apiRequest<Agendamento>(`/Agendamentos/${id}`);
  },

  create: async (agendamentoData: {
    dataHora: string;
    observacoes: string;
    clienteId: number;
    petId: number;
    servicoIds: number[] | number;
  }) => {
    // Garante que servicoIds sempre será um array
    const servicoIdsArray = Array.isArray(agendamentoData.servicoIds)
      ? agendamentoData.servicoIds
      : [agendamentoData.servicoIds];
    const apiData = {
      dataHora: agendamentoData.dataHora,
      observacoes: agendamentoData.observacoes,
      clienteId: agendamentoData.clienteId,
      petId: agendamentoData.petId,
      servicoIds: servicoIdsArray,
    };
    return apiRequest<Agendamento>('/Agendamentos', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  },

  update: async (id: number, agendamentoData: Partial<Agendamento>) => {
    return apiRequest<Agendamento>(`/Agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agendamentoData),
    });
  },

  updateStatus: async (id: number, status: string) => {
    return apiRequest<void>(`/Agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  cancel: async (id: number) => {
    return apiRequest<void>(`/Agendamentos/${id}/cancel`, {
      method: 'POST',
    });
  },
};

// APIs de Pedidos
export const pedidosApi = {
  getAll: async () => {
    return apiRequest<Pedido[]>('/pedidos');
  },

  getById: async (id: number) => {
    return apiRequest<Pedido>(`/pedidos/${id}`);
  },

  create: async (pedidoData: {
    itens: Array<{
      produtoId: number;
      quantidade: number;
    }>;
  }) => {
    return apiRequest<Pedido>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    });
  },

  updateStatus: async (id: number, status: string) => {
    return apiRequest<void>(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

export default {
  auth: authApi,
  pets: petsApi,
  servicos: servicosApi,
  produtos: produtosApi,
  agendamentos: agendamentosApi,
  pedidos: pedidosApi,
};

// ─── Tipos Roleta ────────────────────────────────────────────────────────────

export interface RoletaPremio {
  id: number;
  nome: string;
  descricao?: string;
  cor: string;
  posicao: number;
  ehPerdedor: boolean;
  clientesGanhadores: number;
  ativo: boolean;
}

export interface RoletaInfo {
  id: number;
  nome: string;
  descricao?: string;
  status: string;
  sorteiosPorDia: number;
  totalSorteios: number;
  ativo: boolean;
  premios: RoletaPremio[];
}

export interface SorteioResultado {
  premioId: number;
  nomePremio: string;
  descricaoPremio?: string;
  ganhou: boolean;
  premioUtilizado: boolean;
  dataUtilizacao?: string;
  dataSorteio: string;
  mensagem: string;
}

// Helper para requisições autenticadas como admin
async function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Erro de conexão' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as unknown as T;
  return response.json();
}

// ─── APIs de Roleta (Cliente) ────────────────────────────────────────────────

export interface RoletaStatus {
  podeGirar: boolean;
  sorteiosMes: number;
  limitePermitido: number;
  liberacaoAtiva: boolean;
}

export const roletaApi = {
  getAtiva: () => apiRequest<RoletaInfo>('/roletas/ativa'),

  sortear: () => apiRequest<SorteioResultado>('/roletas/sortear', { method: 'POST' }),

  getHistorico: () => apiRequest<SorteioResultado[]>('/roletas/historico'),

  getMeuStatus: () => apiRequest<RoletaStatus>('/roletas/meu-status'),
};

// ─── APIs de Roleta (Admin) ──────────────────────────────────────────────────

export const roletaAdminApi = {
  adminLogin: async (login: string, senha: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: login, senha }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Credenciais inválidas' }));
      throw new Error(err.message || 'Erro no login admin');
    }
    return res.json() as Promise<{ token: string; usuario: { id: number; nome: string; login: string; perfil: string } }>;
  },

  listarRoletas: () => adminRequest<RoletaInfo[]>('/roletas/admin/lista'),

  criarRoleta: (data: { nome: string; descricao?: string; status?: string; sorteiosPorDia: number }) =>
    adminRequest<RoletaInfo>('/roletas/admin/roleta', { method: 'POST', body: JSON.stringify(data) }),

  atualizarRoleta: (id: number, data: { nome: string; descricao?: string; status?: string; sorteiosPorDia: number }) =>
    adminRequest<RoletaInfo>(`/roletas/admin/roleta/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  listarPremios: (roletaId: number) =>
    adminRequest<RoletaPremio[]>(`/roletas/admin/roleta/${roletaId}/premios`),

  criarPremio: (roletaId: number, data: { nome: string; descricao?: string; cor?: string; ehPerdedor: boolean }) =>
    adminRequest<RoletaPremio>(`/roletas/admin/roleta/${roletaId}/premios`, { method: 'POST', body: JSON.stringify(data) }),

  atualizarPremio: (id: number, data: { nome: string; descricao?: string; cor?: string; ehPerdedor: boolean }) =>
    adminRequest<RoletaPremio>(`/roletas/admin/premios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  removerPremio: (id: number) =>
    adminRequest<void>(`/roletas/admin/premios/${id}`, { method: 'DELETE' }),

  getEstatisticas: () => adminRequest<{ roletaId: number; roletaNome: string; totalSorteios: number; premios: { premioId: number; nome: string; ehPerdedor: boolean; clientesGanhadores: number; percentualGanhos: number }[] }>('/roletas/estatisticas'),

  getHistoricoAdmin: (pagina = 1, tamPagina = 20) =>
    adminRequest<{ total: number; pagina: number; tamPagina: number; sorteios: { id: number; clienteNome: string; clienteEmail: string; premioNome: string; ganhou: boolean; dataSorteio: string }[] }>(`/roletas/admin/historico?pagina=${pagina}&tamPagina=${tamPagina}`),
};

// ─── Interfaces Admin ─────────────────────────────────────────────────────────

export interface AdminDashboard {
  totalClientes: number;
  agendamentosSemana: number;
  girosMes: number;
  agendamentosConcluidosMes: number;
}

export interface AdminAgendamento {
  id: number;
  dataHora: string;
  status: string;
  observacoes?: string;
  valorTotal: number;
  dataCriacao: string;
  dataConclusao?: string | null;
  clienteId: number;
  nomeCliente: string;
  telefoneCliente: string;
  petId: number;
  nomePet: string;
  servicos: { id: number; nome: string; precoBase: number }[];
}

export interface AdminSorteio {
  id: number;
  dataSorteio: string;
  premioUtilizado: boolean;
  dataUtilizacao?: string | null;
  observacoes?: string;
  clienteId: number;
  nomeCliente: string;
  telefoneCliente: string;
  premioId: number;
  nomePremio: string;
  descricaoPremio?: string;
  corPremio: string;
}

export interface AdminPremio {
  id: number;
  nome: string;
  descricao?: string;
  cor: string;
  posicao: number;
  ehPerdedor: boolean;
  ativo: boolean;
  clientesGanhadores: number;
  roletaId: number;
  nomeRoleta?: string;
}

export interface AdminRoleta {
  id: number;
  nome: string;
  status: string;
}

export interface AdminCliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  dataCadastro: string;
  ultimaLiberacaoRoleta?: string | null;
  sorteiosMes: number;
  liberacaoAtiva: boolean;
}

// ─── APIs Admin (usar token do cliente admin) ─────────────────────────────────

export const adminApi = {
  getDashboard: () =>
    apiRequest<AdminDashboard>('/admin/dashboard'),

  getAgendamentos: (params?: { status?: string; dataInicio?: string; dataFim?: string; pagina?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.append('status', params.status);
    if (params?.dataInicio) qs.append('dataInicio', params.dataInicio);
    if (params?.dataFim) qs.append('dataFim', params.dataFim);
    if (params?.pagina) qs.append('pagina', String(params.pagina));
    const q = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<{ total: number; pagina: number; tamanhoPagina: number; items: AdminAgendamento[] }>(`/admin/agendamentos${q}`);
  },

  updateAgendamentoStatus: (id: number, status: string) =>
    apiRequest<{ message: string; status: string }>(`/admin/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    }),

  getSorteiosMes: (mes?: number, ano?: number) => {
    const qs = new URLSearchParams();
    if (mes) qs.append('mes', String(mes));
    if (ano) qs.append('ano', String(ano));
    const q = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<AdminSorteio[]>(`/admin/roleta/sorteios${q}`);
  },

  marcarPremioUtilizado: (id: number) =>
    apiRequest<{ message: string }>(`/admin/roleta/sorteios/${id}/utilizado`, {
      method: 'PATCH',
    }),

  getPremios: () =>
    apiRequest<AdminPremio[]>('/admin/roleta/premios'),

  getRoletas: () =>
    apiRequest<AdminRoleta[]>('/admin/roletas'),

  createPremio: (data: { roletaId?: number; nome: string; descricao?: string; cor: string; posicao: number; ehPerdedor: boolean; ativo?: boolean }) =>
    apiRequest<AdminPremio>('/admin/roleta/premios', { method: 'POST', body: JSON.stringify(data) }),

  updatePremio: (id: number, data: { nome: string; descricao?: string; cor: string; posicao: number; ehPerdedor: boolean; ativo?: boolean }) =>
    apiRequest<AdminPremio>(`/admin/roleta/premios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deletePremio: (id: number) =>
    apiRequest<void>(`/admin/roleta/premios/${id}`, { method: 'DELETE' }),

  getClientes: (busca?: string) => {
    const qs = busca ? `?busca=${encodeURIComponent(busca)}` : '';
    return apiRequest<AdminCliente[]>(`/admin/clientes${qs}`);
  },

  liberarRoleta: (id: number) =>
    apiRequest<{ message: string }>(`/admin/clientes/${id}/liberar-roleta`, { method: 'POST' }),
};