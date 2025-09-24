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
  preco?: number;  // Tornado opcional para evitar erros
  Preco?: number;  // API pode retornar com P maiúsculo
  duracao: number;
  Duracao?: number; // API pode retornar com D maiúsculo
  tipo: string;
  Tipo?: string;   // API pode retornar com T maiúsculo
  tipoPet?: string;
  TipoPet?: string; // API pode retornar com T maiúsculo
  ativo: boolean;
  Ativo?: boolean;  // API pode retornar com A maiúsculo
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
  clienteId: number;
  petId: number;
  servicoId: number;
  dataHorario: string;
  status: string;
  observacoes?: string;
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
    return apiRequest<Servico[]>(`/servicos${query}`);
  },

  getById: async (id: number) => {
    return apiRequest<Servico>(`/servicos/${id}`);
  },

  getTipos: async () => {
    return apiRequest<string[]>('/servicos/tipos');
  },

  getHorariosDisponiveis: async (servicoId: number, data: string) => {
    return apiRequest<string[]>(`/servicos/${servicoId}/horarios-disponiveis?data=${data}`);
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
    return apiRequest<Agendamento[]>('/agendamentos');
  },

  getById: async (id: number) => {
    return apiRequest<Agendamento>(`/agendamentos/${id}`);
  },

  create: async (agendamentoData: {
    petId: number;
    servicoId: number;
    dataHorario: string;
    observacoes?: string;
  }) => {
    return apiRequest<Agendamento>('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(agendamentoData),
    });
  },

  update: async (id: number, agendamentoData: Partial<Agendamento>) => {
    return apiRequest<Agendamento>(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agendamentoData),
    });
  },

  updateStatus: async (id: number, status: string) => {
    return apiRequest<void>(`/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  cancel: async (id: number) => {
    return apiRequest<void>(`/agendamentos/${id}/cancel`, {
      method: 'PATCH',
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