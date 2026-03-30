import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaults from "@/lib/siteContentDefaults";
import { invalidateSiteContentCache } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GripVertical, ChevronDown, Save, Loader2, Plus, Trash2,
  BookOpen, Mountain, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import ImageUploadCrop from "./ImageUploadCrop";
import RichTextEditor from "./RichTextEditor";

type Camp = {
  num: string;
  altitude: string;
  title: string;
  desc: string;
  phase: string;
  img: string;
};

type HandsOn = {
  num: string;
  title: string;
  desc: string;
  img: string;
};

type Synopsis = {
  title: string;
  tagline: string;
  content: string;
};

const phaseOptions = ["Base", "Ascensão", "Altitude", "Crista", "Cume"];

const phaseColors: Record<string, string> = {
  Base: "bg-emerald-500/20 text-emerald-400",
  Ascensão: "bg-sky-500/20 text-sky-400",
  Altitude: "bg-amber-500/20 text-amber-400",
  Crista: "bg-orange-500/20 text-orange-400",
  Cume: "bg-primary/20 text-primary",
};

/* ─── Module Item (expandable) ─── */
function ModuleItem({
  camp,
  synopsis,
  index,
  isOpen,
  onToggle,
  onChange,
  onSynopsisChange,
  onDelete,
  dragProps,
  isDragging,
  isOver,
}: {
  camp: Camp;
  synopsis: Synopsis;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof Camp, value: string) => void;
  onSynopsisChange: (field: keyof Synopsis, value: string) => void;
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
      {/* Collapsed row */}
      <div
        className="flex items-center gap-2 px-3 py-3 cursor-grab active:cursor-grabbing select-none"
        onClick={onToggle}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
          {camp.img ? (
            <img src={camp.img} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{camp.num}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${phaseColors[camp.phase] || "bg-muted text-muted-foreground"}`}>
              {camp.phase}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{camp.title || `Módulo ${index + 1}`}</p>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono mr-2">{camp.altitude}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Expanded detail */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4" onClick={(e) => e.stopPropagation()}>
          {/* Module data section */}
          <div className="flex items-center gap-2 mb-1">
            <Mountain className="w-4 h-4 text-primary/60" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Dados do Módulo</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Número</label>
              <Input value={camp.num} onChange={(e) => onChange("num", e.target.value)} className="text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Altitude</label>
              <Input value={camp.altitude} onChange={(e) => onChange("altitude", e.target.value)} className="text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Fase</label>
              <select
                value={camp.phase}
                onChange={(e) => onChange("phase", e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {phaseOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título</label>
              <Input value={camp.title} onChange={(e) => onChange("title", e.target.value)} className="text-sm mt-1" />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Descrição</label>
            <Textarea value={camp.desc} onChange={(e) => onChange("desc", e.target.value)} rows={2} className="text-sm mt-1" />
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Imagem do Módulo</label>
            <div className="mt-1">
              <ImageUploadCrop
                value={camp.img}
                onChange={(v) => onChange("img", v)}
                friendlyName={`modulo-${camp.num}`}
              />
            </div>
          </div>

          {/* Synopsis section */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary/60" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary/60">Sinopse</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título da sinopse</label>
                <Input value={synopsis.title} onChange={(e) => onSynopsisChange("title", e.target.value)} className="text-sm mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Tagline</label>
                <Input value={synopsis.tagline} onChange={(e) => onSynopsisChange("tagline", e.target.value)} className="text-sm mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Conteúdo</label>
                <div className="mt-1">
                  <RichTextEditor
                    value={synopsis.content}
                    onChange={(v) => onSynopsisChange("content", v)}
                    placeholder="Conteúdo da sinopse..."
                    minHeight="120px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delete */}
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir módulo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Hands-On Item ─── */
function HandsOnItem({
  item,
  index,
  isOpen,
  onToggle,
  onChange,
  onDelete,
  dragProps,
  isDragging,
  isOver,
}: {
  item: HandsOn;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (field: keyof HandsOn, value: string) => void;
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
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
          {item.img ? (
            <img src={item.img} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-primary/20 text-primary">{item.num}</span>
          <p className="text-sm font-medium truncate mt-0.5">{item.title || `Hands-On ${index + 1}`}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-4" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Número</label>
              <Input value={item.num} onChange={(e) => onChange("num", e.target.value)} className="text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título</label>
              <Input value={item.title} onChange={(e) => onChange("title", e.target.value)} className="text-sm mt-1" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Descrição</label>
            <Textarea value={item.desc} onChange={(e) => onChange("desc", e.target.value)} rows={2} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Imagem</label>
            <div className="mt-1">
              <ImageUploadCrop
                value={item.img}
                onChange={(v) => onChange("img", v)}
                friendlyName={`handson-${item.num}`}
              />
            </div>
          </div>
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

/* ─── Main Editor ─── */
const DashModulesEditor = ({
  content,
  dirtyKeys,
  updateField,
}: {
  content: Record<string, Record<string, string>>;
  dirtyKeys: Set<string>;
  updateField: (section: string, key: string, value: string) => void;
}) => {
  const sc = content.modules ?? defaults.modules ?? {};
  const synopsesContent = content.synopses ?? defaults.synopses ?? {};

  // Parse camps & hands_on from JSON
  const camps: Camp[] = (() => {
    try { return JSON.parse(sc.camps); } catch { return []; }
  })();
  const handsOnItems: HandsOn[] = (() => {
    try { return JSON.parse(sc.hands_on); } catch { return []; }
  })();

  // Build synopsis map keyed by module number
  const getSynopsis = (num: string): Synopsis => {
    const n = num.replace(/^0+/, "");
    return {
      title: synopsesContent[`synopsis_${n}_title`] || "",
      tagline: synopsesContent[`synopsis_${n}_tagline`] || "",
      content: synopsesContent[`synopsis_${n}_content`] || "",
    };
  };

  const [openCampIdx, setOpenCampIdx] = useState<number | null>(null);
  const [openHandsOnIdx, setOpenHandsOnIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"theory" | "practice">("theory");

  // ─── Header fields ───
  const caption = sc.caption || "";
  const titleLine1 = sc.title_line1 || "";
  const titleLine2 = sc.title_line2 || "";
  const subtitle = sc.subtitle || "";

  // ─── Drag logic for camps ───
  const campDragItem = useRef<number | null>(null);
  const campDragOver = useRef<number | null>(null);
  const [campDragIdx, setCampDragIdx] = useState<number | null>(null);
  const [campOverIdx, setCampOverIdx] = useState<number | null>(null);

  const getCampDragProps = (idx: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      campDragItem.current = idx;
      setCampDragIdx(idx);
    },
    onDragEnter: () => {
      campDragOver.current = idx;
      setCampOverIdx(idx);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnd: () => {
      if (campDragItem.current !== null && campDragOver.current !== null && campDragItem.current !== campDragOver.current) {
        const reordered = [...camps];
        const [removed] = reordered.splice(campDragItem.current, 1);
        reordered.splice(campDragOver.current, 0, removed);
        // Re-number
        const renumbered = reordered.map((c, i) => ({ ...c, num: String(i + 1).padStart(2, "0") }));
        updateField("modules", "camps", JSON.stringify(renumbered));
      }
      campDragItem.current = null;
      campDragOver.current = null;
      setCampDragIdx(null);
      setCampOverIdx(null);
    },
    onDragLeave: () => {
      if (campOverIdx === idx) setCampOverIdx(null);
    },
  });

  // ─── Drag logic for hands-on ───
  const hoDragItem = useRef<number | null>(null);
  const hoDragOver = useRef<number | null>(null);
  const [hoDragIdx, setHoDragIdx] = useState<number | null>(null);
  const [hoOverIdx, setHoOverIdx] = useState<number | null>(null);

  const getHoDragProps = (idx: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      hoDragItem.current = idx;
      setHoDragIdx(idx);
    },
    onDragEnter: () => {
      hoDragOver.current = idx;
      setHoOverIdx(idx);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnd: () => {
      if (hoDragItem.current !== null && hoDragOver.current !== null && hoDragItem.current !== hoDragOver.current) {
        const reordered = [...handsOnItems];
        const [removed] = reordered.splice(hoDragItem.current, 1);
        reordered.splice(hoDragOver.current, 0, removed);
        const renumbered = reordered.map((h, i) => ({ ...h, num: `H${i + 1}` }));
        updateField("modules", "hands_on", JSON.stringify(renumbered));
      }
      hoDragItem.current = null;
      hoDragOver.current = null;
      setHoDragIdx(null);
      setHoOverIdx(null);
    },
    onDragLeave: () => {
      if (hoOverIdx === idx) setHoOverIdx(null);
    },
  });

  // ─── Update helpers ───
  const updateCamp = (idx: number, field: keyof Camp, value: string) => {
    const updated = [...camps];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField("modules", "camps", JSON.stringify(updated));
  };

  const updateSynopsis = (campNum: string, field: keyof Synopsis, value: string) => {
    const n = campNum.replace(/^0+/, "");
    updateField("synopses", `synopsis_${n}_${field}`, value);
  };

  const deleteCamp = (idx: number) => {
    if (!confirm("Excluir este módulo?")) return;
    const updated = camps.filter((_, i) => i !== idx);
    const renumbered = updated.map((c, i) => ({ ...c, num: String(i + 1).padStart(2, "0") }));
    updateField("modules", "camps", JSON.stringify(renumbered));
    setOpenCampIdx(null);
  };

  const addCamp = () => {
    const newNum = String(camps.length + 1).padStart(2, "0");
    const newCamp: Camp = { num: newNum, altitude: "", title: "", desc: "", phase: "Base", img: "" };
    updateField("modules", "camps", JSON.stringify([...camps, newCamp]));
    setOpenCampIdx(camps.length);
  };

  const updateHandsOn = (idx: number, field: keyof HandsOn, value: string) => {
    const updated = [...handsOnItems];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField("modules", "hands_on", JSON.stringify(updated));
  };

  const deleteHandsOn = (idx: number) => {
    if (!confirm("Excluir este Hands-On?")) return;
    const updated = handsOnItems.filter((_, i) => i !== idx);
    const renumbered = updated.map((h, i) => ({ ...h, num: `H${i + 1}` }));
    updateField("modules", "hands_on", JSON.stringify(renumbered));
    setOpenHandsOnIdx(null);
  };

  const addHandsOn = () => {
    const newItem: HandsOn = { num: `H${handsOnItems.length + 1}`, title: "", desc: "", img: "" };
    updateField("modules", "hands_on", JSON.stringify([...handsOnItems, newItem]));
    setOpenHandsOnIdx(handsOnItems.length);
  };

  return (
    <div className="space-y-6">
      {/* Section header fields */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cabeçalho da Seção</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Etiqueta</label>
            <Input value={caption} onChange={(e) => updateField("modules", "caption", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Subtítulo</label>
            <Input value={subtitle} onChange={(e) => updateField("modules", "subtitle", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título — Linha 1</label>
            <Input value={titleLine1} onChange={(e) => updateField("modules", "title_line1", e.target.value)} className="text-sm mt-1" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider">Título — Linha 2</label>
            <Input value={titleLine2} onChange={(e) => updateField("modules", "title_line2", e.target.value)} className="text-sm mt-1" />
          </div>
        </div>
      </div>

      {/* Tabs: Teoria / Prática */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border">
        <button
          onClick={() => setActiveTab("theory")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "theory" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mountain className="w-4 h-4" />
          Módulos Teóricos ({camps.length})
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "practice" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Hands-On ({handsOnItems.length})
        </button>
      </div>

      {/* Theory tab */}
      {activeTab === "theory" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{camps.length} módulos • Arraste para reordenar</p>
            <Button variant="outline" size="sm" onClick={addCamp} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Novo módulo
            </Button>
          </div>
          {camps.map((camp, i) => (
            <ModuleItem
              key={`${camp.num}-${i}`}
              camp={camp}
              synopsis={getSynopsis(camp.num)}
              index={i}
              isOpen={openCampIdx === i}
              onToggle={() => setOpenCampIdx(openCampIdx === i ? null : i)}
              onChange={(field, value) => updateCamp(i, field, value)}
              onSynopsisChange={(field, value) => updateSynopsis(camp.num, field, value)}
              onDelete={() => deleteCamp(i)}
              dragProps={getCampDragProps(i)}
              isDragging={campDragIdx === i}
              isOver={campOverIdx === i && campDragIdx !== null && campDragIdx !== i}
            />
          ))}
        </div>
      )}

      {/* Practice tab */}
      {activeTab === "practice" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{handsOnItems.length} itens • Arraste para reordenar</p>
            <Button variant="outline" size="sm" onClick={addHandsOn} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Novo Hands-On
            </Button>
          </div>
          {handsOnItems.map((item, i) => (
            <HandsOnItem
              key={`${item.num}-${i}`}
              item={item}
              index={i}
              isOpen={openHandsOnIdx === i}
              onToggle={() => setOpenHandsOnIdx(openHandsOnIdx === i ? null : i)}
              onChange={(field, value) => updateHandsOn(i, field, value)}
              onDelete={() => deleteHandsOn(i)}
              dragProps={getHoDragProps(i)}
              isDragging={hoDragIdx === i}
              isOver={hoOverIdx === i && hoDragIdx !== null && hoDragIdx !== i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashModulesEditor;
