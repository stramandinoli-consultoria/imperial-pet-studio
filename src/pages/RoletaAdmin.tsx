import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import {
  Settings, Trophy, BarChart3, History, Plus, Pencil, Trash2,
  LogIn, LogOut, Save, Dice5,
} from "lucide-react";
import { roletaAdminApi, RoletaInfo, RoletaPremio } from "@/lib/api";

// ─── Login Admin ──────────────────────────────────────────────────────────────

function AdminLoginForm() {
  const { adminLogin } = useAuth();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await adminLogin(login, senha);
    setLoading(false);
  };

  return (
    <div className="container py-24 flex justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Acesso Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-login">Login</Label>
              <Input
                id="admin-login"
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="Seu login admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-senha">Senha</Label>
              <Input
                id="admin-senha"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Modal de Prêmio ─────────────────────────────────────────────────────────

interface PremioFormProps {
  roletaId: number;
  premio?: RoletaPremio | null;
  onSave: () => void;
  onCancel: () => void;
}

function PremioForm({ roletaId, premio, onSave, onCancel }: PremioFormProps) {
  const { toast } = useToast();
  const [nome, setNome] = useState(premio?.nome ?? "");
  const [descricao, setDescricao] = useState(premio?.descricao ?? "");
  const [cor, setCor] = useState(premio?.cor ?? "#3B82F6");
  const [ehPerdedor, setEhPerdedor] = useState(premio?.ehPerdedor ?? false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    try {
      if (premio) {
        await roletaAdminApi.atualizarPremio(premio.id, { nome, descricao, cor, ehPerdedor });
      } else {
        await roletaAdminApi.criarPremio(roletaId, { nome, descricao, cor, ehPerdedor });
      }
      toast({ title: premio ? "Prêmio atualizado!" : "Prêmio criado!" });
      onSave();
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro ao salvar", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do prêmio</Label>
        <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: 10% de desconto" required />
      </div>
      <div className="space-y-2">
        <Label>Descrição (opcional)</Label>
        <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes do prêmio" />
      </div>
      <div className="space-y-2">
        <Label>Cor da fatia</Label>
        <div className="flex gap-3 items-center">
          <input type="color" value={cor} onChange={e => setCor(e.target.value)}
            className="h-10 w-14 rounded border cursor-pointer" />
          <span className="text-sm text-muted-foreground">{cor}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="eh-perdedor"
          checked={ehPerdedor}
          onChange={e => setEhPerdedor(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="eh-perdedor" className="cursor-pointer">
          Fatia "sem prêmio" (perdedor)
        </Label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

// ─── Aba Prêmios ─────────────────────────────────────────────────────────────

function TabPremios({ roleta, onReload }: { roleta: RoletaInfo; onReload: () => void }) {
  const { toast } = useToast();
  const [premios, setPremios] = useState<RoletaPremio[]>(roleta.premios);
  const [editando, setEditando] = useState<RoletaPremio | null | "novo">(null);

  useEffect(() => {
    roletaAdminApi.listarPremios(roleta.id).then(setPremios).catch(() => {});
  }, [roleta.id]);

  const handleRemover = async (id: number) => {
    if (!confirm("Remover este prêmio?")) return;
    try {
      await roletaAdminApi.removerPremio(id);
      setPremios(prev => prev.filter(p => p.id !== id));
      toast({ title: "Prêmio removido" });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setEditando(null);
    const atualizados = await roletaAdminApi.listarPremios(roleta.id);
    setPremios(atualizados);
    onReload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{premios.length} prêmio(s) cadastrado(s)</p>
        <Button size="sm" onClick={() => setEditando("novo")}>
          <Plus className="h-4 w-4 mr-1" /> Novo prêmio
        </Button>
      </div>

      {editando !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editando === "novo" ? "Novo prêmio" : "Editar prêmio"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PremioForm
              roletaId={roleta.id}
              premio={editando === "novo" ? null : editando}
              onSave={handleSave}
              onCancel={() => setEditando(null)}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {premios.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="h-6 w-6 rounded-full border border-border flex-shrink-0"
              style={{ backgroundColor: p.cor }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.nome}</p>
              {p.descricao && <p className="text-xs text-muted-foreground truncate">{p.descricao}</p>}
            </div>
            <div className="flex items-center gap-2">
              {p.ehPerdedor && <Badge variant="secondary" className="text-xs">Sem prêmio</Badge>}
              {!p.ativo && <Badge variant="destructive" className="text-xs">Inativo</Badge>}
              <Button variant="ghost" size="icon" onClick={() => setEditando(p)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleRemover(p.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Aba Configuração ─────────────────────────────────────────────────────────

function TabConfiguracao({ roleta, onReload }: { roleta: RoletaInfo; onReload: () => void }) {
  const { toast } = useToast();
  const [nome, setNome] = useState(roleta.nome);
  const [descricao, setDescricao] = useState(roleta.descricao ?? "");
  const [status, setStatus] = useState(roleta.status);
  const [sorteiosPorDia, setSorteiosPorDia] = useState(String(roleta.sorteiosPorDia));
  const [loading, setLoading] = useState(false);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await roletaAdminApi.atualizarRoleta(roleta.id, {
        nome,
        descricao: descricao || undefined,
        status,
        sorteiosPorDia: Number(sorteiosPorDia) || 1,
      });
      toast({ title: "Configurações salvas!" });
      onReload();
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-5 max-w-md">
      <div className="space-y-2">
        <Label>Nome da roleta</Label>
        <Input value={nome} onChange={e => setNome(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição exibida aos clientes" />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full h-10 px-3 rounded-md border bg-background text-sm"
        >
          <option value="Ativa">Ativa</option>
          <option value="Pausada">Pausada</option>
          <option value="Encerrada">Encerrada</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Sorteios por dia (por cliente)</Label>
        <Input
          type="number"
          min={1}
          max={10}
          value={sorteiosPorDia}
          onChange={e => setSorteiosPorDia(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        <Save className="h-4 w-4 mr-2" />
        {loading ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}

// ─── Aba Estatísticas ─────────────────────────────────────────────────────────

function TabEstatisticas() {
  const [stats, setStats] = useState<{
    roletaNome: string; totalSorteios: number;
    premios: { premioId: number; nome: string; ehPerdedor: boolean; clientesGanhadores: number; percentualGanhos: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roletaAdminApi.getEstatisticas().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!stats) return <p className="text-muted-foreground">Nenhuma roleta ativa.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Card className="flex-1">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total de sorteios</p>
            <p className="text-3xl font-bold">{stats.totalSorteios}</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Prêmios</p>
            <p className="text-3xl font-bold">{stats.premios.filter(p => !p.ehPerdedor).length}</p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-2">
        {stats.premios.map(p => (
          <div key={p.premioId} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="flex-1">
              <p className="text-sm font-medium">{p.nome}</p>
              <p className="text-xs text-muted-foreground">
                {p.clientesGanhadores} ganhador(es) — {p.percentualGanhos.toFixed(1)}%
              </p>
            </div>
            <div className="w-24 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${Math.min(p.percentualGanhos, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Aba Histórico ─────────────────────────────────────────────────────────────

function TabHistorico() {
  const [data, setData] = useState<{
    total: number;
    sorteios: { id: number; clienteNome: string; clienteEmail: string; premioNome: string; ganhou: boolean; dataSorteio: string }[]
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roletaAdminApi.getHistoricoAdmin(1, 20).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!data || data.sorteios.length === 0) return <p className="text-muted-foreground">Nenhum sorteio registrado.</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Total: {data.total} sorteio(s)</p>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Cliente</th>
              <th className="text-left p-3 font-medium">Prêmio</th>
              <th className="text-left p-3 font-medium">Resultado</th>
              <th className="text-left p-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {data.sorteios.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-3">
                  <p className="font-medium">{s.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">{s.clienteEmail}</p>
                </td>
                <td className="p-3">{s.premioNome}</td>
                <td className="p-3">
                  {s.ganhou
                    ? <Badge className="bg-green-500 text-white">Ganhou</Badge>
                    : <Badge variant="secondary">Sem prêmio</Badge>}
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(s.dataSorteio).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Página Admin ─────────────────────────────────────────────────────────────

const RoletaAdmin = () => {
  const { isAdmin, adminInfo, adminLogout } = useAuth();
  const { toast } = useToast();
  const [roleta, setRoleta] = useState<RoletaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [criandoRoleta, setCriandoRoleta] = useState(false);
  const [novaRoletaNome, setNovaRoletaNome] = useState("Roleta da Sorte");

  const loadRoleta = async () => {
    try {
      const lista = await roletaAdminApi.listarRoletas();
      setRoleta(lista[0] ?? null);
    } catch { /* sem roleta */ }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadRoleta();
    else setLoading(false);
  }, [isAdmin]);

  const handleCriarRoleta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nova = await roletaAdminApi.criarRoleta({ nome: novaRoletaNome, sorteiosPorDia: 1 });
      setRoleta(nova);
      setCriandoRoleta(false);
      toast({ title: "Roleta criada!" });
    } catch (err) {
      toast({ title: "Erro", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <Helmet><title>Admin Roleta | Imperial Pet Studio</title></Helmet>
        <AdminLoginForm />
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet><title>Admin Roleta | Imperial Pet Studio</title></Helmet>

      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Dice5 className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Roleta</h1>
              <p className="text-sm text-muted-foreground">Olá, {adminInfo?.nome} ({adminInfo?.perfil})</p>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : !roleta ? (
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle className="text-base">Nenhuma roleta cadastrada</CardTitle>
            </CardHeader>
            <CardContent>
              {criandoRoleta ? (
                <form onSubmit={handleCriarRoleta} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da roleta</Label>
                    <Input value={novaRoletaNome} onChange={e => setNovaRoletaNome(e.target.value)} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Criar</Button>
                    <Button type="button" variant="outline" onClick={() => setCriandoRoleta(false)}>Cancelar</Button>
                  </div>
                </form>
              ) : (
                <Button onClick={() => setCriandoRoleta(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Criar primeira roleta
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="premios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="premios" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" /> Prêmios
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-1">
                <Settings className="h-4 w-4" /> Configuração
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" /> Estatísticas
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-1">
                <History className="h-4 w-4" /> Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="premios">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Prêmios — {roleta.nome}
                    <Badge variant={roleta.status === "Ativa" ? "default" : "secondary"} className="ml-2">
                      {roleta.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TabPremios roleta={roleta} onReload={loadRoleta} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" /> Configuração da roleta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TabConfiguracao roleta={roleta} onReload={loadRoleta} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TabEstatisticas />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Histórico de sorteios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TabHistorico />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default RoletaAdmin;
