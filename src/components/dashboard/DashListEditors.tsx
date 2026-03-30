import { useState, useRef } from "react";
import defaults from "@/lib/siteContentDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GripVertical, ChevronDown, Plus, Trash2, Image as ImageIcon,
  HelpCircle, MessageCircle, Heart
} from "lucide-react";
import ImageUploadCrop from "./ImageUploadCrop";

/* ─── Generic draggable list item ─── */
function DragListItem({
  children,
  index,
  title,
  subtitle,
  thumbnail,
  badge,
  isOpen,
  onToggle,
  onDelete,
  dragProps,
  isDragging,
  isOver,
}: {
  children: React.ReactNode;
  index: number;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  dragProps: Record<string, any>;
  isDragging: boolean;
  isOver: boolean;
}) {
  return (
    <div
      {...dragProps}
      className={`rounded-xl border transition-all ${
        isDragging ? "opacity-40 scale-[0.98]" : ""
      } ${isOver ? "border-primary/40 bg-primary/5" : "border-border"} ${
        isOpen ? "bg-muted/30" : "hover:bg-muted/20"
      }`}
    >
      <div
        className="flex items-center gap-2 px-3 py-3 cursor-grab active:cursor-grabbing select-none"
        onClick={onToggle}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {thumbnail !== undefined && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted border border-border">
            {thumbnail ? (
              <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
        {badge && (
          <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{badge}</span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title || `Item ${index + 1}`}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-4" onClick={(e) => e.stopPropagation()}>
          {children}
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Drag hook (inline) ─── */
function useDragList(
  items: any[],
  onReorder: (reordered: any[]) => void
) {
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const getDragProps = (idx: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      dragItem.current = idx;
      setDragIdx(idx);
    },
    onDragEnter: () => {
      dragOver.current = idx;
      setOverIdx(idx);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnd: () => {
      if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
        const reordered = [...items];
        const [removed] = reordered.splice(dragItem.current, 1);
        reordered.splice(dragOver.current, 0, removed);
        onReorder(reordered);
      }
      dragItem.current = null;
      dragOver.current = null;
      setDragIdx(null);
      setOverIdx(null);
    },
    onDragLeave: () => {
      if (overIdx === idx) setOverIdx(null);
    },
  });

  return { getDragProps, dragIdx, overIdx };
}

/* ═══════════════════════════════════════════
   FAQ Editor
   ═══════════════════════════════════════════ */
export function DashFAQEditor({
  content,
  updateField,
}: {
  content: Record<string, Record<string, string>>;
  updateField: (section: string, key: string, value: string) => void;
}) {
  const sc = content.faq ?? defaults.faq ?? {};
  const items: { q: string; a: string }[] = (() => {
    try { return JSON.parse(sc.items); } catch { return []; }
  })();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const setItems = (newItems: { q: string; a: string }[]) => {
    updateField("faq", "items", JSON.stringify(newItems));
  };

  const { getDragProps, dragIdx, overIdx } = useDragList(items, setItems);

  const update = (idx: number, field: "q" | "a", value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const add = () => {
    setItems([...items, { q: "", a: "" }]);
    setOpenIdx(items.length);
  };

  const remove = (idx: number) => {
    if (!confirm("Excluir esta pergunta?")) return;
    setItems(items.filter((_, i) => i !== idx));
    setOpenIdx(null);
  };

  return (
    <div className="space-y-4">
      {/* Header fields */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cabeçalho da Seção</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Etiqueta</label>
            <Input value={sc.caption || ""} onChange={(e) => updateField("faq", "caption", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título</label>
            <Input value={sc.title || ""} onChange={(e) => updateField("faq", "title", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Subtítulo</label>
            <Input value={sc.subtitle || ""} onChange={(e) => updateField("faq", "subtitle", e.target.value)} className="text-sm mt-1" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{items.length} perguntas • Arraste para reordenar</p>
        <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nova pergunta
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <DragListItem
            key={i}
            index={i}
            title={item.q || `Pergunta ${i + 1}`}
            badge={String(i + 1).padStart(2, "0")}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onDelete={() => remove(i)}
            dragProps={getDragProps(i)}
            isDragging={dragIdx === i}
            isOver={overIdx === i && dragIdx !== null && dragIdx !== i}
          >
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Pergunta</label>
              <Input value={item.q} onChange={(e) => update(i, "q", e.target.value)} className="text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Resposta</label>
              <Textarea value={item.a} onChange={(e) => update(i, "a", e.target.value)} rows={3} className="text-sm mt-1" />
            </div>
          </DragListItem>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Testimonials Editor
   ═══════════════════════════════════════════ */
export function DashTestimonialsEditor({
  content,
  updateField,
}: {
  content: Record<string, Record<string, string>>;
  updateField: (section: string, key: string, value: string) => void;
}) {
  const sc = content.testimonials ?? defaults.testimonials ?? {};
  const items: { name: string; text: string; role: string; avatar: string }[] = (() => {
    try { return JSON.parse(sc.items); } catch { return []; }
  })();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const setItems = (newItems: typeof items) => {
    updateField("testimonials", "items", JSON.stringify(newItems));
  };

  const { getDragProps, dragIdx, overIdx } = useDragList(items, setItems);

  const update = (idx: number, field: string, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const add = () => {
    setItems([...items, { name: "", text: "", role: "", avatar: "" }]);
    setOpenIdx(items.length);
  };

  const remove = (idx: number) => {
    if (!confirm("Excluir este depoimento?")) return;
    setItems(items.filter((_, i) => i !== idx));
    setOpenIdx(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cabeçalho da Seção</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Etiqueta</label>
            <Input value={sc.caption || ""} onChange={(e) => updateField("testimonials", "caption", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título</label>
            <Input value={sc.title || ""} onChange={(e) => updateField("testimonials", "title", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Subtítulo</label>
            <Input value={sc.subtitle || ""} onChange={(e) => updateField("testimonials", "subtitle", e.target.value)} className="text-sm mt-1" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{items.length} depoimentos • Arraste para reordenar</p>
        <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo depoimento
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <DragListItem
            key={i}
            index={i}
            title={item.name || `Depoimento ${i + 1}`}
            subtitle={item.role}
            thumbnail={item.avatar}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onDelete={() => remove(i)}
            dragProps={getDragProps(i)}
            isDragging={dragIdx === i}
            isOver={overIdx === i && dragIdx !== null && dragIdx !== i}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Nome</label>
                <Input value={item.name} onChange={(e) => update(i, "name", e.target.value)} className="text-sm mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Cargo / Localização</label>
                <Input value={item.role} onChange={(e) => update(i, "role", e.target.value)} className="text-sm mt-1" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Depoimento</label>
              <Textarea value={item.text} onChange={(e) => update(i, "text", e.target.value)} rows={3} className="text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Avatar</label>
              <div className="mt-1">
                <ImageUploadCrop
                  value={item.avatar}
                  onChange={(v) => update(i, "avatar", v)}
                  friendlyName={`depoimento-${i + 1}`}
                />
              </div>
            </div>
          </DragListItem>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Benefits Editor
   ═══════════════════════════════════════════ */
export function DashBenefitsEditor({
  content,
  updateField,
}: {
  content: Record<string, Record<string, string>>;
  updateField: (section: string, key: string, value: string) => void;
}) {
  const sc = content.benefits ?? defaults.benefits ?? {};
  const items: { title: string; desc: string; num: string }[] = (() => {
    try { return JSON.parse(sc.items); } catch { return []; }
  })();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const setItems = (newItems: typeof items) => {
    // Re-number
    const renumbered = newItems.map((item, i) => ({ ...item, num: String(i + 1).padStart(2, "0") }));
    updateField("benefits", "items", JSON.stringify(renumbered));
  };

  const { getDragProps, dragIdx, overIdx } = useDragList(items, setItems);

  const update = (idx: number, field: string, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField("benefits", "items", JSON.stringify(updated));
  };

  const add = () => {
    const newNum = String(items.length + 1).padStart(2, "0");
    const updated = [...items, { title: "", desc: "", num: newNum }];
    updateField("benefits", "items", JSON.stringify(updated));
    setOpenIdx(items.length);
  };

  const remove = (idx: number) => {
    if (!confirm("Excluir este benefício?")) return;
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    setOpenIdx(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cabeçalho da Seção</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Etiqueta</label>
            <Input value={sc.caption || ""} onChange={(e) => updateField("benefits", "caption", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título</label>
            <Input value={sc.title || ""} onChange={(e) => updateField("benefits", "title", e.target.value)} className="text-sm mt-1" />
          </div>
          <div className="hidden sm:block" /> {/* spacer */}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{items.length} benefícios • Arraste para reordenar</p>
        <Button variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Novo benefício
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <DragListItem
            key={i}
            index={i}
            title={item.title || `Benefício ${i + 1}`}
            badge={item.num}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            onDelete={() => remove(i)}
            dragProps={getDragProps(i)}
            isDragging={dragIdx === i}
            isOver={overIdx === i && dragIdx !== null && dragIdx !== i}
          >
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título</label>
              <Input value={item.title} onChange={(e) => update(i, "title", e.target.value)} className="text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Descrição</label>
              <Textarea value={item.desc} onChange={(e) => update(i, "desc", e.target.value)} rows={2} className="text-sm mt-1" />
            </div>
          </DragListItem>
        ))}
      </div>
    </div>
  );
}
