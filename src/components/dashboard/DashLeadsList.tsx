import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, Edit2, RefreshCw, MessageCircle, Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "novo", label: "Novo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "agendado", label: "Agendado", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "compareceu", label: "Em negociação", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "nao_compareceu", label: "Não compareceu", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "convertido", label: "Convertido", color: "bg-primary/20 text-primary border-primary/30" },
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
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<LeadStatus>("novo");
  const [editTemp, setEditTemp] = useState<string>("frio");
  const [editNotes, setEditNotes] = useState("");
  const [leadNotes, setLeadNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState("");

  const filtered = leads.filter((l) => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
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
    await supabase.from("lead_notes").insert({
      lead_id: editLead.id,
      user_id: user.id,
      content: newNote.trim(),
    } as any);
    setNewNote("");
    // Refresh notes
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
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">{filtered.length} lead(s) encontrado(s)</div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Temp.</TableHead>
              <TableHead className="hidden lg:table-cell">Observação</TableHead>
              <TableHead className="hidden lg:table-cell">Data</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead, idx) => (
              <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/dash/lead/${lead.id}`)}>
                <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                <TableCell className="font-medium">{lead.treatment} {lead.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.phone}</TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell>{getTempBadge((lead as any).temperature)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Input
                    defaultValue={lead.notes || ""}
                    className="h-7 text-xs bg-transparent border-border/50"
                    placeholder="—"
                    onBlur={(e) => {
                      if (e.target.value !== (lead.notes || "")) {
                        handleInlineObsChange(lead.id, e.target.value);
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
                  {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH'h'mm", { locale: ptBR })}
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
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
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
            <DialogTitle>Editar Lead: {editLead?.treatment} {editLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Temperatura</label>
                <select
                  value={editTemp}
                  onChange={(e) => setEditTemp(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TEMP_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Observação rápida</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Observação geral do lead..."
              />
            </div>

            {/* Multi-notes section */}
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
                {leadNotes.map((note) => (
                  <div key={note.id} className="rounded bg-muted/50 p-2 text-xs">
                    <p className="text-foreground">{note.content}</p>
                    <p className="text-muted-foreground mt-1">
                      {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ))}
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
