import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/pages/Dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Phone, Mail, MapPin, Briefcase, Calendar, Clock, MessageCircle,
  Plus, Save, User, FileText, Globe, CalendarCheck, Timer, Snowflake, Flame, Zap
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatElapsed = (dateStr: string) => {
  const mins = differenceInMinutes(new Date(), new Date(dateStr));
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 48) return `${hours}h${remMins > 0 ? String(remMins).padStart(2, "0") + "m" : ""}`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days}d ${remHours}h`;
};
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];
type LeadTemperature = Database["public"]["Enums"]["lead_temperature"];

interface LeadNote {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "novo", label: "Novo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "agendado", label: "Agendado", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "compareceu", label: "Em negociação", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "nao_compareceu", label: "Não compareceu", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "convertido", label: "Convertido", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "perdido", label: "Perdido", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

const TEMP_BUTTONS = [
  { value: "frio" as LeadTemperature, label: "Frio", icon: Snowflake, activeClass: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  { value: "morno" as LeadTemperature, label: "Morno", icon: Flame, activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
  { value: "quente" as LeadTemperature, label: "Quente", icon: Zap, activeClass: "bg-red-500/20 text-red-400 border-red-500/50" },
];

const TREATMENT_OPTIONS = ["Dr.", "Dra.", "Sr.", "Sra."];
const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const CAREER_OPTIONS = [
  { label: "Dentista", value: "dentista" },
  { label: "Dono(a) de Clínica", value: "dono_clinica" },
  { label: "Estudante", value: "estudante" },
  { label: "Médico(a)", value: "medico" },
  { label: "Fisioterapeuta", value: "fisioterapeuta" },
  { label: "Nutricionista", value: "nutricionista" },
  { label: "Psicólogo(a)", value: "psicologo" },
  { label: "Enfermeiro(a)", value: "enfermeiro" },
  { label: "Veterinário(a)", value: "veterinario" },
  { label: "Farmacêutico(a)", value: "farmaceutico" },
  { label: "Outro", value: "outro" },
];

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editStatus, setEditStatus] = useState<LeadStatus>("novo");
  const [editTemp, setEditTemp] = useState<LeadTemperature>("frio");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Editable fields — always editable
  const [editFields, setEditFields] = useState({
    treatment: "", name: "", phone: "", email: "", city: "", uf: "", career: "",
    scheduled_day: "", scheduled_time: "", notes: "",
  });

  const fetchLead = async () => {
    if (!id) return;
    const { data } = await supabase.from("leads").select("*").eq("id", id).single();
    if (data) {
      setLead(data);
      setEditStatus(data.status);
      setEditTemp(data.temperature || "frio");
      setEditFields({
        treatment: data.treatment || "Dr.",
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        uf: data.uf,
        career: data.career,
        scheduled_day: data.scheduled_day || "",
        scheduled_time: data.scheduled_time || "",
        notes: data.notes || "",
      });
    }
    setLoading(false);
  };

  const fetchNotes = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false });
    setNotes((data as LeadNote[]) || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/dash/login");
      else {
        fetchLead();
        fetchNotes();
      }
    });
  }, [id]);

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    await supabase.from("leads").update({
      status: editStatus,
      temperature: editTemp,
      treatment: editFields.treatment,
      name: editFields.name,
      phone: editFields.phone,
      email: editFields.email,
      city: editFields.city,
      uf: editFields.uf,
      career: editFields.career,
      scheduled_day: editFields.scheduled_day || null,
      scheduled_time: editFields.scheduled_time || null,
      notes: editFields.notes || null,
    }).eq("id", lead.id);
    await fetchLead();
    setHasChanges(false);
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const statusLabel = STATUS_OPTIONS.find(s => s.value === editStatus)?.label || editStatus;
    await supabase.from("lead_notes").insert({
      lead_id: lead.id,
      user_id: user.id,
      content: `[${statusLabel}] ${newNote.trim()}`,
    } as any);
    setNewNote("");
    fetchNotes();
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const num = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    window.open(`https://wa.me/${num}`, "_blank");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!lead) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Lead não encontrado.</div>;

  const statusOpt = STATUS_OPTIONS.find(s => s.value === lead.status);
  const tempBtn = TEMP_BUTTONS.find(t => t.value === (lead.temperature || "frio"));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dash")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {lead.treatment} {lead.name}
            </span>
            <Badge variant="outline" className={statusOpt?.color}>{statusOpt?.label}</Badge>
            {tempBtn && (
              <Badge variant="outline" className={tempBtn.activeClass}>
                <tempBtn.icon className="w-3 h-3 mr-1" />{tempBtn.label}
              </Badge>
            )}
            {lead.scheduled_day && lead.scheduled_time && (
              <CalendarCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
              <Timer className="w-3 h-3" /> há {formatElapsed(lead.updated_at)}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="text-emerald-400" onClick={() => openWhatsApp(lead.phone)}>
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4" /> Dados pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Tratamento / Nome</label>
                  <div className="flex gap-2">
                    <select value={editFields.treatment} onChange={e => { setEditFields(f => ({...f, treatment: e.target.value})); setHasChanges(true); }} className="h-9 rounded-md border border-input bg-background px-2 text-sm w-20">
                      {TREATMENT_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Input value={editFields.name} onChange={e => { setEditFields(f => ({...f, name: e.target.value})); setHasChanges(true); }} placeholder="Nome completo" className="flex-1 h-9" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Telefone</label>
                  <Input value={editFields.phone} onChange={e => { setEditFields(f => ({...f, phone: e.target.value})); setHasChanges(true); }} placeholder="(00) 00000-0000" className="h-9" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Email</label>
                  <Input value={editFields.email} onChange={e => { setEditFields(f => ({...f, email: e.target.value.toLowerCase()})); setHasChanges(true); }} placeholder="seu@email.com" type="email" className="h-9" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Cidade / UF</label>
                  <div className="flex gap-2">
                    <Input value={editFields.city} onChange={e => { setEditFields(f => ({...f, city: e.target.value})); setHasChanges(true); }} placeholder="Cidade" className="flex-1 h-9" />
                    <select value={editFields.uf} onChange={e => { setEditFields(f => ({...f, uf: e.target.value})); setHasChanges(true); }} className="h-9 rounded-md border border-input bg-background px-2 text-sm w-20">
                      {UF_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Carreira</label>
                  <select value={editFields.career} onChange={e => { setEditFields(f => ({...f, career: e.target.value})); setHasChanges(true); }} className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
                    {CAREER_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Origem (UTM)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Source", value: (lead as any).utm_source },
                { label: "Medium", value: (lead as any).utm_medium },
                { label: "Campaign", value: (lead as any).utm_campaign },
                { label: "Term", value: (lead as any).utm_term },
                { label: "Content", value: (lead as any).utm_content },
              ].map((u) => (
                <div key={u.label} className="flex justify-between text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider">{u.label}</span>
                  <span className="text-foreground text-xs font-medium">{u.value || "—"}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> Agendamento & Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">Dia / Horário</label>
                <div className="flex gap-2">
                  <Input value={editFields.scheduled_day} onChange={e => { setEditFields(f => ({...f, scheduled_day: e.target.value})); setHasChanges(true); }} placeholder="Dia (ex: Segunda)" className="flex-1 h-9" />
                  <Input value={editFields.scheduled_time} onChange={e => { setEditFields(f => ({...f, scheduled_time: e.target.value})); setHasChanges(true); }} placeholder="Horário" className="w-32 h-9" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Criado em {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Atualizado em {format(new Date(lead.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manage section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Gerenciar Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as LeadStatus)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Temperatura</label>
              <div className="flex gap-2">
                {TEMP_BUTTONS.map((t) => (
                  <Button
                    key={t.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`flex-1 gap-1.5 ${editTemp === t.value ? t.activeClass : "text-muted-foreground"}`}
                    onClick={() => setEditTemp(t.value)}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Observação</label>
              <textarea
                value={editFields.notes}
                onChange={(e) => { setEditFields(f => ({...f, notes: e.target.value})); setHasChanges(true); }}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Observação geral do lead..."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || !hasChanges} size="sm">
                <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? "Salvando..." : hasChanges ? "Salvar alterações" : "Salvo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notas ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicionar nova nota..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button size="icon" onClick={handleAddNote} disabled={!newNote.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Separator />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notes.map((note) => {
                const stageMatch = note.content.match(/^\[(.+?)\]\s?/);
                const stageName = stageMatch?.[1];
                const noteText = stageMatch ? note.content.replace(stageMatch[0], "") : note.content;
                return (
                  <div key={note.id} className="rounded-lg bg-muted/30 border border-border p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      {stageName && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{stageName}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{noteText}</p>
                  </div>
                );
              })}
              {notes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma nota registrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeadDetail;