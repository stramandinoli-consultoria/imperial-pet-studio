import { useSwaggerDocs } from '@/hooks/use-swagger-docs';

/**
 * Componente que exibe um botão para acessar o Swagger
 * Apenas visível em modo de desenvolvimento
 */
export const SwaggerButton = () => {
  const { isDevMode, openSwagger } = useSwaggerDocs();

  if (!isDevMode) return null;

  return (
    <button
      onClick={openSwagger}
      className="fixed bottom-4 right-4 px-3 py-2 text-xs font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors z-50"
      title="Abrir documentação da API (modo desenvolvimento)"
    >
      📚 API Docs
    </button>
  );
};
