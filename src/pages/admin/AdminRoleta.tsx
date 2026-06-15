import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi, AdminSorteio } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AdminRoleta() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isAdmin) navigate("/");
  }, [user, isAdmin, navigate]);

  const { data: sorteios = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-sorteios", mes, ano],
    queryFn: () => adminApi.getSorteiosMes(mes, ano),
    enabled: !!user && isAdmin,
  });

  const mutation = useMutation({
    mutationFn: (id: number) => adminApi.marcarPremioUtilizado(id),
    onSuccess: () => {
      toast({ title: "Prêmio marcado como utilizado" });
      queryClient.invalidateQueries({ queryKey: ["admin-sorteios"] });
    },
    onError: (err) => {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const navMes = (delta: number) => {
    let m = mes + delta;
    let a = ano;
    if (m < 1) { m = 12; a -= 1; }
    if (m > 12) { m = 1; a += 1; }
    setMes(m);
    setAno(a);
  };

  const mesNome = format(new Date(ano, mes - 1, 1), "MMMM yyyy", { locale: ptBR });

  const pendentes = sorteios.filter((s) => !s.premioUtilizado).length;
  const utilizados = sorteios.filter((s) => s.premioUtilizado).length;

  return (
    <AdminLayout title="Roleta — Prêmios do Mês">
      <div className="space-y-4">
        {/* Navegação de mês */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navMes(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize w-36 text-center">{mesNome}</span>
            <Button variant="outline" size="icon" onClick={() => navMes(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {pendentes} pendentes · {utilizados} utilizados
            </span>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-background rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead>Prêmio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Utilizado em</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && sorteios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Nenhum prêmio ganho neste mês.
                  </TableCell>
                </TableRow>
              )}
              {sorteios.map((s) => (
                <TableRow key={s.id} className={s.premioUtilizado ? "opacity-60" : ""}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(s.dataSorteio), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{s.nomeCliente}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {s.telefoneCliente}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.corPremio }}
                      />
                      <span className="text-sm">{s.nomePremio}</span>
                    </div>
                    {s.descricaoPremio && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.descricaoPremio}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.premioUtilizado ? (
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Utilizado
                      </span>
                    ) : (
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {s.dataUtilizacao
                      ? format(new Date(s.dataUtilizacao), "dd/MM/yy HH:mm", { locale: ptBR })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!s.premioUtilizado && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate(s.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Utilizado
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
