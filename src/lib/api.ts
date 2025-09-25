// Configuração da API
const API_BASE_URL = 'https://imperial-pet-studio-api-production.up.railway.app/api';

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
    const errorData: ApiError = await response.json().catch(() => ({
      message: 'Erro de conexão com o servidor'
    }));
    
    // Se o token expirou, remover do localStorage
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
  endereco?: string;
  dataCadastro: string;
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
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    nome: string;
    email: string;
    password: string;
    telefone: string;
    endereco?: string;
  }) => {
    return apiRequest<{ token: string; cliente: Cliente }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
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
    return apiRequest<string[]>(`/Servicos/${servicoId}/horarios-disponiveis?data=${data}`);
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