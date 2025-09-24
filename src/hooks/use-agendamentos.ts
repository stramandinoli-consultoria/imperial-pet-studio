import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agendamentosApi, Agendamento } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Hook para buscar todos os agendamentos do usuário
export const useAgendamentos = () => {
  return useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => {
      console.log('Buscando agendamentos...');
      try {
        const result = await agendamentosApi.getAll();
        console.log('Agendamentos recebidos:', result);
        return result;
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (dados dinâmicos)
    retry: 2,
  });
};

// Hook para buscar um agendamento específico
export const useAgendamento = (id: number) => {
  return useQuery({
    queryKey: ['agendamentos', id],
    queryFn: () => agendamentosApi.getById(id),
    enabled: !!id,
  });
};

// Hook para criar um agendamento
export const useCreateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agendamentosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      // Invalidar também os horários disponíveis
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao agendar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar um agendamento
export const useUpdateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Agendamento> }) =>
      agendamentosApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['agendamentos', id] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] }); // Invalidar horários
      toast({
        title: "Agendamento atualizado!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar status do agendamento
export const useUpdateStatusAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      agendamentosApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] }); // Invalidar horários
      toast({
        title: "Status atualizado!",
        description: "O status do agendamento foi alterado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para cancelar um agendamento
export const useCancelAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agendamentosApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['servicos'] }); // Invalidar horários
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};