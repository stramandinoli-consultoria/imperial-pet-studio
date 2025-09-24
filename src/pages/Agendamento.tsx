import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePets } from "@/hooks/use-pets";
import { useServicos, useHorariosDisponiveis } from "@/hooks/use-servicos";
import { useAgendamentos, useCreateAgendamento, useCancelAgendamento } from "@/hooks/use-agendamentos";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, User, Heart, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ErrorBoundary from "@/components/ErrorBoundary";

const Agendamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    petId: "",
    servicoId: "",
    data: "",
    horario: "",
    observacoes: ""
  });

  // Hooks da API
  const { data: pets, isLoading: loadingPets, error: errorPets } = usePets();
  const { data: servicos, isLoading: loadingServicos, error: errorServicos } = useServicos();
  const { data: agendamentos, isLoading: loadingAgendamentos, error: errorAgendamentos } = useAgendamentos();
  const { data: horariosDisponiveis, isLoading: loadingHorarios } = useHorariosDisponiveis(
    parseInt(formData.servicoId) || 0,
    formData.data
  );
  const createAgendamento = useCreateAgendamento();
  const cancelAgendamento = useCancelAgendamento();

  // Debug logs
  console.log('Agendamento Debug:', {
    pets,
    loadingPets,
    errorPets,
    servicos,
    loadingServicos,
    errorServicos,
    agendamentos,
    loadingAgendamentos,
    errorAgendamentos,
    user
  });

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se houver erro crítico, mostrar erro
  if (errorPets || errorServicos || errorAgendamentos) {
    console.error('Erro crítico nos hooks:', { errorPets, errorServicos, errorAgendamentos });
    // Não bloquear a renderização, apenas logar o erro
  }

  // Função auxiliar para extrair preço do serviço
  const getPrecoServico = (servico: any): number => {
    return servico.preco || servico.Preco || 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpar horário quando mudar data ou serviço
      ...(name === 'data' || name === 'servicoId' ? { horario: "" } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { petId, servicoId, data, horario, observacoes } = formData;
    
    if (!petId || !servicoId || !data || !horario) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se a data não é no passado
    const selectedDate = new Date(data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast({
        title: "Erro",
        description: "Não é possível agendar para datas passadas.",
        variant: "destructive"
      });
      return;
    }

    const dataHorario = `${data}T${horario}:00`;

    try {
      await createAgendamento.mutateAsync({
        petId: parseInt(petId),
        servicoId: parseInt(servicoId),
        dataHorario,
        observacoes: observacoes || undefined,
      });

      // Limpar formulário
      setFormData({
        petId: "",
        servicoId: "",
        data: "",
        horario: "",
        observacoes: ""
      });
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleCancelAgendamento = async (id: number) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelAgendamento.mutateAsync(id);
      } catch (error) {
        // Erro já tratado pelo hook
      }
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      "Aguardando": "Aguardando",
      "Confirmado": "Confirmado",
      "Em Andamento": "Em Andamento", 
      "Concluído": "Concluído",
      "Cancelado": "Cancelado"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-green-100 text-green-800";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      case "Concluído":
        return "bg-gray-100 text-gray-800";
      case "Cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Formatação de data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];

  console.log('Renderizando componente Agendamento...');

  return (
    <ErrorBoundary>
      <Layout>
        <Helmet>
          <title>Agendamento | Imperial Pet Studio</title>
          <meta name="description" content="Agende serviços de banho e tosa para seu pet com facilidade." />
        </Helmet>

      <div className="container py-12 md:py-16 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Agendamento de Serviços</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Olá, {user?.nome || 'usuário'}! Agende serviços para seu pet de forma rápida e prática.
          </p>
          
          {/* Debug info - remover depois */}
          <div className="text-xs text-gray-500 mt-2">
            Debug: Pets={pets?.length}, Serviços={servicos?.length}, Agendamentos={agendamentos?.length}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulário de Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Novo Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pet */}
                <div className="space-y-2">
                  <Label>Pet *</Label>
                  {loadingPets ? (
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando pets...
                    </div>
                  ) : pets && pets.length > 0 ? (
                    <Select value={formData.petId} onValueChange={(value) => handleInputChange("petId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id.toString()}>
                            {pet.nome} ({pet.especie})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 border rounded text-muted-foreground">
                      Você precisa cadastrar um pet primeiro.
                    </div>
                  )}
                </div>

                {/* Serviço */}
                <div className="space-y-2">
                  <Label>Serviço *</Label>
                  {loadingServicos ? (
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando serviços...
                    </div>
                  ) : (
                    <Select value={formData.servicoId} onValueChange={(value) => handleInputChange("servicoId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicos?.map((servico) => (
                          <SelectItem key={servico.id} value={servico.id.toString()}>
                            {servico.nome} - R$ {getPrecoServico(servico).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <input
                    type="date"
                    min={today}
                    value={formData.data}
                    onChange={(e) => handleInputChange("data", e.target.value)}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Horário */}
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  {!formData.servicoId || !formData.data ? (
                    <div className="p-3 border rounded text-muted-foreground">
                      Selecione um serviço e data primeiro
                    </div>
                  ) : loadingHorarios ? (
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando horários...
                    </div>
                  ) : horariosDisponiveis && horariosDisponiveis.length > 0 ? (
                    <Select value={formData.horario} onValueChange={(value) => handleInputChange("horario", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {horariosDisponiveis.map((horario) => (
                          <SelectItem key={horario} value={horario}>
                            {horario}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 border rounded text-muted-foreground">
                      Nenhum horário disponível para esta data
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Informações adicionais sobre seu pet..."
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="hero"
                  disabled={createAgendamento.isPending || !pets || pets.length === 0}
                >
                  {createAgendamento.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Agendar Serviço
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Meus Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAgendamentos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Carregando agendamentos...
                </div>
              ) : !agendamentos || agendamentos.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Seu primeiro agendamento aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{agendamento.servico?.nome}</h4>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <User className="h-4 w-4" />
                            {agendamento.pet?.nome} ({agendamento.pet?.especie})
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(agendamento.status)}>
                            {formatStatus(agendamento.status)}
                          </Badge>
                          {agendamento.status === "Aguardando" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelAgendamento(agendamento.id)}
                              disabled={cancelAgendamento.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(agendamento.dataHorario).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(agendamento.dataHorario).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      {agendamento.observacoes && (
                        <div className="text-sm">
                          <strong>Observações:</strong> {agendamento.observacoes}
                        </div>
                      )}

                      {agendamento.servico && (
                        <div className="text-sm font-semibold text-primary">
                          R$ {getPrecoServico(agendamento.servico).toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
    </ErrorBoundary>
  );
};

export default Agendamento;