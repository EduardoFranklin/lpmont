import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaults, { sectionLabels, fieldLabels } from "@/lib/siteContentDefaults";
import { invalidateSiteContentCache } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Save, RotateCcw, Check, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type ContentMap = Record<string, Record<string, string>>;

const sectionOrder = ["hero", "problem", "modules", "method", "instructor", "benefits", "testimonials", "pricing", "faq", "footer"];

// Detect if a field value looks like JSON
function isJsonField(key: string, value: string): boolean {
  const jsonKeys = ["toggles", "reassurance", "obstacles", "camps", "hands_on", "items", "bio", "stats", "includes", "bonuses", "theory_tags", "practice_tags", "instagram_links"];
  return jsonKeys.includes(key) || (value.startsWith("[") && value.endsWith("]"));
}

// JSON array editor for simple string arrays
function SimpleArrayEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: string[] = (() => { try { return JSON.parse(value); } catch { return []; } })();

  const update = (idx: number, newVal: string) => {
    const copy = [...items];
    copy[idx] = newVal;
    onChange(JSON.stringify(copy));
  };
  const add = () => onChange(JSON.stringify([...items, ""]));
  const remove = (idx: number) => onChange(JSON.stringify(items.filter((_, i) => i !== idx)));
  const move = (idx: number, dir: -1 | 1) => {
    const copy = [...items];
    const target = idx + dir;
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

// JSON array editor for object arrays (obstacles, camps, testimonials, FAQs etc.)
function ObjectArrayEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items: Record<string, string>[] = (() => { try { return JSON.parse(value); } catch { return []; } })();
  if (items.length === 0) return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6} className="font-mono text-xs" />;

  const keys = Object.keys(items[0]);

  const update = (idx: number, key: string, newVal: string) => {
    const copy = JSON.parse(JSON.stringify(items));
    copy[idx][key] = newVal;
    onChange(JSON.stringify(copy));
  };
  const add = () => {
    const empty: Record<string, string> = {};
    keys.forEach(k => empty[k] = "");
    onChange(JSON.stringify([...items, empty]));
  };
  const remove = (idx: number) => onChange(JSON.stringify(items.filter((_, i) => i !== idx)));
  const move = (idx: number, dir: -1 | 1) => {
    const copy = [...items];
    const target = idx + dir;
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
              {(item[k] || "").length > 80 ? (
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
  // Try to detect if it's a simple string array or object array
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0 || typeof parsed[0] === "string") {
        return <SimpleArrayEditor value={value} onChange={onChange} />;
      }
      if (typeof parsed[0] === "object") {
        return <ObjectArrayEditor value={value} onChange={onChange} />;
      }
    }
  } catch {}
  // Fallback: raw JSON textarea
  return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={8} className="font-mono text-xs" />;
}

const DashContent = () => {
  const [content, setContent] = useState<ContentMap>({});
  const [saving, setSaving] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  // Load current content from DB (merged with defaults)
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
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setDirtyKeys(prev => new Set(prev).add(`${section}::${key}`));
  };

  const resetField = (section: string, key: string) => {
    const defaultVal = defaults[section]?.[key] ?? "";
    updateField(section, key, defaultVal);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Only save dirty fields
      const upserts = Array.from(dirtyKeys).map(dk => {
        const [section, key] = dk.split("::");
        return {
          section,
          content_key: key,
          content_value: content[section]?.[key] ?? "",
          content_type: isJsonField(key, content[section]?.[key] ?? "") ? "json" : "text",
        };
      });

      if (upserts.length === 0) {
        toast.info("Nenhuma alteração para salvar.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("site_content").upsert(upserts, {
        onConflict: "section,content_key",
      });

      if (error) throw error;

      invalidateSiteContentCache();
      setDirtyKeys(new Set());
      toast.success("Conteúdo salvo com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = dirtyKeys.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gerenciar Conteúdo do Site</h2>
          <p className="text-sm text-muted-foreground">Edite textos e conteúdos de cada seção. As alterações são aplicadas imediatamente no site após salvar.</p>
        </div>
        <Button onClick={saveAll} disabled={saving || !hasChanges} className="gap-1.5">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando..." : hasChanges ? `Salvar (${dirtyKeys.size})` : "Salvo"}
        </Button>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {sectionOrder.map(section => {
          const sectionContent = content[section] ?? {};
          const labels = fieldLabels[section] ?? {};
          const sectionKeys = Object.keys(defaults[section] ?? {});
          const sectionDirtyCount = Array.from(dirtyKeys).filter(k => k.startsWith(section + "::")).length;

          return (
            <AccordionItem key={section} value={section} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{sectionLabels[section] ?? section}</span>
                  {sectionDirtyCount > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {sectionDirtyCount} alteração{sectionDirtyCount > 1 ? "ões" : ""}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {sectionKeys.map(key => {
                    const value = sectionContent[key] ?? defaults[section]?.[key] ?? "";
                    const label = labels[key] ?? key;
                    const isJson = isJsonField(key, value);
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
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={saveAll} disabled={saving} size="lg" className="gap-2 shadow-lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar todas as alterações ({dirtyKeys.size})
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashContent;
