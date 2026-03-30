import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, Edit2, RefreshCw, MessageCircle, Plus, CalendarCheck, Snowflake, Flame, Zap, UserPlus } from "lucide-react";
import { Dialog as NewLeadDialog, DialogContent as NewLeadDialogContent, DialogHeader as NewLeadDialogHeader, DialogTitle as NewLeadDialogTitle, DialogFooter as NewLeadDialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatElapsed = (dateStr: string) => {
  const mins = differenceInMinutes(new Date(), new Date(dateStr));
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 48) return `${hours}h${remMins > 0 ? String(remMins).padStart(2, "0") + "m" : ""}`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "novo", label: "Novo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "agendado", label: "Agendado", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "compareceu", label: "Em negociação", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "nao_compareceu", label: "Não compareceu", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "convertido", label: "Pago", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "perdido", label: "Perdido", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

const TEMP_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "frio", label: "Frio", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "morno", label: "Morno", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "quente", label: "Quente", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const getStatusBadge = (status: LeadStatus) => {
  const s = STATUS_OPTIONS.find((o) => o.value === status);
  return <Badge variant="outline" className={s?.color}>{s?.label || status}</Badge>;
};

const getTempBadge = (temp: string | null) => {
  const t = TEMP_OPTIONS.find((o) => o.value === (temp || "frio"));
  return <Badge variant="outline" className={t?.color}>{t?.label || "Frio"}</Badge>;
};

interface LeadNote {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const DashLeadsList = ({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showNewLead, setShowNewLead] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLead, setNewLead] = useState({
    treatment: "Dr.",
    name: "",
    phone: "",
    email: "",
    uf: "",
    city: "",
    career: "",
  });
  const resetNewLeadForm = () => setNewLead({ treatment: "Dr.", name: "", phone: "", email: "", uf: "", city: "", career: "" });

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.phone || !newLead.email || !newLead.uf || !newLead.city || !newLead.career) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      ...newLead,
      status: "novo" as const,
      funnel_origin: "manual",
    });
    if (error) toast.error("Erro ao criar lead");
    else {
      toast.success("Lead criado com sucesso!");
      resetNewLeadForm();
      setShowNewLead(false);
      onRefresh();
    }
    setSaving(false);
  };
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [filterMedium, setFilterMedium] = useState("");
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<LeadStatus>("novo");
  const [editTemp, setEditTemp] = useState<string>("frio");
  const [editNotes, setEditNotes] = useState("");
  const [leadNotes, setLeadNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState("");

  // Extract unique UTM values for autocomplete
  const utmSources = [...new Set(leads.map((l) => (l as any).utm_source).filter(Boolean))].sort();
  const utmCampaigns = [...new Set(leads.map((l) => (l as any).utm_campaign).filter(Boolean))].sort();
  const utmMediums = [...new Set(leads.map((l) => (l as any).utm_medium).filter(Boolean))].sort();

  const filtered = leads.filter((l) => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchSource = !filterSource || (l as any).utm_source === filterSource;
    const matchCampaign = !filterCampaign || (l as any).utm_campaign === filterCampaign;
    const matchMedium = !filterMedium || (l as any).utm_medium === filterMedium;
    return matchSearch && matchStatus && matchSource && matchCampaign && matchMedium;
  });

  const handleEdit = async (lead: Lead) => {
    setEditLead(lead);
    setEditStatus(lead.status);
    setEditTemp((lead as any).temperature || "frio");
    setEditNotes(lead.notes || "");
    // Fetch notes for this lead
    const { data } = await supabase.from("lead_notes").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false });
    setLeadNotes((data as any[]) || []);
    setNewNote("");
  };

  const handleSave = async () => {
    if (!editLead) return;
    await supabase.from("leads").update({
      status: editStatus,
      notes: editNotes,
      temperature: editTemp as any,
    }).eq("id", editLead.id);
    setEditLead(null);
    onRefresh();
  };

  const handleAddNote = async () => {
    if (!editLead || !newNote.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const statusLabel = STATUS_OPTIONS.find(s => s.value === editStatus)?.label || editStatus;
    const contentWithStage = `[${statusLabel}] ${newNote.trim()}`;
    await supabase.from("lead_notes").insert({
      lead_id: editLead.id,
      user_id: user.id,
      content: contentWithStage,
    } as any);
    setNewNote("");
    const { data } = await supabase.from("lead_notes").select("*").eq("lead_id", editLead.id).order("created_at", { ascending: false });
    setLeadNotes((data as any[]) || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    onRefresh();
  };

  const handleInlineObsChange = async (id: string, notes: string) => {
    await supabase.from("leads").update({ notes }).eq("id", id);
    onRefresh();
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const num = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    window.open(`https://wa.me/${num}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Origem</option>
          {utmSources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Campanha</option>
          {utmCampaigns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterMedium}
          onChange={(e) => setFilterMedium(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Mídia</option>
          {utmMediums.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
        <Button onClick={() => setShowNewLead(true)} size="sm" className="gap-1.5">
          <UserPlus className="w-4 h-4" /> Novo Lead
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} lead(s) encontrado(s)</div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Temp.</TableHead>
              <TableHead className="hidden lg:table-cell">Quiz</TableHead>
              <TableHead className="hidden lg:table-cell">No estágio</TableHead>
              <TableHead className="hidden lg:table-cell">Criado</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead, idx) => {
              const hasSchedule = lead.scheduled_day && lead.scheduled_time;
              return (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/dash/lead/${lead.id}`)}>
                  <TableCell className="text-muted-foreground text-xs font-mono">#{(lead as any).lead_number || '—'}</TableCell>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-1.5">
                      {lead.treatment} {lead.name}
                      {hasSchedule && (
                        <CalendarCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.phone}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>{getTempBadge((lead as any).temperature)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {(lead as any).quiz_slug ? (
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="bg-purple-500/15 text-purple-400 border-purple-500/25 text-[10px]">Quiz</Badge>
                        {(lead as any).quiz_score != null && (
                          <span className="text-[10px] font-mono text-muted-foreground">{(lead as any).quiz_score}pts</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
                    há {formatElapsed(lead.updated_at)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
                    {format(new Date(lead.created_at), "dd/MM/yy HH'h'mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400" onClick={() => openWhatsApp(lead.phone)} title="WhatsApp">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(lead)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(lead.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editLead?.treatment} {editLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Status full width */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
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

            {/* Temperature as icon buttons */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Temperatura</label>
              <div className="flex gap-2">
                {([
                  { value: "frio", label: "Frio", icon: Snowflake, activeClass: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
                  { value: "morno", label: "Morno", icon: Flame, activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
                  { value: "quente", label: "Quente", icon: Zap, activeClass: "bg-red-500/20 text-red-400 border-red-500/50" },
                ] as const).map((t) => (
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

            {/* Notes section only */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Notas ({leadNotes.length})</label>
              <div className="flex gap-2 mb-2">
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
              <div className="max-h-40 overflow-y-auto space-y-2">
                {leadNotes.map((note) => {
                  const stageMatch = note.content.match(/^\[(.+?)\]\s?/);
                  const stageName = stageMatch?.[1];
                  const noteText = stageMatch ? note.content.replace(stageMatch[0], "") : note.content;
                  return (
                    <div key={note.id} className="rounded bg-muted/50 p-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {stageName && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{stageName}</Badge>
                        )}
                        <span className="text-muted-foreground">
                          {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-foreground mt-1">{noteText}</p>
                    </div>
                  );
                })}
                {leadNotes.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma nota registrada.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditLead(null)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashLeadsList;
