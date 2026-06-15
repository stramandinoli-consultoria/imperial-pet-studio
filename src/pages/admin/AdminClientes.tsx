import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCw, Users, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi, AdminCliente } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function AdminClientes() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isAdmin) navigate("/");
  }, [user, isAdmin, navigate]);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["admin-clientes", buscaAtiva],
    queryFn: () => adminApi.getClientes(buscaAtiva || undefined),
    enabled: !!user && isAdmin,
  });

  const liberarMutation = useMutation({
    mutationFn: (id: number) => adminApi.liberarRoleta(id),
    onSuccess: (_, id) => {
      const c = clientes.find((x) => x.id === id);
      toast({ title: `Roleta liberada para ${c?.nome ?? "cliente"}!` });
      queryClient.invalidateQueries({ queryKey: ["admin-clientes"] });
    },
    onError: (err) =>
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro",
        variant: "destructive",
      }),
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setBuscaAtiva(busca);
  };

  const mesAtual = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <AdminLayout title="Clientes">
      <div className="space-y-4">
        {/* Busca */}
        <form onSubmit={handleBuscar} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {buscaAtiva && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setBusca("");
                setBuscaAtiva("");
              }}
            >
              Limpar
            </Button>
          )}
        </form>

        {/* Info mês */}
        <p className="text-xs text-muted-foreground">
          Situação da roleta em: <span className="font-medium capitalize">{mesAtual}</span>
        </p>

        {/* Lista */}
        <div className="bg-background rounded-lg border divide-y">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-8 w-28" />
              </div>
            ))}

          {!isLoading && clientes.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
              <Users className="h-10 w-10 opacity-30" />
              <p className="text-sm">
                {buscaAtiva ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado."}
              </p>
            </div>
          )}

          {clientes.map((c: AdminCliente) => (
            <div key={c.id} className="flex items-center gap-4 p-4">
              {/* Avatar inicial */}
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {c.nome.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{c.nome}</span>
                  {!c.ativo && (
                    <Badge variant="secondary" className="text-xs">Inativo</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                {c.telefone && (
                  <p className="text-xs text-muted-foreground">{c.telefone}</p>
                )}
              </div>

              {/* Status roleta */}
              <div className="shrink-0 hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground">
                {c.sorteiosMes > 0 ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                    Girou este mês
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Não girou ainda
                  </span>
                )}
                {c.liberacaoAtiva && (
                  <span className="text-blue-600 font-medium">+1 liberação ativa</span>
                )}
              </div>

              {/* Botão liberar */}
              <Button
                size="sm"
                variant={c.sorteiosMes > 0 ? "default" : "outline"}
                disabled={liberarMutation.isPending || c.liberacaoAtiva}
                onClick={() => liberarMutation.mutate(c.id)}
                className="shrink-0 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {c.liberacaoAtiva ? "Liberado" : "Liberar Roleta"}
              </Button>
            </div>
          ))}
        </div>

        {!isLoading && clientes.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} encontrado{clientes.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
