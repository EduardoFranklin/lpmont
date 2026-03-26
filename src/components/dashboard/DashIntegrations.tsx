import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Unlink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

const DashIntegrations = () => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    checkGoogleConnection();
  }, []);

  const checkGoogleConnection = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("google_oauth_tokens")
      .select("email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setGoogleConnected(true);
      setGoogleEmail((data as any).email || null);
    } else {
      setGoogleConnected(false);
      setGoogleEmail(null);
    }
    setLoading(false);
  };

  const handleConnectGoogle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Usuário não autenticado"); return; }

    // We need the GOOGLE_CLIENT_ID from an edge function since it's a secret
    const { data, error } = await supabase.functions.invoke("google-auth-start", {
      body: { user_id: user.id, redirect_url: window.location.href },
    });

    if (error || !data?.url) {
      toast.error("Erro ao iniciar conexão com Google. Verifique se as credenciais estão configuradas.");
      return;
    }

    window.location.href = data.url;
  };

  const handleDisconnectGoogle = async () => {
    setDisconnecting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setDisconnecting(false); return; }

    const { error } = await supabase
      .from("google_oauth_tokens")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao desconectar");
    } else {
      setGoogleConnected(false);
      setGoogleEmail(null);
      toast.success("Google desconectado com sucesso");
    }
    setDisconnecting(false);
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google Calendar + Meet
          </CardTitle>
          <CardDescription className="text-xs">
            Conecte sua conta Google para criar eventos no Calendar e gerar links do Meet automaticamente quando um lead agendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {googleConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-foreground/70">
                  Conectado como <span className="font-medium text-foreground">{googleEmail || "conta Google"}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Eventos serão criados automaticamente nesta conta quando leads agendarem.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGoogle}
                disabled={disconnecting}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                Nenhuma conta conectada
              </div>
              <Button onClick={handleConnectGoogle} size="sm" className="gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Conectar conta Google
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashIntegrations;
