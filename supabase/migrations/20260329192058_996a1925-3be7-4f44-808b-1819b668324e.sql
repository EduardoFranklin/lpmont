
-- Quiz/Lesson pages table
CREATE TABLE public.quiz_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft',
  
  -- Hero
  hero_label text NOT NULL DEFAULT 'Treinamento Online',
  hero_title text NOT NULL DEFAULT '',
  hero_message text NOT NULL DEFAULT '',
  hero_author_name text NOT NULL DEFAULT '',
  hero_author_role text NOT NULL DEFAULT '',
  
  -- Lesson tab
  lesson_tag text NOT NULL DEFAULT 'Hands-On',
  lesson_number text NOT NULL DEFAULT 'Aula 01',
  lesson_title text NOT NULL DEFAULT '',
  lesson_desc text NOT NULL DEFAULT '',
  lesson_duration text NOT NULL DEFAULT '',
  lesson_phase text NOT NULL DEFAULT '',
  lesson_video_url text NOT NULL DEFAULT '',
  lesson_thumbnail text NOT NULL DEFAULT '',
  
  -- Quiz tab
  quiz_icon text NOT NULL DEFAULT '🧠',
  quiz_tag text NOT NULL DEFAULT 'Quiz',
  quiz_number text NOT NULL DEFAULT 'Diagnóstico',
  quiz_title text NOT NULL DEFAULT '',
  quiz_desc text NOT NULL DEFAULT '',
  quiz_question_count integer NOT NULL DEFAULT 5,
  quiz_duration text NOT NULL DEFAULT '~5 min',
  
  -- Lead capture intro texts
  lead_step1_text text NOT NULL DEFAULT '',
  lead_step2_text text NOT NULL DEFAULT '',
  lead_step3_text text NOT NULL DEFAULT '',
  
  -- Result config
  result_high_min integer NOT NULL DEFAULT 76,
  result_high_level text NOT NULL DEFAULT 'Clínico Estratégico',
  result_high_title text NOT NULL DEFAULT '',
  result_high_diagnostic text NOT NULL DEFAULT '',
  result_mid_min integer NOT NULL DEFAULT 41,
  result_mid_level text NOT NULL DEFAULT 'Clínico em Desenvolvimento',
  result_mid_title text NOT NULL DEFAULT '',
  result_mid_diagnostic text NOT NULL DEFAULT '',
  result_low_level text NOT NULL DEFAULT 'Executor Sem Controle Clínico',
  result_low_title text NOT NULL DEFAULT '',
  result_low_diagnostic text NOT NULL DEFAULT '',
  result_closing_text text NOT NULL DEFAULT '',
  
  -- Coupon
  coupon_code text NOT NULL DEFAULT 'MONT15',
  coupon_discount text NOT NULL DEFAULT '15%',
  coupon_timer_minutes integer NOT NULL DEFAULT 10,
  cta_url text NOT NULL DEFAULT '/#preco',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_page_id uuid NOT NULL REFERENCES public.quiz_pages(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  question text NOT NULL DEFAULT '',
  is_critical boolean NOT NULL DEFAULT false,
  weight integer NOT NULL DEFAULT 10,
  explanation text NOT NULL DEFAULT '',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.quiz_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Anyone can read published quiz pages"
ON public.quiz_pages FOR SELECT TO anon, authenticated
USING (status = 'published');

-- Authenticated can manage all
CREATE POLICY "Authenticated can manage quiz pages"
ON public.quiz_pages FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Public can read questions of published pages
CREATE POLICY "Anyone can read quiz questions"
ON public.quiz_questions FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.quiz_pages WHERE id = quiz_page_id AND status = 'published'));

-- Authenticated can manage questions
CREATE POLICY "Authenticated can manage quiz questions"
ON public.quiz_questions FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER quiz_pages_updated_at
  BEFORE UPDATE ON public.quiz_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
