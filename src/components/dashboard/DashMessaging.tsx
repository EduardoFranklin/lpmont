import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = [
  { value: "novo", label: "Novo lead (boas-vindas)" },
  { value: "agendado", label: "Agendamento confirmado" },
  { value: "compareceu", label: "Em negociação" },
  { value: "nao_compareceu", label: "Não compareceu" },
  { value: "convertido", label: "Convertido" },
  { value: "perdido", label: "Perdido" },
];

const CHANNELS: { value: string; label: string; icon: any }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "E-mail", icon: Mail },
];

interface Template {
  id?: string;
  channel: string;
  trigger: string;
  subject: string;
  body: string;
  active: boolean;
}

const DashMessaging = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from("messaging_templates").select("*").order("trigger");
    
    // Build full grid of channel+trigger combos, merging existing data
    const all: Template[] = [];
    for (const trigger of TRIGGERS) {
      for (const channel of CHANNELS) {
        const existing = (data as any[])?.find(
          (t: any) => t.trigger === trigger.value && t.channel === channel.value
        );
        all.push({
          id: existing?.id,
          channel: channel.value,
          trigger: trigger.value,
          subject: existing?.subject || "",
          body: existing?.body || "",
          active: existing?.active ?? false,
        });
      }
    }
    setTemplates(all);
    setLoading(false);
  };

  const handleChange = (idx: number, field: keyof Template, value: any) => {
    setTemplates((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const handleSave = async (template: Template) => {
    const payload = {
      channel: template.channel,
      trigger: template.trigger,
      subject: template.subject || null,
      body: template.body,
      active: template.active,
    };

    if (template.id) {
      await supabase.from("messaging_templates").update(payload as any).eq("id", template.id);
    } else {
      await supabase.from("messaging_templates").insert(payload as any);
    }
    toast.success("Template salvo!");
    fetchTemplates();
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure mensagens automáticas para cada etapa do funil. As mensagens serão enviadas quando o lead mudar de status.
      </p>

      {TRIGGERS.map((trigger) => {
        const triggerTemplates = templates.filter((t) => t.trigger === trigger.value);
        return (
          <Card key={trigger.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{trigger.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {triggerTemplates.map((tmpl) => {
                const idx = templates.indexOf(tmpl);
                const ChannelIcon = CHANNELS.find((c) => c.value === tmpl.channel)?.icon || Mail;
                return (
                  <div key={`${tmpl.channel}-${tmpl.trigger}`} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {tmpl.channel === "whatsapp" ? "WhatsApp" : "E-mail"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Ativo</span>
                        <Switch
                          checked={tmpl.active}
                          onCheckedChange={(v) => handleChange(idx, "active", v)}
                        />
                      </div>
                    </div>

                    {tmpl.channel === "email" && (
                      <Input
                        placeholder="Assunto do e-mail"
                        value={tmpl.subject}
                        onChange={(e) => handleChange(idx, "subject", e.target.value)}
                        className="text-sm"
                      />
                    )}

                    <textarea
                      value={tmpl.body}
                      onChange={(e) => handleChange(idx, "body", e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder={
                        tmpl.channel === "whatsapp"
                          ? "Olá {{nome}}, bem-vindo(a)! ..."
                          : "Corpo do e-mail..."
                      }
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        Variáveis: {"{{nome}}"}, {"{{email}}"}, {"{{telefone}}"}, {"{{tratamento}}"}
                      </p>
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleSave(tmpl)}>
                        <Save className="w-3 h-3" /> Salvar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashMessaging;
