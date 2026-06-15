import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi, AdminPremio, AdminRoleta } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface PremioForm {
  roletaId: number | null;
  nome: string;
  descricao: string;
  cor: string;
  posicao: number;
  ehPerdedor: boolean;
  ativo: boolean;
}

const FORM_VAZIO: PremioForm = {
  roletaId: null,
  nome: "",
  descricao: "",
  cor: "#3B82F6",
  posicao: 0,
  ehPerdedor: false,
  ativo: true,
};

export default function AdminPremios() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<AdminPremio | null>(null);
  const [form, setForm] = useState<PremioForm>(FORM_VAZIO);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isAdmin) navigate("/");
  }, [user, isAdmin, navigate]);

  const { data: premios = [], isLoading } = useQuery({
    queryKey: ["admin-premios"],
    queryFn: adminApi.getPremios,
    enabled: !!user && isAdmin,
  });

  const { data: roletas = [] } = useQuery({
    queryKey: ["admin-roletas"],
    queryFn: adminApi.getRoletas,
    enabled: !!user && isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createPremio,
    onSuccess: () => {
      toast({ title: "Prêmio criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["admin-premios"] });
      setDialogOpen(false);
    },
    onError: (err) => toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PremioForm }) => adminApi.updatePremio(id, data),
    onSuccess: () => {
      toast({ title: "Prêmio atualizado!" });
      queryClient.invalidateQueries({ queryKey: ["admin-premios"] });
      setDialogOpen(false);
    },
    onError: (err) => toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deletePremio,
    onSuccess: () => {
      toast({ title: "Prêmio removido." });
      queryClient.invalidateQueries({ queryKey: ["admin-premios"] });
      setDeleteId(null);
    },
    onError: (err) => toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" }),
  });

  const abrirNovo = () => {
    setEditando(null);
    // Pré-selecionar a primeira roleta disponível
    setForm({ ...FORM_VAZIO, roletaId: roletas[0]?.id ?? null });
    setDialogOpen(true);
  };

  const abrirEditar = (p: AdminPremio) => {
    setEditando(p);
    setForm({
      roletaId: p.roletaId,
      nome: p.nome,
      descricao: p.descricao ?? "",
      cor: p.cor,
      posicao: p.posicao,
      ehPerdedor: p.ehPerdedor,
      ativo: p.ativo,
    });
    setDialogOpen(true);
  };

  const salvar = () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    if (!form.roletaId && !editando) {
      toast({ title: "Selecione uma roleta", variant: "destructive" });
      return;
    }
    if (editando) {
      updateMutation.mutate({ id: editando.id, data: form });
    } else {
      createMutation.mutate({ ...form, roletaId: form.roletaId ?? undefined });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Gerenciar Prêmios">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={abrirNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Prêmio
          </Button>
        </div>

        {/* Lista */}
        <div className="bg-background rounded-lg border divide-y">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}

          {!isLoading && premios.length === 0 && (
            <p className="text-center py-10 text-muted-foreground text-sm">
              Nenhum prêmio cadastrado. Clique em "Novo Prêmio" para começar.
            </p>
          )}

          {premios.map((p) => (
            <div key={p.id} className={`flex items-center gap-3 p-4 ${!p.ativo ? "opacity-50" : ""}`}>
              <span
                className="w-8 h-8 rounded-full border shrink-0"
                style={{ backgroundColor: p.cor }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{p.nome}</span>
                  {p.ehPerdedor && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      Perdedor
                    </span>
                  )}
                  {!p.ativo && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      Inativo
                    </span>
                  )}
                </div>
                {p.descricao && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.descricao}</p>
                )}
              </div>
              <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                {p.clientesGanhadores} ganhadores · pos. {p.posicao}
                {p.nomeRoleta && <span className="ml-1">· {p.nomeRoleta}</span>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => abrirEditar(p)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Prêmio" : "Novo Prêmio"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editando && (
              <div className="space-y-1.5">
                <Label htmlFor="roleta">Roleta *</Label>
                <Select
                  value={form.roletaId ? String(form.roletaId) : ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, roletaId: Number(v) }))}
                >
                  <SelectTrigger id="roleta">
                    <SelectValue placeholder="Selecione a roleta" />
                  </SelectTrigger>
                  <SelectContent>
                    {roletas.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.nome}
                      </SelectItem>
                    ))}
                    {roletas.length === 0 && (
                      <SelectItem value="" disabled>
                        Nenhuma roleta ativa
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: 10% Off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Desconto de 10% na próxima compra"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cor">Cor</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="cor"
                    value={form.cor}
                    onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                    className="h-9 w-14 rounded border cursor-pointer p-0.5"
                  />
                  <Input
                    value={form.cor}
                    onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                    className="font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="posicao">Posição</Label>
                <Input
                  id="posicao"
                  type="number"
                  min={0}
                  value={form.posicao}
                  onChange={(e) => setForm((f) => ({ ...f, posicao: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="perdedor" className="text-sm">É prêmio perdedor?</Label>
                <p className="text-xs text-muted-foreground">Marca que não ganhou prêmio</p>
              </div>
              <Switch
                id="perdedor"
                checked={form.ehPerdedor}
                onCheckedChange={(v) => setForm((f) => ({ ...f, ehPerdedor: v }))}
              />
            </div>
            {editando && (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ativo" className="text-sm">Ativo</Label>
                  <p className="text-xs text-muted-foreground">Aparecer na roleta</p>
                </div>
                <Switch
                  id="ativo"
                  checked={form.ativo}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover prêmio?</AlertDialogTitle>
            <AlertDialogDescription>
              O prêmio será marcado como inativo e não aparecerá mais na roleta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
