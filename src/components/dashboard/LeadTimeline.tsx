import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History, Mail, MessageCircle, ShoppingCart, CalendarCheck,
  Zap, UserPlus, Eye, CreditCard, BookOpen, AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  type: "message" | "tag" | "status";
  date: string;
  icon: typeof Mail;
  color: string;
  title: string;
  detail?: string;
}

const TAG_EVENT_MAP: Record<string, { icon: typeof Mail; color: string; title: string }> = {
  pagou: { icon: CreditCard, color: "text-emerald-400", title: "Compra aprovada" },
  abandonou_checkout: { icon: ShoppingCart, color: "text-amber-400", title: "Abandonou checkout" },
  boleto_impresso: { icon: CreditCard, color: "text-yellow-400", title: "Boleto impresso" },
  pix_gerado: { icon: CreditCard, color: "text-cyan-400", title: "PIX gerado (aguardando pagamento)" },
  compra_expirada: { icon: AlertTriangle, color: "text-red-400", title: "Compra expirada" },
  entrou_no_curso: { icon: BookOpen, color: "text-blue-400", title: "Acessou o curso" },
  modulo_concluido: { icon: BookOpen, color: "text-purple-400", title: "Módulo concluído" },
  comprador: { icon: CreditCard, color: "text-emerald-400", title: "Marcado como comprador" },
};

const CHANNEL_ICON: Record<string, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
};

export default function LeadTimeline({ leadId, lead }: { leadId: string; lead: any }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch message history
      const { data: messages } = await supabase
        .from("message_history")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      // Fetch tags (as events)
      const { data: tags } = await supabase
        .from("lead_tags")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      const allEvents: TimelineEvent[] = [];

      // Lead creation
      if (lead?.created_at) {
        allEvents.push({
          id: "created",
          type: "status",
          date: lead.created_at,
          icon: UserPlus,
          color: "text-blue-400",
          title: "Lead cadastrado",
          detail: lead.funnel_origin ? `Funil: ${lead.funnel_origin}` : undefined,
        });
      }

      // Quiz started
      if (lead?.quiz_started_at) {
        allEvents.push({
          id: "quiz-start",
          type: "status",
          date: lead.quiz_started_at,
          icon: Zap,
          color: "text-amber-400",
          title: "Iniciou o quiz",
          detail: lead.quiz_slug || undefined,
        });
      }

      // Quiz completed
      if (lead?.quiz_concluido && lead?.quiz_score != null) {
        allEvents.push({
          id: "quiz-done",
          type: "status",
          date: lead.quiz_started_at || lead.created_at,
          icon: Zap,
          color: "text-purple-400",
          title: `Quiz concluído — ${lead.quiz_score} pts`,
          detail: lead.quiz_diagnostico || undefined,
        });
      }

      // Meeting scheduled
      if (lead?.reuniao_data_hora_iso) {
        allEvents.push({
          id: "reuniao",
          type: "status",
          date: lead.reuniao_data_hora_iso,
          icon: CalendarCheck,
          color: "text-emerald-400",
          title: "Reunião agendada",
          detail: `${lead.reuniao_data_extenso || ""} ${lead.reuniao_hora_extenso || ""}`.trim() || undefined,
        });
      }

      // Purchase
      if (lead?.data_compra) {
        allEvents.push({
          id: "compra",
          type: "status",
          date: lead.data_compra,
          icon: CreditCard,
          color: "text-emerald-400",
          title: `Compra realizada${lead.valor_pago ? ` — R$ ${Number(lead.valor_pago).toFixed(2)}` : ""}`,
          detail: lead.forma_pagamento || undefined,
        });
      }

      // Tags as events
      (tags || []).forEach((t: any) => {
        const mapped = TAG_EVENT_MAP[t.tag];
        if (mapped) {
          allEvents.push({
            id: `tag-${t.id}`,
            type: "tag",
            date: t.created_at,
            icon: mapped.icon,
            color: mapped.color,
            title: mapped.title,
            detail: `Fonte: ${t.source}`,
          });
        }
      });

      // Messages
      (messages || []).forEach((m: any) => {
        const Icon = CHANNEL_ICON[m.channel] || Mail;
        allEvents.push({
          id: `msg-${m.id}`,
          type: "message",
          date: m.created_at,
          icon: Icon,
          color: m.status === "sent" ? "text-emerald-400" : m.status === "failed" ? "text-red-400" : "text-muted-foreground",
          title: `${m.channel === "whatsapp" ? "WhatsApp" : "E-mail"} ${m.status === "sent" ? "enviado" : m.status === "failed" ? "falhou" : m.status}`,
          detail: m.body_preview ? m.body_preview.substring(0, 80) + (m.body_preview.length > 80 ? "…" : "") : m.funnel ? `${m.funnel} / ${m.step_key}` : undefined,
        });
      });

      // Sort by date descending
      allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEvents(allEvents);
      setLoading(false);
    };

    fetchAll();
  }, [leadId, lead]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="w-4 h-4" /> Histórico & Eventos ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Carregando...</p>
        ) : events.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento registrado.</p>
        ) : (
          <div className="relative space-y-0 max-h-[500px] overflow-y-auto">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
            {events.map((ev, i) => (
              <div key={ev.id} className="relative flex gap-3 py-2">
                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center ${ev.color}`}>
                  <ev.icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{ev.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(ev.date), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {ev.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
