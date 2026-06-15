import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, AlertCircle, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi, AdminAgendamento } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  Agendado: "bg-blue-100 text-blue-800",
  Confirmado: "bg-green-100 text-green-800",
  EmAndamento: "bg-yellow-100 text-yellow-800",
  Concluido: "bg-emerald-100 text-emerald-800",
  Cancelado: "bg-red-100 text-red-800",
  Falta: "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<string, string> = {
  Agendado: "Agendado",
  Confirmado: "Confirmado",
  EmAndamento: "Em Andamento",
  Concluido: "Concluído",
  Cancelado: "Cancelado",
  Falta: "Falta",
};

export default function AdminAgendamentos() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isAdmin) navigate("/");
  }, [user, isAdmin, navigate]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-agendamentos", filtroStatus],
    queryFn: () =>
      adminApi.getAgendamentos({
        status: filtroStatus === "todos" ? undefined : filtroStatus,
        pagina: 1,
      }),
    enabled: !!user && isAdmin,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateAgendamentoStatus(id, status),
    onSuccess: (_, vars) => {
      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${STATUS_LABELS[vars.status] ?? vars.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-agendamentos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const agendamentos: AdminAgendamento[] = (data?.items ?? []).filter((a) => {
    if (!busca) return true;
    const b = busca.toLowerCase();
    return (
      a.nomeCliente.toLowerCase().includes(b) ||
      a.nomePet.toLowerCase().includes(b) ||
      a.telefoneCliente.includes(b)
    );
  });

  return (
    <AdminLayout title="Agendamentos">
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por cliente, pet ou telefone..."
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabela */}
        <div className="bg-background rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Pet</TableHead>
                <TableHead className="hidden lg:table-cell">Serviços</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && agendamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
              {agendamentos.map((ag) => (
                <TableRow key={ag.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(ag.dataHora), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{ag.nomeCliente}</div>
                    <div className="text-xs text-muted-foreground">{ag.telefoneCliente}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{ag.nomePet}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {ag.servicos.map((s) => s.nome).join(", ")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ag.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {STATUS_LABELS[ag.status] ?? ag.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-sm">
                    R$ {ag.valorTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ag.status !== "Concluido" && ag.status !== "Cancelado" && ag.status !== "Falta" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Concluído"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: ag.id, status: "Concluido" })}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            title="Falta"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: ag.id, status: "Falta" })}
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Cancelar"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: ag.id, status: "Cancelado" })}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data && (
          <p className="text-xs text-muted-foreground text-right">
            {agendamentos.length} de {data.total} agendamentos
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
