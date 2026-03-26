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
  Plus, Save, Thermometer, User, FileText, Globe
} from "lucide-react";
import {
  ArrowLeft, Phone, Mail, MapPin, Briefcase, Calendar, Clock, MessageCircle,
  Plus, Save, Thermometer, User, FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

const TEMP_OPTIONS: { value: LeadTemperature; label: string; color: string }[] = [
  { value: "frio", label: "Frio", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "morno", label: "Morno", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "quente", label: "Quente", color: "bg-red-500/20 text-red-400 border-red-500/30" },
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
  const [editObs, setEditObs] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLead = async () => {
    if (!id) return;
    const { data } = await supabase.from("leads").select("*").eq("id", id).single();
    if (data) {
      setLead(data);
      setEditStatus(data.status);
      setEditTemp(data.temperature || "frio");
      setEditObs(data.notes || "");
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
      notes: editObs,
    }).eq("id", lead.id);
    await fetchLead();
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("lead_notes").insert({
      lead_id: lead.id,
      user_id: user.id,
      content: newNote.trim(),
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
  const tempOpt = TEMP_OPTIONS.find(t => t.value === (lead.temperature || "frio"));

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
            <Badge variant="outline" className={tempOpt?.color}>{tempOpt?.label}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="text-emerald-400" onClick={() => openWhatsApp(lead.phone)} title="WhatsApp">
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{lead.treatment} {lead.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{lead.city} - {lead.uf}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="capitalize">{lead.career?.replace("_", " ")}</span>
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
              {lead.scheduled_day && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lead.scheduled_day} — {lead.scheduled_time}</span>
                </div>
              )}
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

        {/* Edit section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Gerenciar Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <select
                  value={editTemp}
                  onChange={(e) => setEditTemp(e.target.value as LeadTemperature)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TEMP_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Observação</label>
              <textarea
                value={editObs}
                onChange={(e) => setEditObs(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Observação geral do lead..."
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Anotações ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicionar nova anotação..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button size="icon" onClick={handleAddNote} disabled={!newNote.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Separator />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg bg-muted/30 border border-border p-3">
                  <p className="text-sm text-foreground">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma anotação registrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeadDetail;
