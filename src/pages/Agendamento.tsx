import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, User, Heart } from "lucide-react";

interface Appointment {
  id: string;
  userId: string;
  service: string;
  petName: string;
  petType: string;
  petSize: string;
  date: string;
  time: string;
  notes: string;
  status: "agendado" | "confirmado" | "concluido" | "cancelado";
  createdAt: string;
}

const Agendamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    service: "",
    petName: "",
    petType: "",
    petSize: "",
    date: "",
    time: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Carregar agendamentos do usuário
  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem("imperial_pet_appointments") || "[]");
    const userAppointments = savedAppointments.filter((apt: Appointment) => apt.userId === user.id);
    setAppointments(userAppointments);
  }, [user.id]);

  const services = [
    { value: "banho-premium", label: "Banho Premium", price: 60 },
    { value: "tosa-tesoura", label: "Tosa na Tesoura", price: 90 },
    { value: "higiene-completa", label: "Higiene Completa", price: 45 },
    { value: "banho-tosa", label: "Banho + Tosa", price: 120 },
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { service, petName, petType, petSize, date, time } = formData;
    
    if (!service || !petName || !petType || !petSize || !date || !time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se a data não é no passado
    const selectedDate = new Date(date);
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

    setIsSubmitting(true);
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      userId: user.id,
      service,
      petName,
      petType,
      petSize,
      date,
      time,
      notes: formData.notes,
      status: "agendado",
      createdAt: new Date().toISOString()
    };

    // Salvar no localStorage (em produção seria uma API)
    const allAppointments = JSON.parse(localStorage.getItem("imperial_pet_appointments") || "[]");
    allAppointments.push(newAppointment);
    localStorage.setItem("imperial_pet_appointments", JSON.stringify(allAppointments));
    
    setAppointments(prev => [newAppointment, ...prev]);
    
    // Limpar formulário
    setFormData({
      service: "",
      petName: "",
      petType: "",
      petSize: "",
      date: "",
      time: "",
      notes: ""
    });
    
    toast({
      title: "Sucesso!",
      description: "Agendamento realizado com sucesso. Entraremos em contato para confirmação.",
    });
    
    setIsSubmitting(false);
  };

  const getServiceLabel = (serviceValue: string) => {
    return services.find(s => s.value === serviceValue)?.label || serviceValue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "text-yellow-600 bg-yellow-100";
      case "confirmado": return "text-blue-600 bg-blue-100";
      case "concluido": return "text-green-600 bg-green-100";
      case "cancelado": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Agendamento | Imperial Pet Studio</title>
        <meta name="description" content="Agende serviços para seu pet na Imperial Pet Studio." />
      </Helmet>

      <div className="container py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Área de Agendamento</h1>
          <p className="text-muted-foreground mt-2">
            Olá, {user.name}! Agende serviços para seu pet.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="service">Serviço *</Label>
                  <Select value={formData.service} onValueChange={(value) => handleChange("service", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label} - R$ {service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="petName">Nome do Pet *</Label>
                    <Input
                      id="petName"
                      placeholder="Nome do seu pet"
                      value={formData.petName}
                      onChange={(e) => handleChange("petName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="petType">Tipo *</Label>
                    <Select value={formData.petType} onValueChange={(value) => handleChange("petType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cão ou Gato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cao">Cão</SelectItem>
                        <SelectItem value="gato">Gato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petSize">Porte *</Label>
                  <Select value={formData.petSize} onValueChange={(value) => handleChange("petSize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno (até 10kg)</SelectItem>
                      <SelectItem value="medio">Médio (10-25kg)</SelectItem>
                      <SelectItem value="grande">Grande (25-40kg)</SelectItem>
                      <SelectItem value="gigante">Gigante (acima de 40kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Select value={formData.time} onValueChange={(value) => handleChange("time", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informações adicionais sobre seu pet (temperamento, cuidados especiais, etc.)"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="hero"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Agendando..." : "Agendar Serviço"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Seus Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Você ainda não tem agendamentos.
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{getServiceLabel(appointment.service)}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            {appointment.petName} ({appointment.petType === "cao" ? "Cão" : "Gato"})
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                        </div>
                        <div>Porte: {appointment.petSize}</div>
                        {appointment.notes && (
                          <div className="mt-2">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Agendamento;