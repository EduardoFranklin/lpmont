import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Code2, AlertTriangle, Plug } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import DashIntegrations from "./DashIntegrations";

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

  useEffect(() => {
    fetchSettings();
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

  return (
    <Tabs defaultValue="scripts" className="space-y-6">
      <TabsList>
        <TabsTrigger value="scripts" className="gap-1.5">
          <Code2 className="w-4 h-4" /> Scripts
        </TabsTrigger>
        <TabsTrigger value="integrations" className="gap-1.5">
          <Plug className="w-4 h-4" /> Integrações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="scripts">
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-6">
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
        )}
      </TabsContent>

      <TabsContent value="integrations">
        <DashIntegrations />
      </TabsContent>
    </Tabs>
  );
};

export default DashSettings;
