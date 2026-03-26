import type { Lead } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: "novo", label: "Novos", color: "border-t-blue-400" },
  { status: "agendado", label: "Agendados", color: "border-t-amber-400" },
  { status: "compareceu", label: "Compareceram", color: "border-t-emerald-400" },
  { status: "nao_compareceu", label: "Não Compareceram", color: "border-t-red-400" },
  { status: "convertido", label: "Convertidos", color: "border-t-primary" },
  { status: "perdido", label: "Perdidos", color: "border-t-gray-400" },
];

const DashKanban = ({ leads, onRefresh }: { leads: Lead[]; onRefresh: () => void }) => {
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

  return (
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
            <div className="p-3 border-b border-border">
              <h3 className="text-xs font-semibold text-foreground">{col.label}</h3>
              <span className="text-xs text-muted-foreground">{colLeads.length}</span>
            </div>
            <div className="p-2 space-y-2">
              {colLeads.map((lead) => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-3 space-y-1.5">
                    <p className="text-sm font-medium leading-tight">{lead.treatment} {lead.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{lead.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    {lead.career && (
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                        {lead.career.replace("_", " ")}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashKanban;
