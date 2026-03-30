import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: "novo", label: "Novos", color: "border-t-blue-400" },
  { status: "agendado", label: "Agendados", color: "border-t-amber-400" },
  { status: "compareceu", label: "Em negociação", color: "border-t-emerald-400" },
  { status: "nao_compareceu", label: "Não Compareceram", color: "border-t-red-400" },
  { status: "convertido", label: "Pagos", color: "border-t-primary" },
  { status: "perdido", label: "Perdidos", color: "border-t-gray-400" },
];

const TEMP_COLORS: Record<string, string> = {
  frio: "bg-blue-500",
  morno: "bg-amber-500",
  quente: "bg-red-500",
};

const DashKanban = ({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("leads").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao deletar lead");
    else { toast.success("Lead deletado"); onRefresh(); }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    onRefresh();
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const num = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    window.open(`https://wa.me/${num}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        return (
          <div
            key={col.status}
            className={`rounded-lg bg-card border border-border border-t-2 ${col.color} min-h-[300px]`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-foreground">{col.label}</h3>
                <span className="text-xs text-muted-foreground">{colLeads.length}</span>
              </div>
            </div>
            <div className="p-2 space-y-2">
              {colLeads.map((lead) => {
                const temp = (lead as any).temperature || "frio";
                return (
                  <Card
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => navigate(`/dash/lead/${lead.id}`)}
                    className="cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                  >
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">#{(lead as any).lead_number || '—'}</span>
                          <p className="text-sm font-medium leading-tight truncate">{lead.treatment} {lead.name}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TEMP_COLORS[temp]}`} title={temp} />
                      </div>
                      {(lead as any).quiz_slug && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/25">Quiz</span>
                          {(lead as any).quiz_score != null && (
                            <span className="text-[10px] font-mono text-muted-foreground">{(lead as any).quiz_score}pts</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {lead.career && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                            {lead.career.replace("_", " ")}
                          </span>
                        )}
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive/60 hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(lead.id); }}
                            title="Deletar lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-emerald-400"
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(lead.phone); }}
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lead e suas notas serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default DashKanban;
