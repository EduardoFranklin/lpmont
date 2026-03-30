import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaults, { sectionLabels, fieldLabels } from "@/lib/siteContentDefaults";
import { invalidateSiteContentCache } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, RotateCcw, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Settings, Mountain, BookOpen, FileText, GraduationCap, Heart, MessageCircle, DollarSign, HelpCircle, Footprints, Zap, Menu, X, Compass } from "lucide-react";
import { toast } from "sonner";
import ImageUploadCrop from "./ImageUploadCrop";
import RichTextEditor from "./RichTextEditor";
import DashQuizPages from "./DashQuizPages";
import DashModulesEditor from "./DashModulesEditor";
import { DashFAQEditor, DashTestimonialsEditor, DashBenefitsEditor } from "./DashListEditors";
import DashOnboarding from "./DashOnboarding";

type ContentMap = Record<string, Record<string, string>>;

const sectionOrder = ["hero", "problem", "modules", "method", "instructor", "benefits", "testimonials", "pricing", "faq", "footer", "onboarding"];

const sectionIcons: Record<string, any> = {
  hero: Settings,
  problem: Mountain,
  modules: BookOpen,
  method: GraduationCap,
  instructor: Heart,
  benefits: Heart,
  testimonials: MessageCircle,
  pricing: DollarSign,
  faq: HelpCircle,
  footer: Footprints,
  onboarding: Compass,
};

// Fields that should use the rich text editor
const richTextFields = new Set([
  "bio", "description", "desc", "content", "body", "text",
  "result_closing_text",
]);

function isRichTextField(key: string, value: string): boolean {
  if (richTextFields.has(key)) return true;
  if (key.match(/^synopsis_\d+_content$/)) return true;
  if (value && /<[a-z][\s\S]*>/i.test(value) && !value.startsWith("[") && !value.startsWith("{")) return true;
  return false;
}

function isJsonField(key: string, value: string): boolean {
  const jsonKeys = ["toggles", "reassurance", "obstacles", "camps", "hands_on", "items", "bio", "stats", "includes", "bonuses", "theory_tags", "practice_tags", "instagram_links"];
  if (jsonKeys.includes(key)) return true;
  return value.startsWith("[") && value.endsWith("]") || value.startsWith("{") && value.endsWith("}");
}

function isImageField(key: string, value: string): boolean {
  const imageKeys = ["img", "avatar", "image", "logo", "photo", "cover", "thumbnail", "banner"];
  if (imageKeys.some(ik => key.toLowerCase().includes(ik))) return true;
  if (value && value.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) return true;
  if (key === "video_url") return false;
  return false;
}

function SimpleArrayEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: string[] = (() => { try { return JSON.parse(value); } catch { return []; } })();
  const update = (idx: number, newVal: string) => {
    const copy = [...items]; copy[idx] = newVal; onChange(JSON.stringify(copy));
  };
  const add = () => onChange(JSON.stringify([...items, ""]));
  const remove = (idx: number) => onChange(JSON.stringify(items.filter((_, i) => i !== idx)));
  const move = (idx: number, dir: -1 | 1) => {
    const copy = [...items]; const target = idx + dir;
    if (target < 0 || target >= copy.length) return;
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange(JSON.stringify(copy));
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-6 text-right">{i + 1}.</span>
          <Input value={item} onChange={(e) => update(i, e.target.value)} className="flex-1 text-sm" />
          <button onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground p-1" disabled={i === 0}><ChevronUp className="w-3.5 h-3.5" /></button>
          <button onClick={() => move(i, 1)} className="text-muted-foreground hover:text-foreground p-1" disabled={i === items.length - 1}><ChevronDown className="w-3.5 h-3.5" /></button>
          <button onClick={() => remove(i)} className="text-destructive/60 hover:text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
    </div>
  );
}

function ObjectArrayEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: Record<string, string>[] = (() => { try { return JSON.parse(value); } catch { return []; } })();
  if (items.length === 0) return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6} className="font-mono text-xs" />;
  const keys = Object.keys(items[0]);
  const update = (idx: number, key: string, newVal: string) => {
    const copy = JSON.parse(JSON.stringify(items)); copy[idx][key] = newVal; onChange(JSON.stringify(copy));
  };
  const add = () => {
    const empty: Record<string, string> = {}; keys.forEach(k => empty[k] = ""); onChange(JSON.stringify([...items, empty]));
  };
  const remove = (idx: number) => onChange(JSON.stringify(items.filter((_, i) => i !== idx)));
  const move = (idx: number, dir: -1 | 1) => {
    const copy = [...items]; const target = idx + dir;
    if (target < 0 || target >= copy.length) return;
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange(JSON.stringify(copy));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Item {i + 1}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground p-1" disabled={i === 0}><ChevronUp className="w-3.5 h-3.5" /></button>
              <button onClick={() => move(i, 1)} className="text-muted-foreground hover:text-foreground p-1" disabled={i === items.length - 1}><ChevronDown className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(i)} className="text-destructive/60 hover:text-destructive p-1"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          {keys.map(k => (
            <div key={k}>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider">{k}</label>
              {isImageField(k, item[k] || "") ? (
                <ImageUploadCrop
                  value={item[k] || ""}
                  onChange={(v) => update(i, k, v)}
                  friendlyName={`${k}-${i + 1}`}
                />
              ) : isRichTextField(k, item[k] || "") ? (
                <RichTextEditor value={item[k] || ""} onChange={(v) => update(i, k, v)} minHeight="100px" />
              ) : (item[k] || "").length > 80 ? (
                <Textarea value={item[k] || ""} onChange={(e) => update(i, k, e.target.value)} rows={3} className="text-sm" />
              ) : (
                <Input value={item[k] || ""} onChange={(e) => update(i, k, e.target.value)} className="text-sm" />
              )}
            </div>
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar item</Button>
    </div>
  );
}

function JsonFieldEditor({ fieldKey, value, onChange }: { fieldKey: string; value: string; onChange: (v: string) => void }) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0 || typeof parsed[0] === "string") return <SimpleArrayEditor value={value} onChange={onChange} />;
      if (typeof parsed[0] === "object") return <ObjectArrayEditor value={value} onChange={onChange} />;
    }
  } catch {}
  return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={8} className="font-mono text-xs" />;
}

/* ─── Section Content Panel ─── */
function SectionPanel({
  section, content, dirtyKeys, updateField, resetField
}: {
  section: string;
  content: ContentMap;
  dirtyKeys: Set<string>;
  updateField: (section: string, key: string, value: string) => void;
  resetField: (section: string, key: string) => void;
}) {
  const sectionContent = content[section] ?? {};
  const labels = fieldLabels[section] ?? {};
  const sectionKeys = Object.keys(defaults[section] ?? {});

  return (
    <div className="space-y-4">
      {sectionKeys.map(key => {
        const value = sectionContent[key] ?? defaults[section]?.[key] ?? "";
        const label = labels[key] ?? key;
        const isJson = isJsonField(key, value);
        const isImage = isImageField(key, value);
        const isRich = !isJson && !isImage && isRichTextField(key, value);
        const isDirty = dirtyKeys.has(`${section}::${key}`);

        return (
          <div key={key} className={`space-y-1.5 p-3 rounded-lg transition-colors ${isDirty ? "bg-primary/5 border border-primary/10" : ""}`}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/70">
                {label}
                {isDirty && <span className="ml-2 text-[10px] text-primary">● modificado</span>}
              </label>
              {isDirty && (
                <button
                  onClick={() => resetField(section, key)}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar
                </button>
              )}
            </div>
            {isJson ? (
              <JsonFieldEditor fieldKey={key} value={value} onChange={(v) => updateField(section, key, v)} />
            ) : isImage ? (
              <ImageUploadCrop
                value={value}
                onChange={(v) => updateField(section, key, v)}
                friendlyName={`${section}-${key}`}
              />
            ) : isRich ? (
              <RichTextEditor
                value={value}
                onChange={(v) => updateField(section, key, v)}
                placeholder={`Conteúdo de ${label}...`}
              />
            ) : value.includes("\n") || value.length > 100 ? (
              <Textarea
                value={value}
                onChange={(e) => updateField(section, key, e.target.value)}
                rows={3}
                className="text-sm"
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => updateField(section, key, e.target.value)}
                className="text-sm"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
const DashContent = () => {
  const [content, setContent] = useState<ContentMap>({});
  const [saving, setSaving] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allMenuItems = [
    ...sectionOrder.map(s => ({ id: s, label: sectionLabels[s] ?? s, icon: sectionIcons[s] ?? FileText, type: "section" as const })),
    { id: "quizpages", label: "Páginas (Quiz)", icon: Zap, type: "special" as const },
  ];

  useEffect(() => {
    const load = async () => {
      const merged: ContentMap = JSON.parse(JSON.stringify(defaults));
      const { data } = await supabase.from("site_content").select("section, content_key, content_value");
      if (data) {
        for (const row of data) {
          if (!merged[row.section]) merged[row.section] = {};
          merged[row.section][row.content_key] = row.content_value;
        }
      }
      setContent(merged);
    };
    load();
  }, []);

  const updateField = (section: string, key: string, value: string) => {
    setContent(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setDirtyKeys(prev => new Set(prev).add(`${section}::${key}`));
  };

  const resetField = (section: string, key: string) => {
    const defaultVal = defaults[section]?.[key] ?? "";
    updateField(section, key, defaultVal);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const upserts = Array.from(dirtyKeys).map(dk => {
        const [section, key] = dk.split("::");
        return {
          section,
          content_key: key,
          content_value: content[section]?.[key] ?? "",
          content_type: isJsonField(key, content[section]?.[key] ?? "") ? "json" : "text",
        };
      });
      if (upserts.length === 0) { toast.info("Nenhuma alteração."); setSaving(false); return; }
      const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "section,content_key" });
      if (error) throw error;
      invalidateSiteContentCache();
      setDirtyKeys(new Set());
      toast.success("Conteúdo salvo!");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = dirtyKeys.size > 0;
  const activeDirtyCount = Array.from(dirtyKeys).filter(k => k.startsWith(activeSection + "::")).length;

  const handleMenuClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 min-h-[calc(100vh-8rem)]">
      {/* ─── Mobile: horizontal scrollable tabs ─── */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium text-foreground"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {allMenuItems.find(m => m.id === activeSection)?.label ?? activeSection}
          </button>
          {hasChanges && (
            <Button onClick={saveAll} disabled={saving} size="sm" className="ml-auto gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar ({dirtyKeys.size})
            </Button>
          )}
        </div>
        {mobileMenuOpen && (
          <div className="grid grid-cols-2 gap-1.5 mb-4 p-2 rounded-lg bg-muted/50 border border-border">
            {allMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const itemDirty = Array.from(dirtyKeys).filter(k => k.startsWith(item.id + "::")).length;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {itemDirty > 0 && (
                    <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      {itemDirty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Desktop: sidebar ─── */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <nav className="sticky top-20 space-y-1">
          {allMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const itemDirty = Array.from(dirtyKeys).filter(k => k.startsWith(item.id + "::")).length;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {itemDirty > 0 && (
                  <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                    {itemDirty}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── Content Panel ─── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {allMenuItems.find(m => m.id === activeSection)?.label ?? activeSection}
            </h2>
            {activeSection !== "quizpages" && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Edite os campos abaixo. Campos de texto suportam formatação rica.
              </p>
            )}
          </div>
          {activeSection !== "quizpages" && (
            <Button onClick={saveAll} disabled={saving || !hasChanges} className="gap-1.5 hidden lg:flex">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Salvando..." : hasChanges ? `Salvar (${dirtyKeys.size})` : "Salvo"}
            </Button>
          )}
        </div>

        {activeSection === "quizpages" ? (
          <DashQuizPages />
        ) : activeSection === "onboarding" ? (
          <DashOnboarding />
        ) : activeSection === "modules" ? (
          <DashModulesEditor
            content={content}
            dirtyKeys={dirtyKeys}
            updateField={updateField}
          />
        ) : activeSection === "faq" ? (
          <DashFAQEditor content={content} updateField={updateField} />
        ) : activeSection === "testimonials" ? (
          <DashTestimonialsEditor content={content} updateField={updateField} />
        ) : activeSection === "benefits" ? (
          <DashBenefitsEditor content={content} updateField={updateField} />
        ) : (
          <SectionPanel
            section={activeSection}
            content={content}
            dirtyKeys={dirtyKeys}
            updateField={updateField}
            resetField={resetField}
          />
        )}

        {hasChanges && activeSection !== "quizpages" && (
          <div className="sticky bottom-4 flex justify-end mt-6">
            <Button onClick={saveAll} disabled={saving} size="lg" className="gap-2 shadow-lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar todas as alterações ({dirtyKeys.size})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashContent;
