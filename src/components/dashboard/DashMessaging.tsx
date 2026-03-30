import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Save, MessageCircle, Mail, Bold, Italic, Link2, Type,
  Variable, Strikethrough, Plus, Trash2, Clock, Trophy, Phone,
  Zap, Users, ShoppingCart, GraduationCap,
  Send, CheckCircle2, XCircle, Loader2, RefreshCw, X,
  GripVertical, Tag, Power, PowerOff, ChevronRight, Settings2,
} from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

/* ─── constants ─── */

const DEFAULT_FUNNELS = [
  { value: "F1", label: "F1 — Reunião com Consultor", icon: Users, color: "text-blue-500", description: "Confirmação, lembretes e follow-up pós-reunião" },
  { value: "F2", label: "F2 — Quiz de Diagnóstico", icon: Zap, color: "text-amber-500", description: "Diagnósticos A/B/C + recuperação de abandono" },
  { value: "F3", label: "F3 — Tráfego Direto", icon: ShoppingCart, color: "text-emerald-500", description: "Retargeting, abandono de checkout, objeções" },
  { value: "F4", label: "F4 — Pós-Compra (Onboarding)", icon: GraduationCap, color: "text-purple-500", description: "Boas-vindas, engajamento, reengajamento" },
];

const FUNNEL_ICONS = [
  { icon: Users, label: "Pessoas", color: "text-blue-500" },
  { icon: Zap, label: "Automação", color: "text-amber-500" },
  { icon: ShoppingCart, label: "Vendas", color: "text-emerald-500" },
  { icon: GraduationCap, label: "Educação", color: "text-purple-500" },
  { icon: Trophy, label: "Conquista", color: "text-yellow-500" },
  { icon: Mail, label: "Email", color: "text-sky-500" },
  { icon: MessageCircle, label: "Chat", color: "text-green-500" },
  { icon: Phone, label: "Telefone", color: "text-orange-500" },
];

const VARIABLES = [
  { key: "{{nome}}", desc: "Nome do lead" },
  { key: "{{email}}", desc: "E-mail do lead" },
  { key: "{{telefone}}", desc: "Telefone" },
  { key: "{{tratamento}}", desc: "Dr. / Dra." },
  { key: "{{cidade}}", desc: "Cidade" },
  { key: "{{score}}", desc: "Pontuação do quiz" },
  { key: "{{data}}", desc: "Data da reunião" },
  { key: "{{hora}}", desc: "Horário da reunião" },
  { key: "{{reuniao_link_google_meet}}", desc: "Link do Google Meet" },
  { key: "{{id_lead}}", desc: "ID do lead" },
];

const AVAILABLE_TAGS = [
  "pagou", "comprador", "reembolso", "chargeback",
  "reuniao_agendada", "reuniao_confirmada", "reuniao_nao_compareceu",
  "quiz_concluido", "quiz_abandonou",
  "abandonou_checkout", "visitou_site", "visitou_pagina_vendas",
  "clicou_falar_equipe", "cupom_enviado",
  "wa_sem_resposta_1", "wa_sem_resposta_2", "wa_sem_resposta_3",
  "onboarding_pendente", "onboarding_completo",
  "boleto_impresso", "compra_expirada", "entrou_no_curso", "modulo_concluido",
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

/* ─── Variables popover ─── */

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

/* ─── Conditions Editor ─── */

const ConditionsEditor = ({ conditions, onChange }: { conditions: any; onChange: (c: any) => void }) => {
  const cond = conditions || {};
  const requiredTags: string[] = cond.required_tags || [];
  const excludedTags: string[] = cond.excluded_tags || [];
  const [customReq, setCustomReq] = useState("");
  const [customExc, setCustomExc] = useState("");

  const addTag = (type: "required_tags" | "excluded_tags", tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    const list = [...(cond[type] || [])];
    if (!list.includes(t)) {
      list.push(t);
      onChange({ ...cond, [type]: list });
    }
  };

  const removeTag = (type: "required_tags" | "excluded_tags", tag: string) => {
    const list = (cond[type] || []).filter((t: string) => t !== tag);
    onChange({ ...cond, [type]: list });
  };

  const usedTags = new Set([...requiredTags, ...excludedTags]);
  const availableTags = AVAILABLE_TAGS.filter(t => !usedTags.has(t));

  const TagSection = ({ type, label, icon, tags, color, custom, setCustom }: {
    type: "required_tags" | "excluded_tags"; label: string; icon: string;
    tags: string[]; color: string; custom: string; setCustom: (v: string) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </Label>
      <div className="flex flex-wrap gap-1 items-center">
        {tags.map(tag => (
          <Badge key={tag} variant="outline" className={`text-[10px] gap-1 cursor-pointer hover:opacity-70 ${color}`} onClick={() => removeTag(type, tag)}>
            {tag} <X className="w-2.5 h-2.5" />
          </Badge>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 text-[10px] px-1.5 gap-0.5">
              <Plus className="w-2.5 h-2.5" /> Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2 space-y-2" align="start">
            <div className="flex gap-1">
              <Input
                placeholder="Tag personalizada..."
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="h-7 text-xs"
                onKeyDown={(e) => { if (e.key === "Enter") { addTag(type, custom); setCustom(""); }}}
              />
              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { addTag(type, custom); setCustom(""); }} disabled={!custom.trim()}>
                +
              </Button>
            </div>
            {availableTags.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-0.5">
                {availableTags.map(tag => (
                  <button key={tag} onClick={() => addTag(type, tag)} className="w-full text-left px-2 py-1 rounded text-xs hover:bg-muted/50 truncate">
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border">
      <TagSection type="required_tags" label="Lead DEVE ter" icon="✓" tags={requiredTags}
        color="bg-emerald-500/10 text-emerald-600 border-emerald-500/30" custom={customReq} setCustom={setCustomReq} />
      <div className="border-t border-border" />
      <TagSection type="excluded_tags" label="Lead NÃO pode ter" icon="✕" tags={excludedTags}
        color="bg-red-500/10 text-red-500 border-red-500/30" custom={customExc} setCustom={setCustomExc} />
    </div>
  );
};

/* ─── Sequence card (with drag, delay edit, conditions) ─── */

const SequenceCard = ({
  seq, onUpdate, onDelete,
  dragHandleProps,
}: {
  seq: Sequence;
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
  const [subject, setSubject] = useState(seq.subject || "");
  const [active, setActive] = useState(seq.active);
  const [delayMinutes, setDelayMinutes] = useState(seq.delay_minutes);
  const [conditions, setConditions] = useState<any>(seq.conditions);
  const [showConditions, setShowConditions] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEmail = seq.channel === "email";

  const condTags = conditions || {};
  const hasConditions = (condTags.required_tags?.length > 0) || (condTags.excluded_tags?.length > 0);

  const handleSave = async () => {
    setSaving(true);
    const delayDesc = minutesToLabel(delayMinutes);
    const { error } = await supabase.from("automation_sequences" as any).update({
      body,
      subject: isEmail ? subject : null,
      active,
      delay_minutes: delayMinutes,
      delay_description: delayDesc,
      conditions,
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

  const handleDeleteClick = () => {
    if (confirm(`Excluir "${seq.title}"? Esta ação não pode ser desfeita.`)) {
      onDelete(seq.id);
    }
  };

  return (
    <div
      className={`rounded-lg border p-3 space-y-2 transition-all ${!active ? "opacity-50" : ""} hover:shadow-sm`}
      {...dragHandleProps}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
          {isEmail ? <Mail className="w-4 h-4 text-blue-400" /> : <MessageCircle className="w-4 h-4 text-green-400" />}
          <span className="text-sm font-medium">{seq.title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Delay badge - clickable to edit */}
          {!editing ? (
            <Badge
              variant="outline"
              className="text-[10px] h-5 cursor-pointer hover:bg-muted/50"
              onClick={() => setEditing(true)}
            >
              <Clock className="w-3 h-3 mr-1" /> {minutesToLabel(delayMinutes)}
            </Badge>
          ) : null}
          {!editing && (
            <div className="flex flex-wrap gap-1 mt-1">
              {/* Always show safety conditions */}
              {condTags.required_tags?.map((t: string) => (
                <Badge key={`req-${t}`} variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  ✓ {t}
                </Badge>
              ))}
              {condTags.excluded_tags?.map((t: string) => (
                <Badge key={`exc-${t}`} variant="outline" className="text-[10px] h-5 bg-red-500/10 text-red-500 border-red-500/30">
                  ✕ {t}
                </Badge>
              ))}
              {!hasConditions && (
                <Badge variant="outline" className="text-[10px] h-5 bg-amber-500/10 text-amber-600 border-amber-500/30">
                  ⚠ Sem filtro de tags
                </Badge>
              )}
            </div>
          )}
          <Switch checked={active} onCheckedChange={handleToggle} />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive" onClick={handleDeleteClick}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* View mode */}
      {!editing ? (
        <div className="cursor-pointer" onClick={() => setEditing(true)}>
          {isEmail && seq.subject && (
            <p className="text-xs text-muted-foreground mb-1"><strong>Assunto:</strong> {seq.subject}</p>
          )}
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3 font-mono bg-muted/30 rounded p-2">
            {seq.body.slice(0, 200)}{seq.body.length > 200 ? "..." : ""}
          </pre>
          <p className="text-[10px] text-muted-foreground mt-1">Clique para editar</p>
        </div>
      ) : (
        /* Edit mode */
        <div className="space-y-3">
          {/* Delay editor */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Tempo de espera:</Label>
            <DelayInput minutes={delayMinutes} onChange={setDelayMinutes} />
          </div>

          {/* Subject for email */}
          {isEmail && (
            <Input placeholder="Assunto do e-mail" value={subject} onChange={(e) => setSubject(e.target.value)} className="text-sm" />
          )}

          {/* Body toolbar + textarea */}
          <MessageToolbar textareaRef={textareaRef} isEmail={isEmail} />
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          />

          {/* Conditions toggle */}
          <div>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowConditions(!showConditions)}>
              <Settings2 className="w-3 h-3" />
              Condições (Tags)
              <ChevronRight className={`w-3 h-3 transition-transform ${showConditions ? "rotate-90" : ""}`} />
            </Button>
          </div>
          {showConditions && <ConditionsEditor conditions={conditions} onChange={setConditions} />}

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setBody(seq.body); setSubject(seq.subject || ""); setDelayMinutes(seq.delay_minutes); setConditions(seq.conditions); }}>
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

const AddMessageDialog = ({ funnel, existingCount, onAdded }: { funnel: string; existingCount: number; onAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [delayMinutes, setDelayMinutes] = useState(60);
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Preencha título e corpo"); return; }
    setSaving(true);
    const stepKey = `${funnel.toLowerCase()}_custom_${Date.now()}`;
    const { error } = await supabase.from("automation_sequences" as any).insert({
      funnel,
      step_order: existingCount + 1,
      step_key: stepKey,
      title: title.trim(),
      channel,
      delay_minutes: delayMinutes,
      delay_description: minutesToLabel(delayMinutes),
      subject: channel === "email" ? subject : null,
      body: body.trim(),
      conditions: null,
      active: true,
    } as any);
    setSaving(false);
    if (error) { toast.error("Erro ao criar mensagem"); return; }
    toast.success("Mensagem adicionada!");
    setOpen(false);
    setTitle(""); setBody(""); setSubject("");
    onAdded();
  };

  return (
    <>
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 w-full border-dashed" onClick={() => setOpen(true)}>
        <Plus className="w-3 h-3" /> Adicionar mensagem ao funil
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Nova mensagem — {funnel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Lembrete D+3" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Canal</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Tempo de espera</Label>
              <div className="mt-1">
                <DelayInput minutes={delayMinutes} onChange={setDelayMinutes} />
              </div>
            </div>
            {channel === "email" && (
              <div>
                <Label className="text-xs">Assunto</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto do e-mail" className="text-sm" />
              </div>
            )}
            <div>
              <Label className="text-xs">Corpo da mensagem</Label>
              <MessageToolbar textareaRef={textareaRef} isEmail={channel === "email"} />
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono mt-1"
                placeholder="Escreva a mensagem aqui..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">Cancelar</Button>
            </DialogClose>
            <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Criar mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ─── Add Funnel Dialog ─── */

const AddFunnelDialog = ({ existingFunnels, onAdded }: { existingFunnels: string[]; onAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [funnelCode, setFunnelCode] = useState("");
  const [funnelLabel, setFunnelLabel] = useState("");
  const [funnelDesc, setFunnelDesc] = useState("");
  const [iconIdx, setIconIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const code = funnelCode.trim().toUpperCase();
    if (!code || !funnelLabel.trim()) { toast.error("Preencha código e nome do fluxo"); return; }
    if (existingFunnels.includes(code)) { toast.error("Já existe um fluxo com esse código"); return; }
    setSaving(true);
    const { error } = await supabase.from("automation_sequences" as any).insert({
      funnel: code,
      step_order: 1,
      step_key: `${code.toLowerCase()}_msg_1`,
      title: `${funnelLabel.trim()} — Mensagem 1`,
      channel: "whatsapp",
      delay_minutes: 0,
      delay_description: "Imediato",
      subject: null,
      body: "Olá {{nome}}, ...",
      conditions: null,
      active: false,
    } as any);
    setSaving(false);
    if (error) { toast.error("Erro ao criar fluxo"); return; }
    await supabase.from("site_settings").upsert({
      key: `funnel_meta_${code}`,
      value: JSON.stringify({ label: funnelLabel.trim(), description: funnelDesc.trim(), iconIdx }),
    }, { onConflict: "key" });
    toast.success(`Fluxo ${code} criado!`);
    setOpen(false);
    setFunnelCode(""); setFunnelLabel(""); setFunnelDesc("");
    onAdded();
  };

  return (
    <>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" /> Novo Fluxo
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Criar novo fluxo de automação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Código (ex: F5, REENG)</Label>
                <Input value={funnelCode} onChange={(e) => setFunnelCode(e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="F5" className="text-sm" maxLength={10} />
              </div>
              <div>
                <Label className="text-xs">Ícone</Label>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {FUNNEL_ICONS.map((fi, i) => (
                    <Button key={i} variant={iconIdx === i ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setIconIdx(i)} title={fi.label}>
                      <fi.icon className={`w-4 h-4 ${iconIdx === i ? "" : fi.color}`} />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">Nome do fluxo</Label>
              <Input value={funnelLabel} onChange={(e) => setFunnelLabel(e.target.value)} placeholder="Ex: F5 — Reengajamento" className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Descrição (opcional)</Label>
              <Input value={funnelDesc} onChange={(e) => setFunnelDesc(e.target.value)} placeholder="Breve descrição do objetivo" className="text-sm" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving || !funnelCode.trim() || !funnelLabel.trim()}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Criar fluxo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ─── Funnel Section (with drag-and-drop, bulk toggle, delete funnel) ─── */

const FunnelSection = ({ funnel, sequences, onUpdate }: {
  funnel: typeof FUNNELS[number];
  sequences: Sequence[];
  onUpdate: () => void;
}) => {
  const Icon = funnel.icon;
  const activeCount = sequences.filter(s => s.active).length;
  const allActive = activeCount === sequences.length;
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [orderedSeqs, setOrderedSeqs] = useState(sequences);

  useEffect(() => { setOrderedSeqs(sequences); }, [sequences]);

  // Bulk toggle all messages in funnel
  const handleBulkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = !allActive;
    const ids = sequences.map(s => s.id);
    for (const id of ids) {
      await supabase.from("automation_sequences" as any).update({ active: newVal } as any).eq("id", id);
    }
    toast.success(newVal ? `Funil ${funnel.value} ativado` : `Funil ${funnel.value} desativado`);
    onUpdate();
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleDragOver = (_idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (targetIdx: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;

    const newOrder = [...orderedSeqs];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, moved);
    setOrderedSeqs(newOrder);
    setDragIdx(null);

    // Persist new order
    const updates = newOrder.map((seq, i) =>
      supabase.from("automation_sequences" as any).update({ step_order: i + 1 } as any).eq("id", seq.id)
    );
    await Promise.all(updates);
    toast.success("Ordem atualizada!");
    onUpdate();
  };

  const handleDragEnd = () => setDragIdx(null);

  const handleDelete = async (id: string) => {
    await supabase.from("automation_sequences" as any).delete().eq("id", id);
    toast.success("Mensagem excluída");
    onUpdate();
  };

  return (
    <AccordionItem value={funnel.value} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3 w-full">
          <Icon className={`w-5 h-5 ${funnel.color}`} />
          <div className="text-left flex-1">
            <p className="text-sm font-semibold">{funnel.label}</p>
            <p className="text-xs text-muted-foreground font-normal">{funnel.description}</p>
          </div>
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {activeCount}/{sequences.length} ativos
          </Badge>
          <Button
            variant={allActive ? "default" : "outline"}
            size="sm"
            className={`h-6 text-[10px] px-2 gap-1 ml-1 ${allActive ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"}`}
            onClick={handleBulkToggle}
            title={allActive ? "Desativar funil inteiro" : "Ativar funil inteiro"}
          >
            {allActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
            {allActive ? "ON" : "OFF"}
          </Button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 space-y-2">
        {orderedSeqs.map((seq, idx) => (
          <SequenceCard
            key={seq.id}
            seq={seq}
            onUpdate={onUpdate}
            onDelete={handleDelete}
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart(idx),
              onDragOver: handleDragOver(idx),
              onDrop: handleDrop(idx),
              onDragEnd: handleDragEnd,
            }}
          />
        ))}
        <AddMessageDialog funnel={funnel.value} existingCount={orderedSeqs.length} onAdded={onUpdate} />
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
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" className="h-7 text-xs capitalize" onClick={() => setFilter(s)}>
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
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
          Nenhuma mensagem {filter === "pending" ? "pendente" : filter === "sent" ? "enviada" : filter === "failed" ? "com falha" : "cancelada"}.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {queue.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                {statusIcon(item.status)}
                {item.channel === "email" ? <Mail className="w-4 h-4 text-blue-400" /> : <MessageCircle className="w-4 h-4 text-green-400" />}
                <div>
                  <p className="text-sm font-medium">{item.leads?.name || "Lead"}</p>
                  <p className="text-xs text-muted-foreground">{item.funnel} · {item.step_key} · {new Date(item.scheduled_for).toLocaleString("pt-BR")}</p>
                </div>
              </div>
              {item.status === "pending" && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleCancel(item.id)}>Cancelar</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Contact Row with inline edit ─── */

interface SaleContact { id?: string; name: string; phone: string; active: boolean; }

const ContactRow = ({ contact: c, onToggle, onDelete, onUpdate }: {
  contact: SaleContact;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.name);
  const [phone, setPhone] = useState(c.phone);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!c.id || !phone.trim()) return;
    setSaving(true);
    await supabase.from("sale_notification_contacts").update({ name: name.trim(), phone: phone.trim() }).eq("id", c.id);
    setSaving(false);
    setEditing(false);
    toast.success("Contato atualizado");
    onUpdate();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 p-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="h-8 text-sm flex-1" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" className="h-8 text-sm w-40" />
        <Button size="sm" className="h-8 gap-1" onClick={handleSave} disabled={saving || !phone.trim()}>
          <Save className="w-3 h-3" /> {saving ? "..." : "Salvar"}
        </Button>
        <Button size="sm" variant="ghost" className="h-8" onClick={() => { setName(c.name); setPhone(c.phone); setEditing(false); }}>Cancelar</Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${!c.active ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setEditing(true)}>
        <Phone className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{c.name || "Sem nome"}</p>
          <p className="text-xs text-muted-foreground">{c.phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={c.active} onCheckedChange={onToggle} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
};

/* ─── Sale Notifications Tab ─── */

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

  const handleToggle = async (c: SaleContact) => {
    if (!c.id) return;
    await supabase.from("sale_notification_contacts").update({ active: !c.active }).eq("id", c.id);
    fetchContacts();
  };

  const handleDelete = async (c: SaleContact) => {
    if (!c.id || !confirm("Excluir este contato?")) return;
    await supabase.from("sale_notification_contacts").delete().eq("id", c.id);
    toast.success("Contato removido");
    fetchContacts();
  };

  if (loading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Cadastre os números que devem receber uma notificação via WhatsApp quando um lead efetuar o pagamento.</p>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar contato</CardTitle></CardHeader>
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
              <ContactRow key={c.id} contact={c} onToggle={() => handleToggle(c)} onDelete={() => handleDelete(c)} onUpdate={fetchContacts} />
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
        <TabsTrigger value="automacoes" className="gap-1.5"><Zap className="w-4 h-4" /> Automações</TabsTrigger>
        <TabsTrigger value="fila" className="gap-1.5"><Send className="w-4 h-4" /> Fila de Envio</TabsTrigger>
        <TabsTrigger value="vendas" className="gap-1.5"><Trophy className="w-4 h-4" /> Notif. Vendas</TabsTrigger>
      </TabsList>

      <TabsContent value="automacoes" className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Arraste para reordenar. Clique no botão ON/OFF do funil para ativar/desativar todas as mensagens de uma vez.
          </p>
          <Badge variant="outline" className="text-xs">
            {sequences.filter(s => s.active).length}/{sequences.length} ativos
          </Badge>
        </div>
        <Accordion type="multiple" className="space-y-2">
          {FUNNELS.map((funnel) => {
            const funnelSeqs = sequences.filter(s => s.funnel === funnel.value);
            if (funnelSeqs.length === 0) return (
              <AccordionItem key={funnel.value} value={funnel.value} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <funnel.icon className={`w-5 h-5 ${funnel.color}`} />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{funnel.label}</p>
                      <p className="text-xs text-muted-foreground font-normal">{funnel.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-[10px]">Vazio</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <AddMessageDialog funnel={funnel.value} existingCount={0} onAdded={fetchSequences} />
                </AccordionContent>
              </AccordionItem>
            );
            return (
              <FunnelSection key={funnel.value} funnel={funnel} sequences={funnelSeqs} onUpdate={fetchSequences} />
            );
          })}
        </Accordion>
      </TabsContent>

      <TabsContent value="fila"><QueueMonitor /></TabsContent>
      <TabsContent value="vendas"><SaleNotificationsTab /></TabsContent>
    </Tabs>
  );
};

export default DashMessaging;
