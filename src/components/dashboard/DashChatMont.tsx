import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Send, Star, StarOff, ArrowLeft, Phone, Mail,
  MapPin, Play, Pause, Bot, User, Mic, FileText,
  Image as ImageIcon, Video, Sticker, Loader2, Volume2,
  MessageSquare, Eye, Heart, Filter, CalendarCheck, UserCheck,
  ShoppingCart, CheckCircle2, Circle, Flame, Snowflake, Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

/* ─── Types ─── */

interface Conversation {
  id: string;
  phone: string;
  contact_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  is_favorite: boolean;
  lead_id: string | null;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: string;
  message_type: string;
  content: string | null;
  media_url: string | null;
  audio_transcription: string | null;
  is_automated: boolean;
  status: string;
  external_id: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  uf: string;
  status: string;
  temperature: string | null;
  career: string;
  treatment: string;
  lead_number: number;
  quiz_score: number | null;
  reuniao_status: string | null;
  reuniao_data_extenso: string | null;
  created_at: string;
}

type FilterTab = "all" | "unread" | "favorites";

/* ─── Audio Player ─── */

const AudioPlayer = ({ src, messageId }: { src: string; messageId: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          if (audioRef.current) setProgress(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors shrink-0"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {duration ? `${Math.floor(progress)}s / ${Math.floor(duration)}s` : "..."}
        </span>
      </div>
    </div>
  );
};

/* ─── Format date ─── */

function formatConvDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd/MM", { locale: ptBR });
}

function formatMsgTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

function formatMsgDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "dd 'de' MMMM", { locale: ptBR });
}

/* ─── Phone helpers ─── */

function normalizePhoneDigits(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "").replace(/^55/, "");
}

function phonesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const phoneA = normalizePhoneDigits(a);
  const phoneB = normalizePhoneDigits(b);

  if (!phoneA || !phoneB) return false;
  if (phoneA === phoneB) return true;

  const aLast8 = phoneA.slice(-8);
  const bLast8 = phoneB.slice(-8);
  const aLast9 = phoneA.slice(-9);
  const bLast9 = phoneB.slice(-9);

  return aLast8 === bLast8 || aLast9 === bLast9;
}

/* ─── Status helpers ─── */

const statusLabels: Record<string, string> = {
  novo: "Novo",
  agendado: "Agendado",
  compareceu: "Compareceu",
  nao_compareceu: "Não Compareceu",
  convertido: "Convertido",
  perdido: "Perdido",
};

const tempColors: Record<string, string> = {
  quente: "bg-red-500/20 text-red-400",
  morno: "bg-amber-500/20 text-amber-400",
  frio: "bg-blue-500/20 text-blue-400",
};

/* ─── Main Component ─── */

const DashChatMont = ({ initialPhone, initialLeadName, onPhoneConsumed }: { initialPhone?: string | null; initialLeadName?: string | null; onPhoneConsumed?: () => void }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [transcribing, setTranscribing] = useState<string | null>(null);
  const [showLeadPanel, setShowLeadPanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (data) setConversations(data as unknown as Conversation[]);
    setLoadingConvs(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);


  // Auto-open conversation when initialPhone is provided (e.g. from Kanban)
  useEffect(() => {
    if (!initialPhone) return;
    const openOrCreate = async () => {
      // Fetch fresh conversations to avoid stale state
      const { data: freshConvs } = await supabase
        .from("whatsapp_conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      const allConvs = (freshConvs || []) as unknown as Conversation[];

      const match = allConvs.find((c) => phonesMatch(c.phone, initialPhone));
      if (match) {
        selectConversation(match);
      } else {
        const phoneDigits = initialPhone.replace(/\D/g, "");
        const fullPhone = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;
        const { data: newConv } = await supabase
          .from("whatsapp_conversations")
          .insert({
            phone: fullPhone,
            contact_name: initialLeadName || "Novo contato",
          })
          .select()
          .single();
        if (newConv) {
          await fetchConversations();
          selectConversation(newConv as unknown as Conversation);
        }
      }
      onPhoneConsumed?.();
    };
    openOrCreate();
  }, [initialPhone]);

  // Realtime conversations
  useEffect(() => {
    const channel = supabase
      .channel("wa-conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "whatsapp_conversations" }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  // Realtime messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) return;
    const channel = supabase
      .channel(`wa-messages-${selectedConvId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "whatsapp_messages",
        filter: `conversation_id=eq.${selectedConvId}`,
      }, (payload) => {
        const newMsg = payload.new as unknown as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "whatsapp_messages",
        filter: `conversation_id=eq.${selectedConvId}`,
      }, (payload) => {
        const updated = payload.new as unknown as Message;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConvId]);

  // Select conversation
  const selectConversation = async (conv: Conversation) => {
    setSelectedConvId(conv.id);
    setLoadingMsgs(true);
    setLead(null);

    // Fetch messages
    const { data: msgs } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(200);
    if (msgs) setMessages(msgs as unknown as Message[]);
    setLoadingMsgs(false);
    scrollToBottom();

    // Mark as read
    if (conv.unread_count > 0) {
      await supabase
        .from("whatsapp_conversations")
        .update({ unread_count: 0 })
        .eq("id", conv.id);
    }

    let linkedLead: Lead | null = null;

    // Fetch lead if linked
    if (conv.lead_id) {
      const { data: leadData } = await supabase
        .from("leads")
        .select("*")
        .eq("id", conv.lead_id)
        .single();
      if (leadData) linkedLead = leadData as unknown as Lead;
    }

    // Fallback for older conversations not yet linked by phone
    if (!linkedLead) {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .range(0, 999);

      const matchedLead = (leadsData as unknown as Lead[] | null)?.find((candidate) =>
        phonesMatch(candidate.phone, conv.phone)
      ) || null;

      if (matchedLead) {
        linkedLead = matchedLead;
        await supabase
          .from("whatsapp_conversations")
          .update({ lead_id: matchedLead.id })
          .eq("id", conv.id);

        setConversations((prev) =>
          prev.map((item) =>
            item.id === conv.id ? { ...item, lead_id: matchedLead.id } : item
          )
        );
      }
    }

    if (linkedLead) setLead(linkedLead);

    inputRef.current?.focus();
  };

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || !selectedConvId || sending) return;
    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ conversationId: selectedConvId, message: text }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha ao enviar");
      }
    } catch (e: any) {
      toast.error(e.message);
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  // Transcribe audio
  const handleTranscribe = async (msg: Message) => {
    if (!msg.media_url || transcribing) return;
    setTranscribing(msg.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ messageId: msg.id, audioUrl: msg.media_url }),
        }
      );
      if (!res.ok) throw new Error("Falha na transcrição");
      const { transcription } = await res.json();
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, audio_transcription: transcription } : m)
      );
      toast.success("Áudio transcrito!");
    } catch {
      toast.error("Erro ao transcrever áudio");
    } finally {
      setTranscribing(null);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase
      .from("whatsapp_conversations")
      .update({ is_favorite: !conv.is_favorite })
      .eq("id", conv.id);
    fetchConversations();
  };

  // Filtered conversations
  const filtered = conversations.filter((c) => {
    if (filter === "unread" && c.unread_count === 0) return false;
    if (filter === "favorites" && !c.is_favorite) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return c.contact_name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const d = formatMsgDate(msg.created_at);
    if (d !== lastDate) {
      groupedMessages.push({ date: d, msgs: [msg] });
      lastDate = d;
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] rounded-xl border border-border overflow-hidden bg-card">
      {/* ─── Sidebar: Conversations List ─── */}
      <div className={`w-80 border-r border-border flex flex-col shrink-0 ${selectedConvId ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary" />
              ChatMont
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {conversations.length} conversas
            </Badge>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "unread", "favorites"] as FilterTab[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Favoritas"}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Nenhuma conversa encontrada
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-muted/50 transition-colors flex gap-2.5 ${
                  selectedConvId === conv.id ? "bg-muted/70" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                  {conv.contact_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {conv.contact_name || conv.phone}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatConvDate(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.last_message || "..."}
                    </p>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {conv.unread_count > 0 && (
                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(conv, e)}
                        className="text-muted-foreground hover:text-amber-400 transition-colors"
                      >
                        {conv.is_favorite ? (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ) : (
                          <StarOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* ─── Chat Area ─── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedConvId ? "hidden md:flex" : "flex"}`}>
        {!selectedConvId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageSquare className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm">Selecione uma conversa para começar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <button className="md:hidden" onClick={() => setSelectedConvId(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {selectedConv?.contact_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedConv?.contact_name || selectedConv?.phone}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedConv?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {lead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/dash/lead/${lead.id}`)}
                    className="text-xs gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver Lead
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowLeadPanel(!showLeadPanel)}
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Nenhuma mensagem ainda
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date}>
                    <div className="flex justify-center my-3">
                      <span className="px-3 py-1 rounded-full bg-muted text-[10px] text-muted-foreground font-medium">
                        {group.date}
                      </span>
                    </div>
                    {group.msgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex mb-2 ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 relative group ${
                            msg.direction === "outgoing"
                              ? msg.is_automated
                                ? "bg-amber-500/10 border border-amber-500/20 text-foreground"
                                : "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {/* Automated badge */}
                          {msg.is_automated && (
                            <div className="flex items-center gap-1 mb-1">
                              <Bot className="w-3 h-3 text-amber-500" />
                              <span className="text-[9px] text-amber-500 font-medium">Automática</span>
                            </div>
                          )}

                          {/* Content by type */}
                          {msg.message_type === "audio" && msg.media_url ? (
                            <div className="space-y-1.5">
                              <AudioPlayer src={msg.media_url} messageId={msg.id} />
                              {msg.audio_transcription ? (
                                <div className="text-[10px] italic opacity-80 border-t border-border/30 pt-1 mt-1">
                                  <Volume2 className="w-2.5 h-2.5 inline mr-1" />
                                  {msg.audio_transcription}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleTranscribe(msg)}
                                  disabled={transcribing === msg.id}
                                  className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
                                >
                                  {transcribing === msg.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <FileText className="w-2.5 h-2.5" />
                                  )}
                                  Transcrever
                                </button>
                              )}
                            </div>
                          ) : msg.message_type === "image" && msg.media_url ? (
                            <div className="space-y-1">
                              <img
                                src={msg.media_url}
                                alt="Imagem"
                                className="max-w-full rounded-lg cursor-pointer"
                                onClick={() => window.open(msg.media_url!, "_blank")}
                              />
                              {msg.content && <p className="text-xs">{msg.content}</p>}
                            </div>
                          ) : msg.message_type === "document" ? (
                            <a
                              href={msg.media_url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs hover:underline"
                            >
                              <FileText className="w-4 h-4" />
                              {msg.content || "Documento"}
                            </a>
                          ) : msg.message_type === "video" && msg.media_url ? (
                            <video src={msg.media_url} controls className="max-w-full rounded-lg" />
                          ) : msg.message_type === "sticker" && msg.media_url ? (
                            <img src={msg.media_url} alt="Sticker" className="w-24 h-24" />
                          ) : (
                            <p className="text-xs whitespace-pre-wrap break-words">{msg.content}</p>
                          )}

                          {/* Time */}
                          <p className={`text-[9px] mt-1 text-right ${
                            msg.direction === "outgoing" && !msg.is_automated
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}>
                            {formatMsgTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2 items-center">
              <Input
                ref={inputRef}
                placeholder="Digite uma mensagem..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="h-9 text-sm"
                disabled={sending}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="h-9 w-9 shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* ─── Lead Info Panel ─── */}
      {selectedConvId && showLeadPanel && (
        <div className="w-72 border-l border-border shrink-0 hidden lg:flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Info do Lead
            </h3>
          </div>
          <ScrollArea className="flex-1 p-3">
            {lead ? (
              <div className="space-y-4">
                {/* Name & Number */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-base font-bold text-primary mb-1.5">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold">{lead.treatment} {lead.name}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">#{lead.lead_number}</Badge>
                </div>

                {/* Contact info compact */}
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /><span>{lead.phone}</span></div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /><span className="truncate">{lead.email}</span></div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /><span>{lead.city}/{lead.uf}</span></div>
                </div>

                {/* ─── MISSÕES (action steps) ─── */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Missões</p>
                  
                  {/* Mission 1: Agendar reunião */}
                  {(() => {
                    const done = ["agendado", "compareceu", "convertido"].includes(lead.status);
                    return (
                      <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                        done ? "border-emerald-500/30 bg-emerald-500/5" : 
                        lead.status === "novo" ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border bg-muted/30"
                      }`}>
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <CalendarCheck className={`w-5 h-5 shrink-0 ${lead.status === "novo" ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${done ? "text-emerald-400" : ""}`}>1. Agendar reunião</p>
                          <p className="text-[10px] text-muted-foreground">
                            {done && lead.reuniao_data_extenso ? lead.reuniao_data_extenso : done ? "Agendada ✓" : "Pendente"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Mission 2: Confirmar comparecimento */}
                  {(() => {
                    const done = ["compareceu", "convertido"].includes(lead.status);
                    const active = lead.status === "agendado";
                    const confirmed = lead.reuniao_status === "confirmada";
                    return (
                      <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                        done ? "border-emerald-500/30 bg-emerald-500/5" : 
                        active ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border bg-muted/20 opacity-50"
                      }`}>
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <UserCheck className={`w-5 h-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${done ? "text-emerald-400" : ""}`}>2. Confirmar presença</p>
                          <p className="text-[10px] text-muted-foreground">
                            {done ? "Compareceu ✓" : active && confirmed ? "Confirmada" : active ? "Aguardando confirmação" : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Mission 3: Comprar o curso */}
                  {(() => {
                    const done = lead.status === "convertido";
                    const active = lead.status === "compareceu";
                    return (
                      <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                        done ? "border-emerald-500/30 bg-emerald-500/5" : 
                        active ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border bg-muted/20 opacity-50"
                      }`}>
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <ShoppingCart className={`w-5 h-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${done ? "text-emerald-400" : ""}`}>3. Comprar o curso</p>
                          <p className="text-[10px] text-muted-foreground">
                            {done ? "Pago ✓" : active ? "Em negociação" : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ─── Temperatura (secondary) ─── */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Temperatura</p>
                  <div className="flex gap-1">
                    {(["frio", "morno", "quente"] as const).map((t) => {
                      const active = lead.temperature === t;
                      const icons = { frio: Snowflake, morno: Flame, quente: Zap };
                      const colors = {
                        frio: active ? "bg-blue-500/20 text-blue-400 border-blue-500/40" : "border-border text-muted-foreground hover:border-blue-500/30",
                        morno: active ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "border-border text-muted-foreground hover:border-amber-500/30",
                        quente: active ? "bg-red-500/20 text-red-400 border-red-500/40" : "border-border text-muted-foreground hover:border-red-500/30",
                      };
                      const Icon = icons[t];
                      return (
                        <button
                          key={t}
                          onClick={async () => {
                            const newTemp = lead.temperature === t ? "frio" : t;
                            await supabase.from("leads").update({ temperature: newTemp }).eq("id", lead.id);
                            setLead((prev) => prev ? { ...prev, temperature: newTemp } : prev);
                          }}
                          className={`flex-1 flex flex-col items-center gap-0.5 p-1.5 rounded-md border text-[10px] transition-all cursor-pointer ${colors[t]}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="capitalize">{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specialty & Quiz compact */}
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-muted/50 text-xs">
                    <span className="text-muted-foreground">Especialidade: </span>
                    <span className="font-medium">{lead.career}</span>
                  </div>
                  {lead.quiz_score != null && (
                    <div className="p-2 rounded-lg bg-muted/50 text-xs">
                      <span className="text-muted-foreground">Quiz: </span>
                      <span className="font-bold text-primary">{lead.quiz_score}%</span>
                    </div>
                  )}
                </div>

                {/* Open full detail */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate(`/dash/lead/${lead.id}`)}
                >
                  <Eye className="w-3 h-3 mr-1.5" /> Abrir Ficha Completa
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                <User className="w-8 h-8 mx-auto opacity-30" />
                <p>Lead não vinculado</p>
                <p className="text-[10px]">Este número não está associado a nenhum lead cadastrado</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default DashChatMont;
