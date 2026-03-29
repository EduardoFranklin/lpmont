import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Save, Loader2, ExternalLink, ChevronUp, ChevronDown, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

interface QuizPage {
  id: string;
  slug: string;
  status: string;
  hero_label: string;
  hero_title: string;
  hero_message: string;
  hero_author_name: string;
  hero_author_role: string;
  lesson_tag: string;
  lesson_number: string;
  lesson_title: string;
  lesson_desc: string;
  lesson_duration: string;
  lesson_phase: string;
  lesson_video_url: string;
  lesson_thumbnail: string;
  quiz_icon: string;
  quiz_tag: string;
  quiz_number: string;
  quiz_title: string;
  quiz_desc: string;
  quiz_question_count: number;
  quiz_duration: string;
  lead_step1_text: string;
  lead_step2_text: string;
  lead_step3_text: string;
  result_high_min: number;
  result_high_level: string;
  result_high_title: string;
  result_high_diagnostic: string;
  result_mid_min: number;
  result_mid_level: string;
  result_mid_title: string;
  result_mid_diagnostic: string;
  result_low_level: string;
  result_low_title: string;
  result_low_diagnostic: string;
  result_closing_text: string;
  coupon_code: string;
  coupon_discount: string;
  coupon_timer_minutes: number;
  cta_url: string;
}

interface QuizQuestion {
  id?: string;
  quiz_page_id?: string;
  sort_order: number;
  label: string;
  question: string;
  is_critical: boolean;
  weight: number;
  explanation: string;
  image_url: string;
  options: { text: string; points: number }[];
  _isNew?: boolean;
  _deleted?: boolean;
}

const DashQuizPages = () => {
  const [pages, setPages] = useState<QuizPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editPage, setEditPage] = useState<QuizPage | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPages = async () => {
    const { data } = await supabase.from("quiz_pages").select("*").order("created_at", { ascending: false });
    if (data) setPages(data as QuizPage[]);
    setLoading(false);
  };

  useEffect(() => { loadPages(); }, []);

  const selectPage = async (page: QuizPage) => {
    setSelectedId(page.id);
    setEditPage({ ...page });
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_page_id", page.id)
      .order("sort_order", { ascending: true });
    setQuestions(
      (data ?? []).map((q: any) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }))
    );
  };

  const createNew = async () => {
    const slug = `quiz${pages.length + 1}`;
    const { data, error } = await supabase.from("quiz_pages").insert({
      slug,
      hero_title: "Novo Quiz",
      hero_message: "",
      hero_author_name: "Dr. Breno Mont'Alverne",
      hero_author_role: "Fundador do Instituto Mont'Alverne",
      lesson_title: "Nova Aula",
      lesson_desc: "",
      quiz_title: "Novo Quiz",
      quiz_desc: "",
      lead_step1_text: "",
      lead_step2_text: "",
      lead_step3_text: "",
      result_high_title: "",
      result_high_diagnostic: "",
      result_mid_title: "",
      result_mid_diagnostic: "",
      result_low_title: "",
      result_low_diagnostic: "",
      result_closing_text: "",
    }).select().single();
    if (error) { toast.error(error.message); return; }
    if (data) {
      await loadPages();
      selectPage(data as QuizPage);
      toast.success("Página criada!");
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Excluir esta página?")) return;
    await supabase.from("quiz_pages").delete().eq("id", id);
    if (selectedId === id) { setSelectedId(null); setEditPage(null); setQuestions([]); }
    loadPages();
    toast.success("Página excluída.");
  };

  const updateField = (key: keyof QuizPage, value: any) => {
    if (!editPage) return;
    setEditPage({ ...editPage, [key]: value });
  };

  const addQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      {
        sort_order: qs.length,
        label: "",
        question: "",
        is_critical: false,
        weight: 10,
        explanation: "",
        image_url: "",
        options: [
          { text: "", points: 0 },
          { text: "", points: 10 },
          { text: "", points: 0 },
        ],
        _isNew: true,
      },
    ]);
  };

  const updateQuestion = (idx: number, key: keyof QuizQuestion, value: any) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, [key]: value } : q)));
  };

  const updateOption = (qi: number, oi: number, key: string, value: any) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi) return q;
        const opts = [...q.options];
        opts[oi] = { ...opts[oi], [key]: value };
        return { ...q, options: opts };
      })
    );
  };

  const addOption = (qi: number) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: [...q.options, { text: "", points: 0 }] } : q))
    );
  };

  const removeOption = (qi: number, oi: number) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q))
    );
  };

  const removeQuestion = (idx: number) => {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const copy = [...qs];
      const target = idx + dir;
      if (target < 0 || target >= copy.length) return copy;
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy.map((q, i) => ({ ...q, sort_order: i }));
    });
  };

  const saveAll = async () => {
    if (!editPage) return;
    setSaving(true);
    try {
      // Save page
      const { id, ...pageData } = editPage;
      const { error: pageErr } = await supabase.from("quiz_pages").update({
        ...pageData,
        quiz_question_count: questions.filter((q) => !q._deleted).length,
      }).eq("id", id);
      if (pageErr) throw pageErr;

      // Delete old questions and re-insert
      await supabase.from("quiz_questions").delete().eq("quiz_page_id", id);

      const validQs = questions.filter((q) => !q._deleted);
      if (validQs.length > 0) {
        const inserts = validQs.map((q, i) => ({
          quiz_page_id: id,
          sort_order: i,
          label: q.label,
          question: q.question,
          is_critical: q.is_critical,
          weight: q.weight,
          explanation: q.explanation,
          image_url: q.image_url || "",
          options: JSON.stringify(q.options),
        }));
        const { error: qErr } = await supabase.from("quiz_questions").insert(inserts);
        if (qErr) throw qErr;
      }

      await loadPages();
      toast.success("Salvo com sucesso!");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Páginas Avulsas (Quiz/Aula)</h2>
          <p className="text-sm text-muted-foreground">Crie e gerencie páginas de quiz/aula independentes para estratégias de funil.</p>
        </div>
        <Button onClick={createNew} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nova Página
        </Button>
      </div>

      {/* Page list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pages.map((p) => (
          <div
            key={p.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary/30 ${
              selectedId === p.id ? "border-primary/50 bg-primary/5" : "border-border"
            }`}
            onClick={() => selectPage(p)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">/quiz/{p.slug}</span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                p.status === "published" ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"
              }`}>
                {p.status === "published" ? "Publicado" : "Rascunho"}
              </span>
            </div>
            <div className="font-medium text-sm truncate">{p.hero_title || p.lesson_title}</div>
            <div className="flex items-center gap-2 mt-2">
              {p.status === "published" && (
                <a
                  href={`/quiz/${p.slug}`}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-primary flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Abrir
                </a>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); deletePage(p.id); }}
                className="text-[10px] text-destructive/60 hover:text-destructive flex items-center gap-1 ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      {editPage && (
        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Editando: /quiz/{editPage.slug}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Publicado</span>
                <Switch
                  checked={editPage.status === "published"}
                  onCheckedChange={(v) => updateField("status", v ? "published" : "draft")}
                />
              </div>
              <Button onClick={saveAll} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </div>

          <Accordion type="multiple" className="space-y-2">
            {/* General */}
            <AccordionItem value="general" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">Geral</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <Field label="Slug (URL)" value={editPage.slug} onChange={(v) => updateField("slug", v)} />
                <Field label="CTA URL" value={editPage.cta_url} onChange={(v) => updateField("cta_url", v)} />
                <Field label="Cupom" value={editPage.coupon_code} onChange={(v) => updateField("coupon_code", v)} />
                <Field label="Desconto" value={editPage.coupon_discount} onChange={(v) => updateField("coupon_discount", v)} />
                <Field label="Timer (min)" value={String(editPage.coupon_timer_minutes)} onChange={(v) => updateField("coupon_timer_minutes", parseInt(v) || 10)} />
              </AccordionContent>
            </AccordionItem>

            {/* Hero */}
            <AccordionItem value="hero" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">Hero</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <Field label="Label" value={editPage.hero_label} onChange={(v) => updateField("hero_label", v)} />
                <Field label="Título (use *texto* para dourado)" value={editPage.hero_title} onChange={(v) => updateField("hero_title", v)} multi />
                <Field label="Mensagem" value={editPage.hero_message} onChange={(v) => updateField("hero_message", v)} multi />
                <Field label="Nome do autor" value={editPage.hero_author_name} onChange={(v) => updateField("hero_author_name", v)} />
                <Field label="Cargo do autor" value={editPage.hero_author_role} onChange={(v) => updateField("hero_author_role", v)} />
              </AccordionContent>
            </AccordionItem>

            {/* Lesson */}
            <AccordionItem value="lesson" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">Aula / Vídeo</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <Field label="Tag" value={editPage.lesson_tag} onChange={(v) => updateField("lesson_tag", v)} />
                <Field label="Número" value={editPage.lesson_number} onChange={(v) => updateField("lesson_number", v)} />
                <Field label="Título" value={editPage.lesson_title} onChange={(v) => updateField("lesson_title", v)} />
                <Field label="Descrição" value={editPage.lesson_desc} onChange={(v) => updateField("lesson_desc", v)} multi />
                <Field label="Duração" value={editPage.lesson_duration} onChange={(v) => updateField("lesson_duration", v)} />
                <Field label="Fase" value={editPage.lesson_phase} onChange={(v) => updateField("lesson_phase", v)} />
                <Field label="URL do Vídeo" value={editPage.lesson_video_url} onChange={(v) => updateField("lesson_video_url", v)} />
                <Field label="Thumbnail URL" value={editPage.lesson_thumbnail} onChange={(v) => updateField("lesson_thumbnail", v)} />
              </AccordionContent>
            </AccordionItem>

            {/* Quiz info */}
            <AccordionItem value="quizinfo" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">Quiz (Info)</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <Field label="Ícone" value={editPage.quiz_icon} onChange={(v) => updateField("quiz_icon", v)} />
                <Field label="Tag" value={editPage.quiz_tag} onChange={(v) => updateField("quiz_tag", v)} />
                <Field label="Número" value={editPage.quiz_number} onChange={(v) => updateField("quiz_number", v)} />
                <Field label="Título" value={editPage.quiz_title} onChange={(v) => updateField("quiz_title", v)} />
                <Field label="Descrição" value={editPage.quiz_desc} onChange={(v) => updateField("quiz_desc", v)} multi />
                <Field label="Duração" value={editPage.quiz_duration} onChange={(v) => updateField("quiz_duration", v)} />
              </AccordionContent>
            </AccordionItem>

            {/* Lead capture */}
            <AccordionItem value="lead" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">Captura de Lead</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <Field label="Step 1 (nome)" value={editPage.lead_step1_text} onChange={(v) => updateField("lead_step1_text", v)} multi placeholder="Use <strong> para negrito" />
                <Field label="Step 2 (telefone) — use {{nome}}" value={editPage.lead_step2_text} onChange={(v) => updateField("lead_step2_text", v)} multi />
                <Field label="Step 3 (email) — use {{nome}}" value={editPage.lead_step3_text} onChange={(v) => updateField("lead_step3_text", v)} multi />
              </AccordionContent>
            </AccordionItem>

            {/* Results */}
            <AccordionItem value="results" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">Resultados</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                <div className="p-3 bg-green-500/5 rounded-lg space-y-2">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide">Alto (≥ {editPage.result_high_min} pts)</h4>
                  <Field label="Pontuação mín." value={String(editPage.result_high_min)} onChange={(v) => updateField("result_high_min", parseInt(v) || 76)} />
                  <Field label="Nível" value={editPage.result_high_level} onChange={(v) => updateField("result_high_level", v)} />
                  <Field label="Título" value={editPage.result_high_title} onChange={(v) => updateField("result_high_title", v)} />
                  <Field label="Diagnóstico" value={editPage.result_high_diagnostic} onChange={(v) => updateField("result_high_diagnostic", v)} multi />
                </div>
                <div className="p-3 bg-primary/5 rounded-lg space-y-2">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wide">Médio (≥ {editPage.result_mid_min} pts)</h4>
                  <Field label="Pontuação mín." value={String(editPage.result_mid_min)} onChange={(v) => updateField("result_mid_min", parseInt(v) || 41)} />
                  <Field label="Nível" value={editPage.result_mid_level} onChange={(v) => updateField("result_mid_level", v)} />
                  <Field label="Título" value={editPage.result_mid_title} onChange={(v) => updateField("result_mid_title", v)} />
                  <Field label="Diagnóstico" value={editPage.result_mid_diagnostic} onChange={(v) => updateField("result_mid_diagnostic", v)} multi />
                </div>
                <div className="p-3 bg-red-500/5 rounded-lg space-y-2">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide">Baixo (&lt; {editPage.result_mid_min} pts)</h4>
                  <Field label="Nível" value={editPage.result_low_level} onChange={(v) => updateField("result_low_level", v)} />
                  <Field label="Título" value={editPage.result_low_title} onChange={(v) => updateField("result_low_title", v)} />
                  <Field label="Diagnóstico" value={editPage.result_low_diagnostic} onChange={(v) => updateField("result_low_diagnostic", v)} multi />
                </div>
                <Field label="Texto de fechamento (HTML)" value={editPage.result_closing_text} onChange={(v) => updateField("result_closing_text", v)} multi />
              </AccordionContent>
            </AccordionItem>

            {/* Questions */}
            <AccordionItem value="questions" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline font-medium">
                Questões ({questions.length})
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-4">
                {questions.map((q, qi) => (
                  <div key={qi} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Questão {qi + 1}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveQuestion(qi, -1)} disabled={qi === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveQuestion(qi, 1)} disabled={qi === questions.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeQuestion(qi)} className="p-1 text-destructive/60 hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <Field label="Label" value={q.label} onChange={(v) => updateQuestion(qi, "label", v)} />
                    <Field label="Pergunta" value={q.question} onChange={(v) => updateQuestion(qi, "question", v)} multi />
                    <div className="flex items-center gap-4">
                      <Field label="Peso (pts)" value={String(q.weight)} onChange={(v) => updateQuestion(qi, "weight", parseInt(v) || 10)} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Crítica (trava)</span>
                        <Switch checked={q.is_critical} onCheckedChange={(v) => updateQuestion(qi, "is_critical", v)} />
                      </div>
                    </div>
                    <Field label="Explicação" value={q.explanation} onChange={(v) => updateQuestion(qi, "explanation", v)} multi />
                    <Field label="URL da Imagem" value={q.image_url || ""} onChange={(v) => updateQuestion(qi, "image_url", v)} placeholder="https://... ou /images/quiz/..." />

                    <div className="space-y-2">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Opções</span>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <Input
                            value={opt.text}
                            onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                            placeholder={`Opção ${oi + 1}`}
                            className="flex-1 text-sm"
                          />
                          <Input
                            type="number"
                            value={String(opt.points)}
                            onChange={(e) => updateOption(qi, oi, "points", parseInt(e.target.value) || 0)}
                            className="w-20 text-sm"
                            placeholder="Pts"
                          />
                          <button onClick={() => removeOption(qi, oi)} className="text-destructive/60 hover:text-destructive p-1">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addOption(qi)} className="gap-1">
                        <Plus className="w-3 h-3" /> Opção
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addQuestion} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Adicionar Questão
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

function Field({ label, value, onChange, multi, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multi?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      {multi ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="text-sm" placeholder={placeholder} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" placeholder={placeholder} />
      )}
    </div>
  );
}

export default DashQuizPages;
