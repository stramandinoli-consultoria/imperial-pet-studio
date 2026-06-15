import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Navigate, Link } from "react-router-dom";
import { Dice5, Trophy, Clock, ChevronRight, Lock } from "lucide-react";
import { roletaApi, RoletaInfo, SorteioResultado, RoletaStatus } from "@/lib/api";

// ─── Roleta Canvas ────────────────────────────────────────────────────────────

const CORES_PADRAO = [
  "#3B82F6", "#1E40AF", "#F59E0B", "#10B981",
  "#8B5CF6", "#EF4444", "#06B6D4", "#F97316",
];

interface SpinWheelProps {
  premios: RoletaInfo["premios"];
  spinning: boolean;
  anguloFinal: number | null;
  onAnimationEnd: () => void;
}

function SpinWheel({ premios, spinning, anguloFinal, onAnimationEnd }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const currentAngleRef = useRef(0);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || premios.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 10;
    const n = premios.length;
    const arc = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sombra externa
    ctx.save();
    ctx.shadowColor = "rgba(59,130,246,0.35)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#1E40AF";
    ctx.fill();
    ctx.restore();

    // Fatias
    premios.forEach((premio, i) => {
      const startAngle = angle + i * arc - Math.PI / 2;
      const endAngle = startAngle + arc;
      const cor = premio.cor || CORES_PADRAO[i % CORES_PADRAO.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = `bold ${Math.max(9, Math.min(13, 280 / n))}px Inter,sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 3;
      const maxLen = 15;
      const txt = premio.nome.length > maxLen ? premio.nome.substring(0, maxLen) + "…" : premio.nome;
      ctx.fillText(txt, r - 12, 4);
      ctx.restore();
    });

    // Borda
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "#1E3A8A";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Centro
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    grad.addColorStop(0, "#FFFFFF");
    grad.addColorStop(1, "#BFDBFE");
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#1E40AF";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐾", cx, cy);
  }, [premios]);

  useEffect(() => { drawWheel(currentAngleRef.current); }, [drawWheel]);

  useEffect(() => {
    if (!spinning || anguloFinal === null) return;
    const startAngle = currentAngleRef.current;
    const targetAngle = (anguloFinal * Math.PI) / 180;
    const totalRotation = targetAngle - startAngle + 2 * Math.PI * 5; // 5 voltas extra
    const duration = 6000;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + totalRotation * eased;
      currentAngleRef.current = current;
      drawWheel(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onAnimationEnd();
      }
    }
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [spinning, anguloFinal, drawWheel, onAnimationEnd]);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Seta */}
      <div className="absolute z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <div style={{
          width: 0, height: 0,
          borderLeft: "18px solid transparent",
          borderRight: "18px solid transparent",
          borderTop: "44px solid #1E40AF",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,.3))",
        }} />
      </div>
      <canvas ref={canvasRef} width={440} height={440} className="rounded-full max-w-full" />
    </div>
  );
}

// ─── Banner resultado ─────────────────────────────────────────────────────────

function ResultBanner({ resultado, onClose }: { resultado: SorteioResultado; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl text-center max-w-sm w-full overflow-hidden border border-border"
        onClick={e => e.stopPropagation()}>
        <div className={`py-8 px-6 ${resultado.ganhou
          ? "bg-gradient-to-br from-blue-600 to-blue-800"
          : "bg-gradient-to-br from-gray-600 to-gray-800"}`}>
          <div className="text-6xl mb-3">{resultado.ganhou ? "🎉" : "😔"}</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {resultado.ganhou ? "Parabéns!" : "Não foi dessa vez!"}
          </h2>
          <p className="text-blue-100 text-sm">
            {resultado.ganhou ? "Você ganhou um prêmio especial!" : "Tente novamente na próxima visita"}
          </p>
        </div>
        <div className="p-6">
          {resultado.ganhou && (
            <div className="text-xl font-bold text-foreground mb-2">{resultado.nomePremio}</div>
          )}
          {resultado.descricaoPremio && (
            <p className="text-muted-foreground text-sm mb-3">{resultado.descricaoPremio}</p>
          )}
          <p className="text-xs text-muted-foreground mb-4">
            {resultado.ganhou
              ? "Apresente este resultado no balcão para resgatar seu prêmio!"
              : "Volte na próxima visita para tentar novamente!"}
          </p>
          <Button className="w-full" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const Roleta = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roleta, setRoleta] = useState<RoletaInfo | null>(null);
  const [historico, setHistorico] = useState<SorteioResultado[]>([]);
  const [roletaStatus, setRoletaStatus] = useState<RoletaStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [anguloFinal, setAnguloFinal] = useState<number | null>(null);
  const [resultado, setResultado] = useState<SorteioResultado | null>(null);
  const pendingResultado = useRef<SorteioResultado | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await roletaApi.getAtiva();
        setRoleta(data);
      } catch {
        // roleta inativa ou não existe
      }
      if (user) {
        try {
          const hist = await roletaApi.getHistorico();
          setHistorico(hist);
        } catch { /* sem histórico */ }
        try {
          const status = await roletaApi.getMeuStatus();
          setRoletaStatus(status);
        } catch { /* ignora erro de status */ }
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleSpin = async () => {
    if (spinning || !roleta || roleta.premios.length === 0) return;
    try {
      setSpinning(true);
      const res = await roletaApi.sortear();
      pendingResultado.current = res;

      // Calcular ângulo final apontando para o prêmio sorteado
      const premioIndex = roleta.premios.findIndex(p => p.id === res.premioId);
      const n = roleta.premios.length;
      const arc = 360 / n;
      const angulo = 360 * 5 + (premioIndex >= 0 ? (premioIndex * arc + arc / 2) : 0);
      setAnguloFinal(angulo);
    } catch (err) {
      setSpinning(false);
      toast({
        title: "Não foi possível girar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleAnimationEnd = useCallback(() => {
    setSpinning(false);
    const res = pendingResultado.current;
    pendingResultado.current = null;
    if (res) {
      setResultado(res);
      setHistorico(prev => [res, ...prev].slice(0, 10));
      // Refresh server status so button state reflects the new spin
      roletaApi.getMeuStatus().then(setRoletaStatus).catch(() => {});
    }
  }, []);

  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>Roleta da Sorte | Imperial Pet Studio</title>
        </Helmet>
        <div className="container py-24 flex flex-col items-center gap-6 text-center">
          <Lock className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Roleta da Sorte</h1>
          <p className="text-muted-foreground max-w-md">
            Faça login para participar da nossa Roleta da Sorte e ganhar prêmios incríveis!
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/login">Entrar para jogar</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Roleta da Sorte | Imperial Pet Studio</title>
        <meta name="description" content="Gire a roleta e ganhe prêmios exclusivos!" />
      </Helmet>

      {resultado && (
        <ResultBanner resultado={resultado} onClose={() => setResultado(null)} />
      )}

      <div className="container py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Dice5 className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Roleta da Sorte</h1>
          </div>
          <p className="text-muted-foreground">
            {roleta ? roleta.descricao || "Gire a roleta e ganhe prêmios exclusivos!" : "Carregando..."}
          </p>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Carregando roleta...</div>
        ) : !roleta || roleta.premios.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Nenhuma roleta ativa no momento.</p>
            <p className="text-sm text-muted-foreground mt-2">Volte em breve!</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
            {/* Roleta */}
            <div className="flex flex-col items-center gap-6 flex-shrink-0">
              <SpinWheel
                premios={roleta.premios.filter(p => p.ativo)}
                spinning={spinning}
                anguloFinal={anguloFinal}
                onAnimationEnd={handleAnimationEnd}
              />
              <Button
                variant="hero"
                size="lg"
                className="px-10 text-lg"
                onClick={handleSpin}
                disabled={spinning || roletaStatus?.podeGirar === false}
              >
                {spinning ? "Girando..." : "🎠 Girar Roleta!"}
              </Button>
              {roletaStatus?.podeGirar === false ? (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  ⏰ Você já girou este mês. Volte no próximo mês!
                </p>
              ) : roletaStatus?.liberacaoAtiva && roletaStatus.sorteiosMes > 0 ? (
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  🎉 Você tem uma rodada extra liberada pelo administrador!
                </p>
              ) : (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  ✅ Disponível para girar este mês!
                </p>
              )}
            </div>

            {/* Prêmios + Histórico */}
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4" />
                    Prêmios disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roleta.premios.filter(p => p.ativo).map(p => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full flex-shrink-0 border border-border"
                        style={{ backgroundColor: p.cor }} />
                      <span className={`text-sm ${p.ehPerdedor ? "text-muted-foreground" : "font-medium"}`}>
                        {p.nome}
                      </span>
                      {p.ehPerdedor && (
                        <Badge variant="secondary" className="ml-auto text-xs">Sem prêmio</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {historico.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4" />
                      Meus sorteios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {historico.slice(0, 5).map((h, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className={h.ganhou ? "font-medium" : "text-muted-foreground"}>
                            {h.ganhou ? "🎉" : "😔"} {h.nomePremio}
                          </span>
                          {h.ganhou && (
                            h.premioUtilizado ? (
                              <span className="text-xs text-green-600 font-medium">
                                ✅ Utilizado em {new Date(h.dataUtilizacao!).toLocaleDateString("pt-BR")}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 font-medium">
                                ⏳ Prêmio pendente de retirada
                              </span>
                            )
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                          {new Date(h.dataSorteio).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Roleta;
