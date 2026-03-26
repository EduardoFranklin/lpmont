import type { Lead } from "@/pages/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, UserCheck, TrendingUp, Globe, Megaphone, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, string> = {
  novo: "Novos",
  agendado: "Agendados",
  compareceu: "Em negociação",
  nao_compareceu: "Não compareceram",
  convertido: "Convertidos",
  perdido: "Perdidos",
};

const DashReports = ({ leads }: { leads: Lead[] }) => {
  const total = leads.length;
  const agendados = leads.filter((l) => l.status !== "novo").length;
  const compareceram = leads.filter((l) => ["compareceu", "convertido"].includes(l.status)).length;
  const convertidos = leads.filter((l) => l.status === "convertido").length;

  const taxaAgendamento = total > 0 ? ((agendados / total) * 100).toFixed(1) : "0";
  const taxaComparecimento = agendados > 0 ? ((compareceram / agendados) * 100).toFixed(1) : "0";
  const taxaConversao = compareceram > 0 ? ((convertidos / compareceram) * 100).toFixed(1) : "0";

  const metrics = [
    { label: "Total de Leads", value: total, icon: Users, color: "text-blue-400" },
    { label: "Agendamentos", value: `${agendados} (${taxaAgendamento}%)`, icon: CalendarCheck, color: "text-amber-400" },
    { label: "Comparecimento", value: `${compareceram} (${taxaComparecimento}%)`, icon: UserCheck, color: "text-emerald-400" },
    { label: "Conversões", value: `${convertidos} (${taxaConversao}%)`, icon: TrendingUp, color: "text-primary" },
  ];

  const byStatus = Object.entries(statusLabels).map(([key, label]) => ({
    label,
    count: leads.filter((l) => l.status === key).length,
  }));

  const byCareer: Record<string, number> = {};
  leads.forEach((l) => {
    byCareer[l.career] = (byCareer[l.career] || 0) + 1;
  });

  const byUf: Record<string, number> = {};
  leads.forEach((l) => {
    byUf[l.uf] = (byUf[l.uf] || 0) + 1;
  });
  const topUfs = Object.entries(byUf).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // UTM origin reports
  const bySource: Record<string, { total: number; convertidos: number }> = {};
  const byCampaign: Record<string, { total: number; convertidos: number }> = {};
  const byMedium: Record<string, { total: number; convertidos: number }> = {};

  leads.forEach((l) => {
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

  return (
    <div className="space-y-6">
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

      {/* Origin reports */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Por Origem (Source)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedSources.map(([src, data]) => {
              const rate = data.total > 0 ? ((data.convertidos / data.total) * 100).toFixed(0) : "0";
              return (
                <div key={src} className="flex items-center justify-between text-sm">
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
              return (
                <div key={camp} className="flex items-center justify-between text-sm">
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
              <Target className="w-4 h-4 text-primary" /> Por Mídia (Medium)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedMediums.map(([med, data]) => {
              const rate = data.total > 0 ? ((data.convertidos / data.total) * 100).toFixed(0) : "0";
              return (
                <div key={med} className="flex items-center justify-between text-sm">
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

      {/* Existing reports */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Por Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byStatus.map((s) => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Por Carreira</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byCareer).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{k.replace("_", " ")}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Top UFs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topUfs.map(([uf, count]) => (
              <div key={uf} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{uf}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {topUfs.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashReports;
