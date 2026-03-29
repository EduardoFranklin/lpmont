import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Save, MessageCircle, Mail, Bold, Italic, Link2, Image, Type,
  Variable, Strikethrough, Code, Plus, Trash2, Clock, Bell, Trophy, Phone,
  Zap, Users, ShoppingCart, GraduationCap, ChevronDown, ChevronUp,
  Send, CheckCircle2, XCircle, Loader2, History, RefreshCw,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

/* ─── constants ─── */

const FUNNELS = [
  { value: "F1", label: "F1 — Reunião com Consultor", icon: Users, color: "text-blue-500", description: "Confirmação, lembretes e follow-up pós-reunião" },
  { value: "F2", label: "F2 — Quiz de Diagnóstico", icon: Zap, color: "text-amber-500", description: "Diagnósticos A/B/C + recuperação de abandono" },
  { value: "F3", label: "F3 — Tráfego Direto", icon: ShoppingCart, color: "text-emerald-500", description: "Retargeting, abandono de checkout, objeções" },
  { value: "F4", label: "F4 — Pós-Compra (Onboarding)", icon: GraduationCap, color: "text-purple-500", description: "Boas-vindas, engajamento, reengajamento" },
];

const VARIABLES = [
  { key: "{{nome}}", desc: "Nome do lead" },
  { key: "{{email}}", desc: "E-mail do lead" },
  { key: "{{telefone}}", desc: "Telefone" },
  { key: "{{tratamento}}", desc: "Dr. / Dra." },
  { key: "{{cidade}}", desc: "Cidade" },
  { key: "{{score}}", desc: "Pontuação do quiz" },
  { key: "{{data}}", desc: "Data da reunião (extenso)" },
  { key: "{{hora}}", desc: "Horário da reunião (extenso)" },
  { key: "{{reuniao_link_google_meet}}", desc: "Link do Google Meet" },
  { key: "{{id_lead}}", desc: "ID do lead" },
];

/* ─── types ─── */

interface Sequence {
  id: string;
  funnel: string;
  step_order: number;
  step_key: string;
  title: string;
  channel: string;
  delay_minutes: number;
  delay_description: string;
  subject: string | null;
  body: string;
  conditions: any;
  active: boolean;
}

interface QueueItem {
  id: string;
  lead_id: string;
  funnel: string;
  step_key: string;
  channel: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  lead_name?: string;
}

/* ─── toolbar helpers ─── */

function insertAtCursor(ref: React.RefObject<HTMLTextAreaElement>, text: string) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const before = el.value.slice(0, start);
  const after = el.value.slice(end);
  el.value = before + text + after;
  el.focus();
  el.setSelectionRange(start + text.length, start + text.length);
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
  el.value = pre + before + selected + after + post;
  el.focus();
  el.setSelectionRange(start + before.length, start + before.length + selected.length);
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
    <PopoverContent className="w-64 p-2" align="start">
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

/* ─── Toolbar ─── */

const MessageToolbar = ({ textareaRef, isEmail }: { textareaRef: React.RefObject<HTMLTextAreaElement>; isEmail: boolean }) => (
  <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5 bg-muted/20">
    {isEmail ? (
      <>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Negrito" onClick={() => wrapSelection(textareaRef, "<b>", "</b>")}><Bold className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Itálico" onClick={() => wrapSelection(textareaRef, "<i>", "</i>")}><Italic className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Título" onClick={() => wrapSelection(textareaRef, '<h2 style="font-size:20px">', "</h2>")}><Type className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Link" onClick={() => { const url = prompt("URL:"); if (url) wrapSelection(textareaRef, `<a href="${url}" style="color:#c8a97e">`, "</a>"); }}><Link2 className="w-3.5 h-3.5" /></Button>
      </>
    ) : (
      <>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="*Negrito*" onClick={() => wrapSelection(textareaRef, "*", "*")}><Bold className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="_Itálico_" onClick={() => wrapSelection(textareaRef, "_", "_")}><Italic className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="~Tachado~" onClick={() => wrapSelection(textareaRef, "~", "~")}><Strikethrough className="w-3.5 h-3.5" /></Button>
      </>
    )}
    <div className="w-px h-5 bg-border mx-0.5" />
    <VariablesPopover textareaRef={textareaRef} />
  </div>
);

/* ─── Sequence card ─── */

const SequenceCard = ({ seq, onUpdate }: { seq: Sequence; onUpdate: () => void }) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(seq.body);
  const [subject, setSubject] = useState(seq.subject || "");
  const [active, setActive] = useState(seq.active);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmail = seq.channel === "email";

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("automation_sequences" as any).update({
      body,
      subject: isEmail ? subject : null,
      active,
    } as any).eq("id", seq.id);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Mensagem salva!");
    setEditing(false);
    onUpdate();
  };

  const handleToggle = async (val: boolean) => {
    setActive(val);
    await supabase.from("automation_sequences" as any).update({ active: val } as any).eq("id", seq.id);
    toast.success(val ? "Ativado" : "Desativado");
    onUpdate();
  };

  return (
    <div className={`rounded-lg border p-3 space-y-2 transition-opacity ${!active ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEmail ? <Mail className="w-4 h-4 text-blue-400" /> : <MessageCircle className="w-4 h-4 text-green-400" />}
          <span className="text-sm font-medium">{seq.title}</span>
          <Badge variant="outline" className="text-[10px] h-5">
            <Clock className="w-3 h-3 mr-1" /> {seq.delay_description}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={active} onCheckedChange={handleToggle} />
        </div>
      </div>

      {!editing ? (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          {isEmail && seq.subject && (
            <p className="text-xs text-muted-foreground mb-1">
              <strong>Assunto:</strong> {seq.subject}
            </p>
          )}
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3 font-mono bg-muted/30 rounded p-2">
            {seq.body.slice(0, 200)}{seq.body.length > 200 ? "..." : ""}
          </pre>
          <p className="text-[10px] text-muted-foreground mt-1">Clique para editar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {isEmail && (
            <Input
              placeholder="Assunto do e-mail"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-sm"
            />
          )}
          <MessageToolbar textareaRef={textareaRef} isEmail={isEmail} />
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setBody(seq.body); setSubject(seq.subject || ""); }}>
              Cancelar
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Funnel Section ─── */

const FunnelSection = ({ funnel, sequences, onUpdate }: {
  funnel: typeof FUNNELS[number];
  sequences: Sequence[];
  onUpdate: () => void;
}) => {
  const Icon = funnel.icon;
  const activeCount = sequences.filter(s => s.active).length;

  // Group by step_key to show WA + Email side by side
  const stepGroups: { key: string; items: Sequence[] }[] = [];
  const seen = new Set<string>();
  for (const s of sequences) {
    if (!seen.has(s.step_key)) {
      seen.add(s.step_key);
      stepGroups.push({ key: s.step_key, items: sequences.filter(x => x.step_key === s.step_key) });
    }
  }

  return (
    <AccordionItem value={funnel.value} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${funnel.color}`} />
          <div className="text-left">
            <p className="text-sm font-semibold">{funnel.label}</p>
            <p className="text-xs text-muted-foreground font-normal">{funnel.description}</p>
          </div>
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {activeCount}/{sequences.length} ativos
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-4">
        {stepGroups.map((group) => (
          <div key={group.key} className="space-y-2">
            {group.items.length > 1 && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">
                {group.items[0].title}
              </p>
            )}
            {group.items.map((seq) => (
              <SequenceCard key={seq.id} seq={seq} onUpdate={onUpdate} />
            ))}
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

/* ─── Queue Monitor ─── */

const QueueMonitor = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("message_queue" as any)
      .select("*, leads!inner(name, phone)")
      .eq("status", filter)
      .order("scheduled_for", { ascending: filter === "pending" })
      .limit(50) as any;
    setQueue(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("queue-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "message_queue" }, () => fetchQueue())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchQueue]);

  const handleCancel = async (id: string) => {
    await supabase.from("message_queue" as any).update({ status: "cancelled" } as any).eq("id", id);
    toast.success("Mensagem cancelada");
    fetchQueue();
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "sent": return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "failed": return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case "cancelled": return <XCircle className="w-3.5 h-3.5 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {["pending", "sent", "failed", "cancelled"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs capitalize"
              onClick={() => setFilter(s)}
            >
              {s === "pending" ? "Pendentes" : s === "sent" ? "Enviadas" : s === "failed" ? "Falhas" : "Canceladas"}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={fetchQueue}>
          <RefreshCw className="w-3 h-3" /> Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
      ) : queue.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma mensagem {filter === "pending" ? "pendente" : filter === "sent" ? "enviada" : filter === "failed" ? "com falha" : "cancelada"}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {queue.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                {statusIcon(item.status)}
                {item.channel === "email" ? <Mail className="w-4 h-4 text-blue-400" /> : <MessageCircle className="w-4 h-4 text-green-400" />}
                <div>
                  <p className="text-sm font-medium">{item.leads?.name || "Lead"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.funnel} · {item.step_key} · {new Date(item.scheduled_for).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              {item.status === "pending" && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleCancel(item.id)}>
                  Cancelar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Sale Notifications Tab ─── */

interface SaleContact {
  id?: string;
  name: string;
  phone: string;
  active: boolean;
}

const SaleNotificationsTab = () => {
  const [contacts, setContacts] = useState<SaleContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase.from("sale_notification_contacts").select("*").order("created_at");
    setContacts((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleAdd = async () => {
    if (!newPhone.trim()) return;
    await supabase.from("sale_notification_contacts").insert({ name: newName.trim() || "Sem nome", phone: newPhone.trim(), active: true });
    setNewName(""); setNewPhone("");
    toast.success("Contato adicionado!");
    fetchContacts();
  };

  const handleToggle = async (contact: SaleContact) => {
    if (!contact.id) return;
    await supabase.from("sale_notification_contacts").update({ active: !contact.active }).eq("id", contact.id);
    fetchContacts();
  };

  const handleDelete = async (contact: SaleContact) => {
    if (!contact.id || !confirm("Excluir este contato?")) return;
    await supabase.from("sale_notification_contacts").delete().eq("id", contact.id);
    toast.success("Contato removido");
    fetchContacts();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cadastre os números que devem receber uma notificação via WhatsApp quando um lead for convertido.
      </p>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Nome (opcional)" value={newName} onChange={(e) => setNewName(e.target.value)} className="sm:w-48" />
            <Input placeholder="(00) 00000-0000" value={newPhone} onChange={(e) => setNewPhone(formatPhone(e.target.value))} className="sm:w-48" maxLength={15} type="tel" />
            <Button onClick={handleAdd} disabled={!newPhone.trim()} size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
          </div>
        </CardContent>
      </Card>
      {contacts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum contato cadastrado.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Contatos ({contacts.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className={`flex items-center justify-between rounded-lg border p-3 ${!c.active ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.phone}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={c.active} onCheckedChange={() => handleToggle(c)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ─── Main component ─── */

const DashMessaging = () => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSequences = useCallback(async () => {
    const { data } = await supabase
      .from("automation_sequences" as any)
      .select("*")
      .order("funnel")
      .order("step_order") as any;
    setSequences(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <Tabs defaultValue="automacoes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="automacoes" className="gap-1.5">
          <Zap className="w-4 h-4" /> Automações
        </TabsTrigger>
        <TabsTrigger value="fila" className="gap-1.5">
          <Send className="w-4 h-4" /> Fila de Envio
        </TabsTrigger>
        <TabsTrigger value="vendas" className="gap-1.5">
          <Trophy className="w-4 h-4" /> Notif. Vendas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="automacoes" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Réguas de comunicação automáticas. Cada funil dispara mensagens por WhatsApp e E-mail baseadas nos eventos do lead.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {sequences.filter(s => s.active).length}/{sequences.length} ativos
          </Badge>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {FUNNELS.map((funnel) => {
            const funnelSeqs = sequences.filter(s => s.funnel === funnel.value);
            if (funnelSeqs.length === 0) return null;
            return (
              <FunnelSection
                key={funnel.value}
                funnel={funnel}
                sequences={funnelSeqs}
                onUpdate={fetchSequences}
              />
            );
          })}
        </Accordion>
      </TabsContent>

      <TabsContent value="fila">
        <QueueMonitor />
      </TabsContent>

      <TabsContent value="vendas">
        <SaleNotificationsTab />
      </TabsContent>
    </Tabs>
  );
};

export default DashMessaging;
