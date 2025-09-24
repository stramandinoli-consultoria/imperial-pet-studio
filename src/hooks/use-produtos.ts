import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosApi, Produto } from "@/lib/api";

// Hook para buscar todos os produtos
export const useProdutos = (categoria?: string, tipoPet?: string, busca?: string) => {
  return useQuery({
    queryKey: ['produtos', categoria, tipoPet, busca],
    queryFn: () => produtosApi.getAll(categoria, tipoPet, busca),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar um produto específico
export const useProduto = (id: number) => {
  return useQuery({
    queryKey: ['produtos', id],
    queryFn: () => produtosApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para buscar categorias de produtos
export const useCategoriasProdutos = () => {
  return useQuery({
    queryKey: ['produtos', 'categorias'],
    queryFn: produtosApi.getCategorias,
    staleTime: 30 * 60 * 1000, // 30 minutos (dados muito estáticos)
  });
};

// Hook para buscar produtos em destaque
export const useProdutosDestaque = () => {
  return useQuery({
    queryKey: ['produtos', 'destaques'],
    queryFn: produtosApi.getDestaques,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};