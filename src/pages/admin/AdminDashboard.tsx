import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, CalendarDays, Dices, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  description: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-3xl font-bold">{value ?? 0}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.getDashboard,
    enabled: !!user && isAdmin,
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Bem-vindo, {user?.nome?.split(" ")[0]}!</h2>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do Imperial Pet Studio</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Clientes Cadastrados"
            value={data?.totalClientes}
            icon={Users}
            description="Total ativo"
            loading={isLoading}
          />
          <StatCard
            title="Agendamentos na Semana"
            value={data?.agendamentosSemana}
            icon={CalendarDays}
            description="Esta semana"
            loading={isLoading}
          />
          <StatCard
            title="Giros na Roleta"
            value={data?.girosMes}
            icon={Dices}
            description="Este mês"
            loading={isLoading}
          />
          <StatCard
            title="Atendimentos Concluídos"
            value={data?.agendamentosConcluidosMes}
            icon={CheckCircle}
            description="Este mês"
            loading={isLoading}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
