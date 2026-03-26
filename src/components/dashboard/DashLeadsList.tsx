import { useState } from "react";
import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Trash2, Edit2, RefreshCw } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "novo", label: "Novo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "agendado", label: "Agendado", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "compareceu", label: "Compareceu", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "nao_compareceu", label: "Não compareceu", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "convertido", label: "Convertido", color: "bg-primary/20 text-primary border-primary/30" },
  { value: "perdido", label: "Perdido", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

const getStatusBadge = (status: LeadStatus) => {
  const s = STATUS_OPTIONS.find((o) => o.value === status);
  return <Badge variant="outline" className={s?.color}>{s?.label || status}</Badge>;
};

const DashLeadsList = ({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState<LeadStatus>("novo");
  const [editNotes, setEditNotes] = useState("");

  const filtered = leads.filter((l) => {
    const matchSearch = !search || 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.notes || "");
  };

  const handleSave = async () => {
    if (!editLead) return;
    await supabase.from("leads").update({ status: editStatus, notes: editNotes }).eq("id", editLead.id);
    setEditLead(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    onRefresh();
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

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Horário</TableHead>
              <TableHead className="hidden lg:table-cell">Data</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.treatment} {lead.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{lead.email}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.phone}</TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                  {lead.scheduled_day && lead.scheduled_time ? `${lead.scheduled_day} ${lead.scheduled_time}` : "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lead: {editLead?.treatment} {editLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <label className="text-sm font-medium text-foreground mb-1.5 block">Anotações</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Observações sobre o lead..."
              />
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
