import { API_SWAGGER_URL } from '@/lib/api';

/**
 * Hook para acessar a URL do Swagger
 * Útil apenas em desenvolvimento
 */
export const useSwaggerDocs = () => {
  const isDevMode = import.meta.env.DEV;
  
  return {
    isDevMode,
    swaggerUrl: API_SWAGGER_URL,
    openSwagger: () => {
      if (isDevMode) {
        window.open(API_SWAGGER_URL, '_blank');
      }
    }
  };
};
