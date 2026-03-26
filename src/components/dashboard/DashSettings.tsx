import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Code2, AlertTriangle, CalendarCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SettingField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  rows: number;
}

const SETTINGS: SettingField[] = [
  {
    key: "meta_pixel",
    label: "Meta Pixel (Facebook)",
    description: "Cole o código do pixel do Meta/Facebook. Será inserido no <head>.",
    placeholder: "<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)...\n</script>",
    rows: 6,
  },
  {
    key: "google_tag",
    label: "Google Tag Manager",
    description: "Cole o código do GTM. A parte do <script> vai no <head> e o <noscript> no <body>.",
    placeholder: "<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i)...</script>",
    rows: 6,
  },
  {
    key: "google_analytics",
    label: "Google Analytics (GA4)",
    description: "Cole o código do Google Analytics 4. Será inserido no <head>.",
    placeholder: '<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>',
    rows: 5,
  },
  {
    key: "tiktok_pixel",
    label: "TikTok Pixel",
    description: "Cole o código do pixel do TikTok. Será inserido no <head>.",
    placeholder: "<!-- TikTok Pixel Code -->\n<script>...",
    rows: 5,
  },
  {
    key: "custom_head",
    label: "Scripts personalizados (Head)",
    description: "Qualquer código adicional que deseja inserir no <head> da página.",
    placeholder: "<script>...</script>\n<link ...>",
    rows: 4,
  },
  {
    key: "custom_body",
    label: "Scripts personalizados (Body)",
    description: "Qualquer código adicional que deseja inserir no final do <body>.",
    placeholder: "<script>...</script>\n<noscript>...</noscript>",
    rows: 4,
  },
];

const DashSettings = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkGoogleConnection();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (data as any[])?.forEach((row: any) => {
      map[row.key] = row.value || "";
    });
    setValues(map);
    setLoading(false);
  };

  const checkGoogleConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("google_oauth_tokens")
      .select("email")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setGoogleConnected(true);
      setGoogleEmail(data.email || null);
    }
  };

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const redirectUri = `https://${projectId}.supabase.co/functions/v1/google-auth-callback`;

      const { data, error } = await supabase.functions.invoke("google-auth-callback", {
        body: { redirectUri, userId: user.id },
      });

      if (error) throw error;
      if (!data?.authUrl) throw new Error("URL de autorização não retornada");

      // Listen for success message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "google-auth-success") {
          window.removeEventListener("message", handleMessage);
          setGoogleConnected(true);
          checkGoogleConnection();
          toast.success("Google Calendar conectado com sucesso!");
          setConnectingGoogle(false);
        }
      };
      window.addEventListener("message", handleMessage);

      window.open(
        data.authUrl,
        "google_auth",
        "width=500,height=700,scrollbars=yes,resizable=yes"
      );

      // Timeout after 2 minutes
      setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        setConnectingGoogle(false);
      }, 120000);
    } catch (err) {
      console.error("Google auth error:", err);
      toast.error("Erro ao conectar Google Calendar");
      setConnectingGoogle(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const setting of SETTINGS) {
      const value = values[setting.key] || "";
      await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", setting.key);
    }
    setSaving(false);
    toast.success("Configurações salvas! As alterações serão aplicadas no site.");
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* Google Calendar integration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" /> Google Calendar + Meet
          </CardTitle>
          <CardDescription className="text-xs">
            Conecte sua conta do Google para criar eventos com Google Meet automaticamente quando um lead agenda uma reunião.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {googleConnected ? (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-foreground/70">
                Conectado{googleEmail ? ` como ${googleEmail}` : ""}
              </span>
              <Button variant="outline" size="sm" className="ml-auto text-xs" onClick={handleConnectGoogle}>
                Reconectar
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnectGoogle}
              disabled={connectingGoogle}
              variant="outline"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {connectingGoogle ? "Aguardando autorização..." : "Conectar Google Calendar"}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Os scripts inseridos aqui serão carregados automaticamente em todas as páginas públicas do site.
          Certifique-se de colar apenas códigos de fontes confiáveis.
        </p>
      </div>

      {SETTINGS.map((setting) => (
        <Card key={setting.key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4" /> {setting.label}
            </CardTitle>
            <CardDescription className="text-xs">{setting.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={values[setting.key] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
              rows={setting.rows}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono leading-relaxed"
              placeholder={setting.placeholder}
              spellCheck={false}
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={saving} className="gap-1.5">
          <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar todas as configurações"}
        </Button>
      </div>
    </div>
  );
};

export default DashSettings;
