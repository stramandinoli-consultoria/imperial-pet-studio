import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { usePets, useCreatePet, useUpdatePet, useDeletePet } from "@/hooks/use-pets";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pet } from "@/lib/api";

const MeusPets = () => {
  const { user } = useAuth();
  const { data: pets, isLoading } = usePets();
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    sexo: "",
    dataNascimento: "",
    peso: "",
    porte: "",
    cor: "",
    observacoes: ""
  });

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      especie: "",
      raca: "",
      sexo: "",
      dataNascimento: "",
      peso: "",
      porte: "",
      cor: "",
      observacoes: ""
    });
    setEditingPet(null);
  };

  const openDialog = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      // Converter dataNascimento para formato de input date
      const dataFormatada = pet.dataNascimento ? new Date(pet.dataNascimento).toISOString().split('T')[0] : "";
      setFormData({
        nome: pet.nome || "",
        especie: pet.especie || "",
        raca: pet.raca || "",
        sexo: pet.sexo || "",
        dataNascimento: dataFormatada,
        peso: (pet.peso || 0).toString(),
        porte: pet.porte || "",
        cor: pet.cor || "",
        observacoes: pet.observacoes || ""
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nome, especie, raca, sexo, dataNascimento, peso, porte, cor, observacoes } = formData;
    
    if (!nome || !especie || !sexo || !dataNascimento || !peso) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Converter data para ISO string e peso para número
      const dataNascimentoISO = new Date(dataNascimento).toISOString();
      const pesoNum = parseFloat(peso);
      
      const petData = {
        nome,
        especie,
        raca: raca || "",
        sexo,
        dataNascimento: dataNascimentoISO,
        peso: pesoNum,
        porte: porte || "",
        cor: cor || "",
        observacoes: observacoes || "",
        clienteId: user?.id || 0
      };

      if (editingPet) {
        // Para PUT, não enviamos clienteId
        const { clienteId, ...updateData } = petData;
        await updatePet.mutateAsync({ id: editingPet.id, data: updateData });
      } else {
        await createPet.mutateAsync(petData);
      }
      closeDialog();
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
    }
  };

  const handleDelete = async (pet: Pet) => {
    if (confirm(`Tem certeza que deseja remover ${pet.nome || 'este pet'}?`)) {
      try {
        console.log('Deletando pet:', pet.id);
        await deletePet.mutateAsync(pet.id);
        console.log('Pet deletado com sucesso');
      } catch (error) {
        console.error("Erro ao deletar pet:", error);
        alert("Erro ao deletar o pet. Tente novamente.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para calcular idade a partir da data de nascimento
  const calcularIdade = (dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return Math.max(0, idade);
  };

  return (
    <Layout>
      <Helmet>
        <title>Meus Pets - Imperial Pet Studio</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meus Pets</h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie as informações dos seus pets
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="hero"
                onClick={() => openDialog()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Pet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPet ? "Editar Pet" : "Adicionar Pet"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome do pet"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especie">Espécie *</Label>
                  <Select value={formData.especie} onValueChange={(value) => handleSelectChange("especie", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cão">Cão</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Coelho">Coelho</SelectItem>
                      <SelectItem value="Pássaro">Pássaro</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="raca">Raça</Label>
                  <Input
                    id="raca"
                    name="raca"
                    value={formData.raca}
                    onChange={handleInputChange}
                    placeholder="Raça do pet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo *</Label>
                  <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg) *</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.peso}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="porte">Porte</Label>
                    <Select value={formData.porte} onValueChange={(value) => handleSelectChange("porte", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Porte do pet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pequeno">Pequeno</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    name="cor"
                    value={formData.cor}
                    onChange={handleInputChange}
                    placeholder="Cor do pet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    placeholder="Informações adicionais sobre o pet..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="hero">
                    {editingPet ? "Salvar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Carregando pets...
          </div>
        ) : !pets || pets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pet cadastrado</h3>
              <p className="text-muted-foreground text-center mb-6">
                Adicione seu primeiro pet para começar a agendar serviços
              </p>
              <Button 
                variant="hero"
                onClick={() => openDialog()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Pet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Card key={pet.id} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      {pet.nome}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(pet)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pet)}
                        disabled={deletePet.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Espécie:</span>
                      <br />
                      {pet.especie}
                    </div>
                    <div>
                      <span className="font-medium">Sexo:</span>
                      <br />
                      {pet.sexo}
                    </div>
                    <div>
                      <span className="font-medium">Idade:</span>
                      <br />
                      {calcularIdade(pet.dataNascimento)} {calcularIdade(pet.dataNascimento) === 1 ? 'ano' : 'anos'}
                    </div>
                    <div>
                      <span className="font-medium">Peso:</span>
                      <br />
                      {pet.peso || 0} kg
                    </div>
                  </div>
                  
                  {pet.raca && (
                    <div className="text-sm">
                      <span className="font-medium">Raça:</span> {pet.raca}
                    </div>
                  )}
                  
                  {pet.porte && (
                    <div className="text-sm">
                      <span className="font-medium">Porte:</span> {pet.porte}
                    </div>
                  )}
                  
                  {pet.cor && (
                    <div className="text-sm">
                      <span className="font-medium">Cor:</span> {pet.cor}
                    </div>
                  )}
                  
                  {pet.observacoes && (
                    <div className="text-sm">
                      <span className="font-medium">Observações:</span>
                      <p className="mt-1 text-muted-foreground">{pet.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MeusPets;