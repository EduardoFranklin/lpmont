import { useState, useEffect } from "react";
import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Users, CalendarCheck, UserCheck, TrendingUp, Globe, Megaphone, Target,
  Snowflake, Flame, Zap, X, ArrowDownWideNarrow, ArrowUpWideNarrow, DollarSign, Trophy,
  CreditCard, ShoppingCart, BookOpen, Brain
} from "lucide-react";

const statusLabels: Record<string, string> = {
  novo: "Novos",
  agendado: "Agendados",
  compareceu: "Em negociação",
  nao_compareceu: "Não compareceram",
  convertido: "Convertidos",
  perdido: "Perdidos",
};

type Filter = {
  type: "status" | "temperature" | "source" | "campaign" | "medium" | "career" | "uf" | "city";
  value: string;
  label: string;
};

const DashReports = ({ leads }: { leads: Lead[] }) => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showCity, setShowCity] = useState(true);
  const [locationSortAsc, setLocationSortAsc] = useState(false);
  const [leadTags, setLeadTags] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadTags = async () => {
      const { data } = await supabase.from("lead_tags").select("lead_id, tag");
      if (data) {
        const map: Record<string, string[]> = {};
        data.forEach((t: any) => {
          if (!map[t.lead_id]) map[t.lead_id] = [];
          map[t.lead_id].push(t.tag);
        });
        setLeadTags(map);
      }
    };
    loadTags();
  }, [leads]);

  const toggleFilter = (f: Filter) => {
    setFilters((prev) => {
      const exists = prev.find((p) => p.type === f.type && p.value === f.value);
      if (exists) return prev.filter((p) => !(p.type === f.type && p.value === f.value));
      // Replace same type filter (single select per dimension)
      return [...prev.filter((p) => p.type !== f.type), f];
    });
  };

  const isActive = (type: string, value: string) =>
    filters.some((f) => f.type === type && f.value === value);

  // Apply filters
  const filtered = leads.filter((l) => {
    return filters.every((f) => {
      switch (f.type) {
        case "status": return l.status === f.value;
        case "temperature": return (l as any).temperature === f.value;
        case "source": return ((l as any).utm_source || "Orgânico / Direto") === f.value;
        case "campaign": return (l as any).utm_campaign === f.value;
        case "medium": return (l as any).utm_medium === f.value;
        case "career": return l.career === f.value;
        case "uf": return l.uf === f.value;
        case "city": return l.city === f.value;
        default: return true;
      }
    });
  });

  const total = filtered.length;
  const agendados = filtered.filter((l) => l.status !== "novo").length;
  const compareceram = filtered.filter((l) => ["compareceu", "convertido"].includes(l.status)).length;
  const convertidos = filtered.filter((l) => l.status === "convertido").length;
  const totalRevenue = filtered.reduce((sum, l) => sum + (l.revenue || 0), 0);

  const taxaAgendamento = total > 0 ? ((agendados / total) * 100).toFixed(1) : "0";
  const taxaComparecimento = agendados > 0 ? ((compareceram / agendados) * 100).toFixed(1) : "0";
  const taxaConversao = compareceram > 0 ? ((convertidos / compareceram) * 100).toFixed(1) : "0";

  const metrics = [
    { label: "Total de Leads", value: total, icon: Users, color: "text-blue-400" },
    { label: "Agendamentos", value: `${agendados} (${taxaAgendamento}%)`, icon: CalendarCheck, color: "text-amber-400" },
    { label: "Comparecimento", value: `${compareceram} (${taxaComparecimento}%)`, icon: UserCheck, color: "text-emerald-400" },
    { label: "Conversões", value: `${convertidos} (${taxaConversao}%)`, icon: TrendingUp, color: "text-primary" },
  ];

  // Temperature rank
  const tempData = [
    { value: "quente", label: "Quente", icon: Zap, color: "bg-red-500/20 text-red-400 border-red-500/30", count: filtered.filter((l) => (l as any).temperature === "quente").length },
    { value: "morno", label: "Morno", icon: Flame, color: "bg-amber-500/20 text-amber-400 border-amber-500/30", count: filtered.filter((l) => (l as any).temperature === "morno").length },
    { value: "frio", label: "Frio", icon: Snowflake, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", count: filtered.filter((l) => (l as any).temperature === "frio" || !(l as any).temperature).length },
  ];

  const byStatus = Object.entries(statusLabels).map(([key, label]) => ({
    key,
    label,
    count: filtered.filter((l) => l.status === key).length,
  }));

  const byCareer: Record<string, number> = {};
  filtered.forEach((l) => { byCareer[l.career] = (byCareer[l.career] || 0) + 1; });
  const sortedCareers = Object.entries(byCareer).sort((a, b) => b[1] - a[1]);

  const byUf: Record<string, number> = {};
  filtered.forEach((l) => { byUf[l.uf] = (byUf[l.uf] || 0) + 1; });
  const topUfs = Object.entries(byUf)
    .sort((a, b) => locationSortAsc ? a[1] - b[1] : b[1] - a[1])
    .slice(0, 10);

  const byCity: Record<string, number> = {};
  filtered.forEach((l) => { byCity[l.city] = (byCity[l.city] || 0) + 1; });
  const topCities = Object.entries(byCity)
    .sort((a, b) => locationSortAsc ? a[1] - b[1] : b[1] - a[1])
    .slice(0, 10);

  const bySource: Record<string, { total: number; convertidos: number }> = {};
  const byCampaign: Record<string, { total: number; convertidos: number }> = {};
  const byMedium: Record<string, { total: number; convertidos: number }> = {};

  filtered.forEach((l) => {
    const src = (l as any).utm_source || "Orgânico / Direto";
    const camp = (l as any).utm_campaign;
    const med = (l as any).utm_medium;
    const isConv = l.status === "convertido";

    if (!bySource[src]) bySource[src] = { total: 0, convertidos: 0 };
    bySource[src].total++;
    if (isConv) bySource[src].convertidos++;

    if (camp) {
      if (!byCampaign[camp]) byCampaign[camp] = { total: 0, convertidos: 0 };
      byCampaign[camp].total++;
      if (isConv) byCampaign[camp].convertidos++;
    }

    if (med) {
      if (!byMedium[med]) byMedium[med] = { total: 0, convertidos: 0 };
      byMedium[med].total++;
      if (isConv) byMedium[med].convertidos++;
    }
  });

  const sortedSources = Object.entries(bySource).sort((a, b) => b[1].total - a[1].total);
  const sortedCampaigns = Object.entries(byCampaign).sort((a, b) => b[1].total - a[1].total);
  const sortedMediums = Object.entries(byMedium).sort((a, b) => b[1].total - a[1].total);

  const clickable = "cursor-pointer hover:bg-muted/50 rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors";
  const activeRow = "bg-primary/10 rounded-md px-1.5 py-0.5 -mx-1.5 ring-1 ring-primary/20";

  return (
    <div className="space-y-6">
      {/* Active filters bar */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtros:</span>
          {filters.map((f) => (
            <Badge
              key={`${f.type}-${f.value}`}
              variant="outline"
              className="gap-1 cursor-pointer bg-primary/10 border-primary/30 text-primary"
              onClick={() => toggleFilter(f)}
            >
              {f.label}
              <X className="w-3 h-3" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => setFilters([])}>
            Limpar todos
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${m.color}`} />
                  {m.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial KPI */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">
              Faturamento no período: <strong>R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Ticket médio: R$ {convertidos > 0 ? (totalRevenue / convertidos).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Hotmart Payment & Quiz Analytics */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Hotmart Tags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Status de Pagamento (Hotmart)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(() => {
              const tagCounts: Record<string, number> = {};
              const hotmartTags = ["pagou", "abandonou_checkout", "boleto_impresso", "compra_expirada", "entrou_no_curso", "modulo_concluido"];
              const tagLabels: Record<string, string> = {
                pagou: "✅ Pagou",
                abandonou_checkout: "🛒 Abandonou Checkout",
                boleto_impresso: "🧾 Boleto Impresso",
                compra_expirada: "⏰ Compra Expirada",
                entrou_no_curso: "📚 Entrou no Curso",
                modulo_concluido: "🎓 Módulo Concluído",
              };
              filtered.forEach((l) => {
                const tags = leadTags[l.id] || [];
                tags.forEach((t) => {
                  if (hotmartTags.includes(t)) {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                  }
                });
              });
              const entries = hotmartTags.filter((t) => tagCounts[t]).map((t) => ({ tag: t, label: tagLabels[t], count: tagCounts[t] }));
              if (entries.length === 0) return <p className="text-sm text-muted-foreground">Sem dados de pagamento</p>;
              return entries.map((e) => (
                <div key={e.tag} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span className="font-medium">{e.count}</span>
                </div>
              ));
            })()}
          </CardContent>
        </Card>

        {/* Quiz Analytics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> Quiz / Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(() => {
              const quizLeads = filtered.filter((l) => l.quiz_slug);
              const withScore = quizLeads.filter((l) => l.quiz_score != null);
              const avgScore = withScore.length > 0 ? Math.round(withScore.reduce((s, l) => s + (l.quiz_score || 0), 0) / withScore.length) : 0;
              const bySlug: Record<string, number> = {};
              quizLeads.forEach((l) => { if (l.quiz_slug) bySlug[l.quiz_slug] = (bySlug[l.quiz_slug] || 0) + 1; });
              return (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leads do Quiz</span>
                    <span className="font-medium">{quizLeads.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completaram</span>
                    <span className="font-medium">{withScore.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nota média</span>
                    <span className="font-medium">{avgScore} pts</span>
                  </div>
                  {Object.entries(bySlug).sort((a, b) => b[1] - a[1]).map(([slug, count]) => (
                    <div key={slug} className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-mono text-xs">/quiz/{slug}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {quizLeads.length === 0 && <p className="text-sm text-muted-foreground">Sem leads do quiz</p>}
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Temperature rank */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Ranking de Temperatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {tempData.map((t) => {
              const Icon = t.icon;
              const active = isActive("temperature", t.value);
              return (
                <button
                  key={t.value}
                  onClick={() => toggleFilter({ type: "temperature", value: t.value, label: `Temp: ${t.label}` })}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                    active ? "ring-2 ring-primary/40 " + t.color : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${active ? "" : "text-muted-foreground"}`} />
                  <span className="text-xs font-medium text-muted-foreground">{t.label}</span>
                  <span className="text-2xl font-bold">{t.count}</span>
                  {total > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {((t.count / total) * 100).toFixed(0)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Origin reports */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Por Origem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedSources.map(([src, data]) => {
              const rate = data.total > 0 ? ((data.convertidos / data.total) * 100).toFixed(0) : "0";
              const active = isActive("source", src);
              return (
                <div
                  key={src}
                  className={`flex items-center justify-between text-sm ${active ? activeRow : clickable}`}
                  onClick={() => toggleFilter({ type: "source", value: src, label: `Origem: ${src}` })}
                >
                  <span className="text-muted-foreground truncate max-w-[140px]">{src}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.total}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {data.convertidos} conv. ({rate}%)
                    </Badge>
                  </div>
                </div>
              );
            })}
            {sortedSources.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" /> Por Campanha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedCampaigns.map(([camp, data]) => {
              const rate = data.total > 0 ? ((data.convertidos / data.total) * 100).toFixed(0) : "0";
              const active = isActive("campaign", camp);
              return (
                <div
                  key={camp}
                  className={`flex items-center justify-between text-sm ${active ? activeRow : clickable}`}
                  onClick={() => toggleFilter({ type: "campaign", value: camp, label: `Campanha: ${camp}` })}
                >
                  <span className="text-muted-foreground truncate max-w-[140px]">{camp}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.total}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {data.convertidos} conv. ({rate}%)
                    </Badge>
                  </div>
                </div>
              );
            })}
            {sortedCampaigns.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma campanha rastreada</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Por Mídia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedMediums.map(([med, data]) => {
              const rate = data.total > 0 ? ((data.convertidos / data.total) * 100).toFixed(0) : "0";
              const active = isActive("medium", med);
              return (
                <div
                  key={med}
                  className={`flex items-center justify-between text-sm ${active ? activeRow : clickable}`}
                  onClick={() => toggleFilter({ type: "medium", value: med, label: `Mídia: ${med}` })}
                >
                  <span className="text-muted-foreground truncate max-w-[140px]">{med}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.total}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {data.convertidos} conv. ({rate}%)
                    </Badge>
                  </div>
                </div>
              );
            })}
            {sortedMediums.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma mídia rastreada</p>}
          </CardContent>
        </Card>
      </div>

      {/* Status, Career, UF */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Por Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map((s) => {
              const active = isActive("status", s.key);
              return (
                <div
                  key={s.key}
                  className={`flex justify-between text-sm ${active ? activeRow : clickable}`}
                  onClick={() => toggleFilter({ type: "status", value: s.key, label: `Status: ${s.label}` })}
                >
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Por Carreira</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sortedCareers.map(([k, v]) => {
              const active = isActive("career", k);
              return (
                <div
                  key={k}
                  className={`flex justify-between text-sm ${active ? activeRow : clickable}`}
                  onClick={() => toggleFilter({ type: "career", value: k, label: `Carreira: ${k}` })}
                >
                  <span className="text-muted-foreground capitalize">{k.replace("_", " ")}</span>
                  <span className="font-medium">{v}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Top {showCity ? "Cidades" : "UFs"}</CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocationSortAsc(!locationSortAsc)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                  title={locationSortAsc ? "Menor → Maior" : "Maior → Menor"}
                >
                  {locationSortAsc ? <ArrowUpWideNarrow className="w-4 h-4" /> : <ArrowDownWideNarrow className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={!showCity ? "text-foreground font-medium" : ""}>UF</span>
                  <Switch checked={showCity} onCheckedChange={setShowCity} className="scale-75" />
                  <span className={showCity ? "text-foreground font-medium" : ""}>Cidade</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {showCity ? (
              <>
                {topCities.map(([city, count]) => {
                  const active = isActive("city", city);
                  return (
                    <div
                      key={city}
                      className={`flex justify-between text-sm ${active ? activeRow : clickable}`}
                      onClick={() => toggleFilter({ type: "city", value: city, label: `Cidade: ${city}` })}
                    >
                      <span className="text-muted-foreground">{city}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
                {topCities.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
              </>
            ) : (
              <>
                {topUfs.map(([uf, count]) => {
                  const active = isActive("uf", uf);
                  return (
                    <div
                      key={uf}
                      className={`flex justify-between text-sm ${active ? activeRow : clickable}`}
                      onClick={() => toggleFilter({ type: "uf", value: uf, label: `UF: ${uf}` })}
                    >
                      <span className="text-muted-foreground">{uf}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
                {topUfs.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashReports;
