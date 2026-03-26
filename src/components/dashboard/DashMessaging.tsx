import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save, MessageCircle, Mail, Bold, Italic, Link2, Image, Type,
  Variable, Strikethrough, Code, Plus, Trash2, Clock, Bell,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

/* ─── constants ─── */

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

const VARIABLES = [
  { key: "{{nome}}", desc: "Nome do lead" },
  { key: "{{email}}", desc: "E-mail do lead" },
  { key: "{{telefone}}", desc: "Telefone" },
  { key: "{{tratamento}}", desc: "Dr. / Dra." },
  { key: "{{cidade}}", desc: "Cidade" },
  { key: "{{data_agendamento}}", desc: "Data do agendamento" },
  { key: "{{horario_agendamento}}", desc: "Horário do agendamento" },
];

/* ─── types ─── */

interface Template {
  id?: string;
  channel: string;
  trigger: string;
  subject: string;
  body: string;
  active: boolean;
}

interface Reminder {
  id?: string;
  channel: string;
  timing_value: number;
  timing_unit: string;
  subject: string;
  body: string;
  active: boolean;
}

/* ─── toolbar helper ─── */

function insertAtCursor(ref: React.RefObject<HTMLTextAreaElement>, text: string) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  const newVal = before + text + after;
  el.value = newVal;
  el.focus();
  el.setSelectionRange(start + text.length, start + text.length);
  // trigger react state
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function wrapSelection(ref: React.RefObject<HTMLTextAreaElement>, before: string, after: string) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.slice(start, end) || "texto";
  const pre = el.value.slice(0, start);
  const post = el.value.slice(end);
  const newVal = pre + before + selected + after + post;
  el.value = newVal;
  el.focus();
  const newStart = start + before.length;
  const newEnd = newStart + selected.length;
  el.setSelectionRange(newStart, newEnd);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/* ─── Variables popover ─── */

const VariablesPopover = ({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Variáveis disponíveis">
        <Variable className="w-3.5 h-3.5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-56 p-2" align="start">
      <p className="text-[10px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">
        Clique para inserir
      </p>
      {VARIABLES.map((v) => (
        <button
          key={v.key}
          onClick={() => insertAtCursor(textareaRef, v.key)}
          className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted/50 flex justify-between items-center"
        >
          <code className="text-primary font-mono text-[11px]">{v.key}</code>
          <span className="text-muted-foreground text-[10px]">{v.desc}</span>
        </button>
      ))}
    </PopoverContent>
  </Popover>
);

/* ─── Email toolbar ─── */

const EmailToolbar = ({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) => (
  <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5 bg-muted/20">
    <Button variant="ghost" size="icon" className="h-7 w-7" title="Negrito"
      onClick={() => wrapSelection(textareaRef, "<b>", "</b>")}>
      <Bold className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="Itálico"
      onClick={() => wrapSelection(textareaRef, "<i>", "</i>")}>
      <Italic className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="Título grande"
      onClick={() => wrapSelection(textareaRef, '<h2 style="font-size:20px">', "</h2>")}>
      <Type className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="Inserir link"
      onClick={() => {
        const url = prompt("URL do link:");
        if (url) wrapSelection(textareaRef, `<a href="${url}" style="color:#c8a97e">`, "</a>");
      }}>
      <Link2 className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="Inserir imagem"
      onClick={() => {
        const url = prompt("URL da imagem:");
        if (url) {
          const w = prompt("Largura (px):", "300");
          insertAtCursor(textareaRef, `<img src="${url}" width="${w || 300}" style="border-radius:8px;max-width:100%" />`);
        }
      }}>
      <Image className="w-3.5 h-3.5" />
    </Button>
    <div className="w-px h-5 bg-border mx-0.5" />
    <VariablesPopover textareaRef={textareaRef} />
  </div>
);

/* ─── WhatsApp toolbar ─── */

const WhatsAppToolbar = ({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) => (
  <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5 bg-muted/20">
    <Button variant="ghost" size="icon" className="h-7 w-7" title="*Negrito*"
      onClick={() => wrapSelection(textareaRef, "*", "*")}>
      <Bold className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="_Itálico_"
      onClick={() => wrapSelection(textareaRef, "_", "_")}>
      <Italic className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="~Tachado~"
      onClick={() => wrapSelection(textareaRef, "~", "~")}>
      <Strikethrough className="w-3.5 h-3.5" />
    </Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="```Monoespaçado```"
      onClick={() => wrapSelection(textareaRef, "```", "```")}>
      <Code className="w-3.5 h-3.5" />
    </Button>
    <div className="w-px h-5 bg-border mx-0.5" />
    <VariablesPopover textareaRef={textareaRef} />
  </div>
);

/* ─── Template editor row ─── */

const TemplateRow = ({ tmpl, onChange, onSave }: {
  tmpl: Template;
  onChange: (field: keyof Template, value: any) => void;
  onSave: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ChannelIcon = CHANNELS.find((c) => c.value === tmpl.channel)?.icon || Mail;
  const isEmail = tmpl.channel === "email";

  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChannelIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{isEmail ? "E-mail" : "WhatsApp"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ativo</span>
          <Switch checked={tmpl.active} onCheckedChange={(v) => onChange("active", v)} />
        </div>
      </div>

      {isEmail && (
        <Input
          placeholder="Assunto do e-mail"
          value={tmpl.subject}
          onChange={(e) => onChange("subject", e.target.value)}
          className="text-sm"
        />
      )}

      {isEmail ? <EmailToolbar textareaRef={textareaRef} /> : <WhatsAppToolbar textareaRef={textareaRef} />}

      <textarea
        ref={textareaRef}
        value={tmpl.body}
        onChange={(e) => onChange("body", e.target.value)}
        onInput={(e) => onChange("body", (e.target as HTMLTextAreaElement).value)}
        rows={4}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
        placeholder={isEmail ? "Corpo do e-mail (HTML suportado)..." : "Mensagem do WhatsApp..."}
      />

      <div className="flex justify-end">
        <Button size="sm" className="h-7 text-xs gap-1" onClick={onSave}>
          <Save className="w-3 h-3" /> Salvar
        </Button>
      </div>
    </div>
  );
};

/* ─── Reminders tab ─── */

const TIMING_PRESETS = [
  { label: "7 dias antes", value: 7, unit: "dias" },
  { label: "3 dias antes", value: 3, unit: "dias" },
  { label: "1 dia antes", value: 1, unit: "dias" },
  { label: "2 horas antes", value: 2, unit: "horas" },
  { label: "1 hora antes", value: 1, unit: "horas" },
];

const RemindersTab = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("reminder_templates").select("*").order("timing_value", { ascending: false });
    setReminders((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = (channel: string) => {
    setReminders((prev) => [
      ...prev,
      { channel, timing_value: 1, timing_unit: "dias", subject: "", body: "", active: true },
    ]);
  };

  const handleChange = (idx: number, field: keyof Reminder, value: any) => {
    setReminders((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSave = async (reminder: Reminder) => {
    const payload = {
      channel: reminder.channel,
      timing_value: reminder.timing_value,
      timing_unit: reminder.timing_unit,
      subject: reminder.subject || null,
      body: reminder.body,
      active: reminder.active,
    };
    if (reminder.id) {
      await supabase.from("reminder_templates").update(payload).eq("id", reminder.id);
    } else {
      await supabase.from("reminder_templates").insert(payload);
    }
    toast.success("Lembrete salvo!");
    fetch();
  };

  const handleDelete = async (reminder: Reminder) => {
    if (!reminder.id) {
      setReminders((prev) => prev.filter((r) => r !== reminder));
      return;
    }
    if (!confirm("Excluir este lembrete?")) return;
    await supabase.from("reminder_templates").delete().eq("id", reminder.id);
    toast.success("Lembrete excluído");
    fetch();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure lembretes automáticos para leads que agendaram. Defina o canal, tempo antes e a mensagem.
      </p>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleAdd("email")}>
          <Mail className="w-3.5 h-3.5" /> <Plus className="w-3 h-3" /> E-mail
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleAdd("whatsapp")}>
          <MessageCircle className="w-3.5 h-3.5" /> <Plus className="w-3 h-3" /> WhatsApp
        </Button>
      </div>

      {reminders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhum lembrete configurado. Clique acima para adicionar.
          </CardContent>
        </Card>
      )}

      {reminders.map((reminder, idx) => (
        <ReminderCard
          key={reminder.id || `new-${idx}`}
          reminder={reminder}
          onChange={(field, value) => handleChange(idx, field, value)}
          onSave={() => handleSave(reminder)}
          onDelete={() => handleDelete(reminder)}
        />
      ))}
    </div>
  );
};

const ReminderCard = ({ reminder, onChange, onSave, onDelete }: {
  reminder: Reminder;
  onChange: (field: keyof Reminder, value: any) => void;
  onSave: () => void;
  onDelete: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmail = reminder.channel === "email";
  const ChannelIcon = isEmail ? Mail : MessageCircle;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChannelIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{isEmail ? "E-mail" : "WhatsApp"}</span>
            <Clock className="w-3.5 h-3.5 text-muted-foreground ml-2" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ativo</span>
            <Switch checked={reminder.active} onCheckedChange={(v) => onChange("active", v)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={reminder.timing_value}
            onChange={(e) => onChange("timing_value", parseInt(e.target.value) || 1)}
            className="w-20 h-8 text-sm"
          />
          <select
            value={reminder.timing_unit}
            onChange={(e) => onChange("timing_unit", e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="dias">dia(s) antes</option>
            <option value="horas">hora(s) antes</option>
          </select>
          <div className="flex-1" />
          <div className="flex gap-1 flex-wrap">
            {TIMING_PRESETS.map((p) => (
              <button
                key={`${p.value}-${p.unit}`}
                onClick={() => {
                  onChange("timing_value", p.value);
                  onChange("timing_unit", p.unit);
                }}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  reminder.timing_value === p.value && reminder.timing_unit === p.unit
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isEmail && (
          <Input
            placeholder="Assunto do e-mail"
            value={reminder.subject}
            onChange={(e) => onChange("subject", e.target.value)}
            className="text-sm"
          />
        )}

        {isEmail ? <EmailToolbar textareaRef={textareaRef} /> : <WhatsAppToolbar textareaRef={textareaRef} />}

        <textarea
          ref={textareaRef}
          value={reminder.body}
          onChange={(e) => onChange("body", e.target.value)}
          onInput={(e) => onChange("body", (e.target as HTMLTextAreaElement).value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          placeholder={isEmail
            ? "Olá {{nome}}, lembramos que seu agendamento é em breve..."
            : "Olá {{nome}}, lembrete: seu agendamento é amanhã!"}
        />

        <div className="flex justify-between">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive gap-1" onClick={onDelete}>
            <Trash2 className="w-3 h-3" /> Excluir
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1" onClick={onSave}>
            <Save className="w-3 h-3" /> Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── Main component ─── */

const DashMessaging = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from("messaging_templates").select("*").order("trigger");
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
    <Tabs defaultValue="geral" className="space-y-4">
      <TabsList>
        <TabsTrigger value="geral" className="gap-1.5">
          <Mail className="w-4 h-4" /> Geral
        </TabsTrigger>
        <TabsTrigger value="lembretes" className="gap-1.5">
          <Bell className="w-4 h-4" /> Lembretes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure mensagens automáticas para cada etapa do funil.
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
                  return (
                    <TemplateRow
                      key={`${tmpl.channel}-${tmpl.trigger}`}
                      tmpl={tmpl}
                      onChange={(field, value) => handleChange(idx, field, value)}
                      onSave={() => handleSave(tmpl)}
                    />
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>

      <TabsContent value="lembretes">
        <RemindersTab />
      </TabsContent>
    </Tabs>
  );
};

export default DashMessaging;
