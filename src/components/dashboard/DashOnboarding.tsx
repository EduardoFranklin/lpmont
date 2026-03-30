import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Loader2, Calendar, Bell } from "lucide-react";
import { toast } from "sonner";

type Announcement = {
  id: string;
  title: string;
  description: string;
  announcement_date: string;
  active: boolean;
  sort_order: number;
};

const DashOnboarding = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("onboarding_announcements")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setAnnouncements(data as Announcement[]);
    setLoading(false);
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const addAnnouncement = async () => {
    const { data, error } = await supabase
      .from("onboarding_announcements")
      .insert({
        title: "Novo aviso",
        description: "",
        announcement_date: new Date().toISOString().split("T")[0],
        sort_order: announcements.length,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    if (data) setAnnouncements([...announcements, data as Announcement]);
    toast.success("Aviso criado!");
  };

  const updateAnnouncement = (id: string, field: string, value: any) => {
    setAnnouncements(prev =>
      prev.map(a => a.id === id ? { ...a, [field]: value } : a)
    );
  };

  const saveAnnouncement = async (ann: Announcement) => {
    setSaving(true);
    const { error } = await supabase
      .from("onboarding_announcements")
      .update({
        title: ann.title,
        description: ann.description,
        announcement_date: ann.announcement_date,
        active: ann.active,
        sort_order: ann.sort_order,
      })
      .eq("id", ann.id);
    if (error) toast.error(error.message);
    else toast.success("Aviso salvo!");
    setSaving(false);
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from("onboarding_announcements")
      .delete()
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success("Aviso removido.");
  };

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-4 bg-muted/20">
        <p className="text-sm text-muted-foreground mb-1">
          Os textos e links da página de onboarding são editáveis na seção <strong>"Onboarding"</strong> do CMS (aba Conteúdo).
        </p>
        <p className="text-xs text-muted-foreground">
          Aqui você gerencia apenas os <strong>avisos do quadro ao vivo</strong> (datas de aulas, comunicados).
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Quadro de Avisos</h3>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{announcements.length}</span>
        </div>
        <Button variant="outline" size="sm" onClick={addAnnouncement} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo aviso
        </Button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nenhum aviso cadastrado.<br />
          Clique em "Novo aviso" para adicionar.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className="border border-border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-center gap-3">
                <Input
                  value={ann.title}
                  onChange={(e) => updateAnnouncement(ann.id, "title", e.target.value)}
                  placeholder="Título do aviso"
                  className="flex-1 text-sm font-medium"
                />
                <Input
                  type="date"
                  value={ann.announcement_date}
                  onChange={(e) => updateAnnouncement(ann.id, "announcement_date", e.target.value)}
                  className="w-40 text-sm"
                />
              </div>
              <Textarea
                value={ann.description}
                onChange={(e) => updateAnnouncement(ann.id, "description", e.target.value)}
                placeholder="Descrição (ex: Às 20h · Link enviado por e-mail)"
                rows={2}
                className="text-sm"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={ann.active}
                    onCheckedChange={(v) => updateAnnouncement(ann.id, "active", v)}
                  />
                  <span className="text-xs text-muted-foreground">{ann.active ? "Visível" : "Oculto"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="text-destructive/60 hover:text-destructive gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveAnnouncement(ann)}
                    disabled={saving}
                    className="gap-1.5"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashOnboarding;
