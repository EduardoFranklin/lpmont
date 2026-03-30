import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface LeadTag {
  id: string;
  tag: string;
  source: string;
  created_at: string;
}

const SOURCE_COLORS: Record<string, string> = {
  hotmart: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  manual: "bg-sky-500/15 text-sky-400 border-sky-500/25",
  quiz: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  system: "bg-muted text-muted-foreground border-border",
};

export default function LeadTags({ leadId }: { leadId: string }) {
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTags = async () => {
    const { data } = await supabase
      .from("lead_tags")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });
    setTags((data as LeadTag[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTags(); }, [leadId]);

  const handleAdd = async () => {
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.some(t => t.tag === trimmed)) {
      toast.error("Tag já existe");
      return;
    }
    await supabase.from("lead_tags").insert({ lead_id: leadId, tag: trimmed, source: "manual" });
    setNewTag("");
    fetchTags();
    toast.success("Tag adicionada");
  };

  const handleRemove = async (id: string) => {
    await supabase.from("lead_tags").delete().eq("id", id);
    fetchTags();
    toast.success("Tag removida");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="w-4 h-4" /> Tags ({tags.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nova tag..."
            className="flex-1 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="sm" variant="outline" onClick={handleAdd} disabled={!newTag.trim()} className="h-8 px-2">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-2">Carregando...</p>
        ) : tags.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">Nenhuma tag.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge
                key={t.id}
                variant="outline"
                className={`text-[11px] gap-1 pr-1 ${SOURCE_COLORS[t.source] || SOURCE_COLORS.system}`}
              >
                {t.tag}
                <button
                  onClick={() => handleRemove(t.id)}
                  className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
