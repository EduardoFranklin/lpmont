
-- Conversations table
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  contact_name TEXT NOT NULL DEFAULT '',
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage conversations" ON public.whatsapp_conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon can insert conversations" ON public.whatsapp_conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update conversations" ON public.whatsapp_conversations
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Anon can select conversations" ON public.whatsapp_conversations
  FOR SELECT TO anon USING (true);

-- Messages table
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'incoming' CHECK (direction IN ('incoming', 'outgoing')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image', 'document', 'video', 'sticker')),
  content TEXT,
  media_url TEXT,
  audio_transcription TEXT,
  is_automated BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'pending')),
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage messages" ON public.whatsapp_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon can insert messages" ON public.whatsapp_messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can select messages" ON public.whatsapp_messages
  FOR SELECT TO anon USING (true);

-- Index for fast lookups
CREATE INDEX idx_wa_messages_conversation ON public.whatsapp_messages(conversation_id, created_at DESC);
CREATE INDEX idx_wa_conversations_phone ON public.whatsapp_conversations(phone);
CREATE INDEX idx_wa_conversations_lead ON public.whatsapp_conversations(lead_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;

-- Triggers for updated_at
CREATE TRIGGER update_wa_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
