import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicosApi, Servico } from "@/lib/api";

// Hook para buscar todos os serviços
export const useServicos = (tipo?: string, tipoPet?: string) => {
  return useQuery({
    queryKey: ['servicos', tipo, tipoPet],
    queryFn: async () => {
      console.log('Buscando serviços...');
      try {
        const result = await servicosApi.getAll(tipo, tipoPet);
        console.log('Serviços recebidos:', result);
        console.log('Primeiro serviço:', result?.[0]);
        console.log('Estrutura das chaves do primeiro serviço:', Object.keys(result?.[0] || {}));
        return result;
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (dados mais estáticos)
    retry: 2,
  });
};

// Hook para buscar um serviço específico
export const useServico = (id: number) => {
  return useQuery({
    queryKey: ['servicos', id],
    queryFn: () => servicosApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para buscar tipos de serviços
export const useTiposServicos = () => {
  return useQuery({
    queryKey: ['servicos', 'tipos'],
    queryFn: servicosApi.getTipos,
    staleTime: 30 * 60 * 1000, // 30 minutos (dados muito estáticos)
  });
};

// Hook para buscar horários disponíveis
export const useHorariosDisponiveis = (servicoId: number, data: string) => {
  return useQuery({
    queryKey: ['servicos', servicoId, 'horarios', data],
    queryFn: () => servicosApi.getHorariosDisponiveis(servicoId, data),
    enabled: !!servicoId && !!data,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados dinâmicos)
  });
};