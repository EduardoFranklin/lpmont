import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Save, MessageCircle, Bold, Italic,
  Variable, Strikethrough, Plus, Trash2, Clock,
  Loader2, X, GripVertical, Phone, Users,
  Power, PowerOff,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

/* ─── constants ─── */

const STATUS_STAGES = [
  { value: "novo", label: "Novo Lead", emoji: "🆕", color: "text-blue-500" },
  { value: "agendado", label: "Agendado", emoji: "📅", color: "text-amber-500" },
  { value: "compareceu", label: "Compareceu", emoji: "✅", color: "text-green-500" },
  { value: "nao_compareceu", label: "Não Compareceu", emoji: "❌", color: "text-red-500" },
  { value: "convertido", label: "Convertido", emoji: "🏆", color: "text-emerald-500" },
  { value: "perdido", label: "Perdido", emoji: "💔", color: "text-gray-500" },
];

const VARIABLES = [
  { key: "{{nome}}", desc: "Nome do lead" },
  { key: "{{email}}", desc: "E-mail do lead" },
  { key: "{{telefone}}", desc: "Telefone do lead" },
  { key: "{{tratamento}}", desc: "Dr. / Dra." },
  { key: "{{cidade}}", desc: "Cidade" },
  { key: "{{uf}}", desc: "UF" },
  { key: "{{score}}", desc: "Pontuação do quiz" },
  { key: "{{diagnostico}}", desc: "Diagnóstico do quiz" },
  { key: "{{data}}", desc: "Data da reunião" },
  { key: "{{hora}}", desc: "Horário da reunião" },
  { key: "{{lead_number}}", desc: "Número do lead (#)" },
  { key: "{{status}}", desc: "Status atual do lead" },
];

const DELAY_UNITS = [
  { label: "Min", multiplier: 1 },
  { label: "Hora", multiplier: 60 },
  { label: "Dia", multiplier: 1440 },
];

function minutesToLabel(m: number): string {
  if (m === 0) return "Imediato";
  if (m >= 1440 && m % 1440 === 0) return `${m / 1440} dia${m / 1440 > 1 ? "s" : ""}`;
  if (m >= 60 && m % 60 === 0) return `${m / 60} hora${m / 60 > 1 ? "s" : ""}`;
  return `${m} min`;
}

function minutesToUnit(m: number): { value: number; unit: string } {
  if (m === 0) return { value: 0, unit: "Min" };
  if (m >= 1440 && m % 1440 === 0) return { value: m / 1440, unit: "Dia" };
  if (m >= 60 && m % 60 === 0) return { value: m / 60, unit: "Hora" };
  return { value: m, unit: "Min" };
}

function DelayInput({ minutes, onChange }: { minutes: number; onChange: (m: number) => void }) {
  const parsed = minutesToUnit(minutes);
  const [value, setValue] = useState(String(parsed.value));
  const [unit, setUnit] = useState(parsed.unit);

  const apply = (v: string, u: string) => {
    const num = parseInt(v) || 0;
    const mult = DELAY_UNITS.find(d => d.label === u)?.multiplier || 1;
    onChange(num * mult);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => { setValue(e.target.value); apply(e.target.value, unit); }}
        className="h-8 w-20 text-sm"
        placeholder="0"
      />
      <select
        value={unit}
        onChange={(e) => { setUnit(e.target.value); apply(value, e.target.value); }}
        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
      >
        {DELAY_UNITS.map(u => <option key={u.label} value={u.label}>{u.label}</option>)}
      </select>
    </div>
  );
}

/* ─── toolbar helpers ─── */

function insertAtCursor(ref: React.RefObject<HTMLTextAreaElement>, text: string) {
  const el = ref.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
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
  el.value = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
  el.focus();
  el.setSelectionRange(start + before.length, start + before.length + selected.length);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

const VariablesPopover = ({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="h-7 w-7" title="Variáveis disponíveis">
        <Variable className="w-3.5 h-3.5" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-64 p-2" align="start">
      <p className="text-[10px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wider">Clique para inserir</p>
      {VARIABLES.map((v) => (
        <button key={v.key} onClick={() => insertAtCursor(textareaRef, v.key)} className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted/50 flex justify-between items-center">
          <code className="text-primary font-mono text-[11px]">{v.key}</code>
          <span className="text-muted-foreground text-[10px]">{v.desc}</span>
        </button>
      ))}
    </PopoverContent>
  </Popover>
);

const MessageToolbar = ({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement> }) => (
  <div className="flex items-center gap-0.5 border border-border rounded-md p-0.5 bg-muted/20">
    <Button variant="ghost" size="icon" className="h-7 w-7" title="*Negrito*" onClick={() => wrapSelection(textareaRef, "*", "*")}><Bold className="w-3.5 h-3.5" /></Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="_Itálico_" onClick={() => wrapSelection(textareaRef, "_", "_")}><Italic className="w-3.5 h-3.5" /></Button>
    <Button variant="ghost" size="icon" className="h-7 w-7" title="~Tachado~" onClick={() => wrapSelection(textareaRef, "~", "~")}><Strikethrough className="w-3.5 h-3.5" /></Button>
    <div className="w-px h-5 bg-border mx-0.5" />
    <VariablesPopover textareaRef={textareaRef} />
  </div>
);

/* ─── types ─── */

interface Recipient {
  name: string;
  phone: string;
}

interface TeamSequence {
  id: string;
  trigger_status: string;
  step_order: number;
  title: string;
  channel: string;
  delay_minutes: number;
  delay_description: string;
  subject: string | null;
  body: string;
  recipient_phones: Recipient[];
  active: boolean;
}

/* ─── Recipients Editor ─── */

const RecipientsEditor = ({ recipients, onChange }: { recipients: Recipient[]; onChange: (r: Recipient[]) => void }) => {
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : "";
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const addRecipient = () => {
    const digits = newPhone.replace(/\D/g, "");
    if (digits.length < 10) { toast.error("Telefone inválido"); return; }
    if (!newName.trim()) { toast.error("Preencha o nome"); return; }
    if (recipients.some(r => r.phone === digits)) { toast.error("Telefone já adicionado"); return; }
    onChange([...recipients, { name: newName.trim(), phone: digits }]);
    setNewName("");
    setNewPhone("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium flex items-center gap-1.5">
        <Phone className="w-3 h-3" /> Destinatários da equipe
      </Label>
      <div className="flex flex-wrap gap-1">
        {recipients.map((r, i) => (
          <Badge key={i} variant="outline" className="text-[10px] gap-1 cursor-pointer hover:opacity-70" onClick={() => onChange(recipients.filter((_, j) => j !== i))}>
            {r.name} · {r.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")} <X className="w-2.5 h-2.5" />
          </Badge>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        <Input
          placeholder="Nome"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-7 text-xs w-32"
        />
        <Input
          placeholder="(00) 00000-0000"
          value={newPhone}
          onChange={(e) => setNewPhone(formatPhone(e.target.value))}
          className="h-7 text-xs w-40"
          maxLength={15}
          onKeyDown={(e) => { if (e.key === "Enter") addRecipient(); }}
        />
        <Button size="sm" className="h-7 px-2 text-xs" onClick={addRecipient} disabled={!newPhone.trim() || !newName.trim()}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

/* ─── Sequence Card ─── */

const TeamSequenceCard = ({
  seq, onUpdate, onDelete, dragHandleProps,
}: {
  seq: TeamSequence;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  dragHandleProps: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
}) => {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(seq.body);
  const [active, setActive] = useState(seq.active);
  const [delayMinutes, setDelayMinutes] = useState(seq.delay_minutes);
  const [recipients, setRecipients] = useState<Recipient[]>(seq.recipient_phones || []);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("team_automation_sequences" as any).update({
      body,
      active,
      delay_minutes: delayMinutes,
      delay_description: minutesToLabel(delayMinutes),
      recipient_phones: recipients,
    } as any).eq("id", seq.id);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar"); return; }
    toast.success("Mensagem salva!");
    setEditing(false);
    onUpdate();
  };

  const handleToggle = async (val: boolean) => {
    setActive(val);
    await supabase.from("team_automation_sequences" as any).update({ active: val } as any).eq("id", seq.id);
    toast.success(val ? "Ativado" : "Desativado");
    onUpdate();
  };

  const handleDelayChange = async (m: number) => {
    setDelayMinutes(m);
    await supabase.from("team_automation_sequences" as any).update({
      delay_minutes: m,
      delay_description: minutesToLabel(m),
    } as any).eq("id", seq.id);
    onUpdate();
  };

  return (
    <div className={`rounded-lg border p-3 space-y-2 transition-all ${!active ? "opacity-50" : ""} hover:shadow-sm`} {...dragHandleProps}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
          <MessageCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">{seq.title}</span>
          {recipients.length > 0 && (
            <Badge variant="outline" className="text-[10px] gap-0.5">
              <Users className="w-2.5 h-2.5" /> {recipients.map(r => r.name).join(", ")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Switch checked={active} onCheckedChange={handleToggle} />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive" onClick={() => { if (confirm(`Excluir "${seq.title}"?`)) onDelete(seq.id); }}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1 bg-muted/20">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Espera:</span>
          <DelayInput minutes={delayMinutes} onChange={handleDelayChange} />
        </div>
      </div>

      {!editing ? (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3 font-mono bg-muted/30 rounded p-2">
            {seq.body.slice(0, 200)}{seq.body.length > 200 ? "..." : ""}
          </pre>
          <p className="text-[10px] text-muted-foreground mt-1">Clique para editar</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Tempo de espera:</Label>
            <DelayInput minutes={delayMinutes} onChange={setDelayMinutes} />
          </div>

          <MessageToolbar textareaRef={textareaRef} />
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          />

          <RecipientsEditor recipients={recipients} onChange={setRecipients} />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setBody(seq.body); setDelayMinutes(seq.delay_minutes); setRecipients(seq.recipient_phones || []); }}>
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

/* ─── Add Message Dialog ─── */

const AddTeamMessageDialog = ({ triggerStatus, existingCount, onAdded }: { triggerStatus: string; existingCount: number; onAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Preencha título e corpo"); return; }
    if (recipients.length === 0) { toast.error("Adicione pelo menos um destinatário"); return; }
    setSaving(true);
    const { error } = await supabase.from("team_automation_sequences" as any).insert({
      trigger_status: triggerStatus,
      step_order: existingCount + 1,
      title: title.trim(),
      channel: "whatsapp",
      delay_minutes: delayMinutes,
      delay_description: minutesToLabel(delayMinutes),
      body: body.trim(),
      recipient_phones: recipients,
      active: true,
    } as any);
    setSaving(false);
    if (error) { toast.error("Erro ao criar mensagem"); return; }
    toast.success("Mensagem adicionada!");
    setOpen(false);
    setTitle(""); setBody(""); setRecipients([]);
    onAdded();
  };

  const stage = STATUS_STAGES.find(s => s.value === triggerStatus);

  return (
    <>
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 w-full border-dashed" onClick={() => setOpen(true)}>
        <Plus className="w-3 h-3" /> Adicionar notificação para equipe
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Nova notificação — {stage?.emoji} {stage?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Aviso de novo lead" className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Tempo de espera após mudança de status</Label>
              <div className="mt-1">
                <DelayInput minutes={delayMinutes} onChange={setDelayMinutes} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Corpo da mensagem</Label>
              <MessageToolbar textareaRef={textareaRef} />
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono mt-1"
                placeholder="Escreva a notificação aqui..."
              />
            </div>
            <RecipientsEditor recipients={recipients} onChange={setRecipients} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Criar notificação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ─── Stage Section ─── */

const StageSection = ({ stage, sequences, onUpdate }: {
  stage: typeof STATUS_STAGES[0];
  sequences: TeamSequence[];
  onUpdate: () => void;
}) => {
  const activeCount = sequences.filter(s => s.active).length;
  const allActive = sequences.length > 0 && activeCount === sequences.length;
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [orderedSeqs, setOrderedSeqs] = useState(sequences);

  useEffect(() => { setOrderedSeqs(sequences); }, [sequences]);

  const handleBulkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = !allActive;
    for (const seq of sequences) {
      await supabase.from("team_automation_sequences" as any).update({ active: newVal } as any).eq("id", seq.id);
    }
    toast.success(newVal ? "Estágio ativado" : "Estágio desativado");
    onUpdate();
  };

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = () => (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (targetIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newOrder = [...orderedSeqs];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, moved);
    setOrderedSeqs(newOrder);
    setDragIdx(null);
    await Promise.all(newOrder.map((seq, i) =>
      supabase.from("team_automation_sequences" as any).update({ step_order: i + 1 } as any).eq("id", seq.id)
    ));
    toast.success("Ordem atualizada!");
    onUpdate();
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleDelete = async (id: string) => {
    await supabase.from("team_automation_sequences" as any).delete().eq("id", id);
    toast.success("Notificação excluída");
    onUpdate();
  };

  return (
    <AccordionItem value={stage.value} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3 w-full">
          <span className="text-xl">{stage.emoji}</span>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">{stage.label}</p>
            <p className="text-xs text-muted-foreground font-normal">
              Notificações para a equipe quando lead muda para "{stage.label}"
            </p>
          </div>
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {sequences.length === 0 ? "Sem notificações" : `${activeCount}/${sequences.length} ativos`}
          </Badge>
          {sequences.length > 0 && (
            <Button
              variant={allActive ? "default" : "outline"}
              size="sm"
              className={`h-6 text-[10px] px-2 gap-1 ml-1 ${allActive ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"}`}
              onClick={handleBulkToggle}
            >
              {allActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
              {allActive ? "ON" : "OFF"}
            </Button>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-2">
        {orderedSeqs.map((seq, idx) => (
          <TeamSequenceCard
            key={seq.id}
            seq={seq}
            onUpdate={onUpdate}
            onDelete={handleDelete}
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart(idx),
              onDragOver: handleDragOver(),
              onDrop: handleDrop(idx),
              onDragEnd: handleDragEnd,
            }}
          />
        ))}
        <AddTeamMessageDialog triggerStatus={stage.value} existingCount={orderedSeqs.length} onAdded={onUpdate} />
      </AccordionContent>
    </AccordionItem>
  );
};

/* ─── Main component ─── */

const DashTeamMessaging = () => {
  const [sequences, setSequences] = useState<TeamSequence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSequences = useCallback(async () => {
    const { data } = await supabase
      .from("team_automation_sequences" as any)
      .select("*")
      .order("trigger_status")
      .order("step_order") as any;
    setSequences((data || []).map((s: any) => ({
      ...s,
      recipient_phones: Array.isArray(s.recipient_phones) ? s.recipient_phones : [],
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Configure notificações automáticas via WhatsApp para membros da equipe quando leads mudarem de estágio no Kanban.
        </p>
        <Badge variant="outline" className="text-xs">
          {sequences.filter(s => s.active).length}/{sequences.length} ativos
        </Badge>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {STATUS_STAGES.map((stage) => {
          const stageSeqs = sequences.filter(s => s.trigger_status === stage.value);
          return (
            <StageSection key={stage.value} stage={stage} sequences={stageSeqs} onUpdate={fetchSequences} />
          );
        })}
      </Accordion>
    </div>
  );
};

export default DashTeamMessaging;
