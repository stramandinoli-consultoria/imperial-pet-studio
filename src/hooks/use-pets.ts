import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { petsApi, Pet } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// Hook para buscar todos os pets do usuário
export const usePets = () => {
  return useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      console.log('Buscando pets...');
      try {
        const result = await petsApi.getAll();
        console.log('Pets recebidos:', result);
        return result;
      } catch (error) {
        console.error('Erro ao buscar pets:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

// Hook para buscar um pet específico
export const usePet = (id: number) => {
  return useQuery({
    queryKey: ['pets', id],
    queryFn: () => petsApi.getById(id),
    enabled: !!id,
  });
};

// Hook para criar um pet
export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast({
        title: "Pet cadastrado!",
        description: "O pet foi cadastrado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar um pet
export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Pet, 'id' | 'clienteId'> }) =>
      petsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pets', id] });
      toast({
        title: "Pet atualizado!",
        description: "As informações do pet foram atualizadas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook para deletar um pet
export const useDeletePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast({
        title: "Pet removido",
        description: "O pet foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover pet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};