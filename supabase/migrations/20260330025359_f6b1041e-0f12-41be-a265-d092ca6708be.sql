
ALTER TABLE public.quiz_pages
ADD COLUMN page_type text NOT NULL DEFAULT 'video_quiz',
ADD COLUMN video_locked boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.quiz_pages.page_type IS 'video_only, quiz_only, or video_quiz';
COMMENT ON COLUMN public.quiz_pages.video_locked IS 'When true, video requires form unlock before viewing';
