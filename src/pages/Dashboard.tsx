import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3, List, Columns3, MessageSquare, Settings, FileText, Users } from "lucide-react";
import DashReports from "@/components/dashboard/DashReports";
import DashLeadsList from "@/components/dashboard/DashLeadsList";
import DashKanban from "@/components/dashboard/DashKanban";
import DashMessaging from "@/components/dashboard/DashMessaging";
import DashSettings from "@/components/dashboard/DashSettings";
import DashContent from "@/components/dashboard/DashContent";
import DashUsers from "@/components/dashboard/DashUsers";
import DashDateFilter, { type DatePreset, getDateRange } from "@/components/dashboard/DashDateFilter";
import type { Session } from "@supabase/supabase-js";
import { startOfDay, endOfDay } from "date-fns";

export type Lead = Tables<"leads">;

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>("mes");
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  const [topTab, setTopTab] = useState<"dashboard" | "content">("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate("/dash/login");
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/dash/login");
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data);
  };

  useEffect(() => {
    if (session) fetchLeads();
  }, [session]);

  const filteredLeads = useMemo(() => {
    const range = getDateRange(datePreset, customRange);
    const from = startOfDay(range.from);
    const to = endOfDay(range.to);
    return leads.filter((lead) => {
      const created = new Date(lead.created_at);
      return created >= from && created <= to;
    });
  }, [leads, datePreset, customRange]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/dash/login");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo-metodo-mont.svg" alt="Método Mont'" className="h-6" />
            <div className="flex items-center bg-muted rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setTopTab("dashboard")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  topTab === "dashboard"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
                Dashboard
              </button>
              <button
                onClick={() => setTopTab("content")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  topTab === "content"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                Conteúdo
              </button>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {topTab === "dashboard" ? (
          <>
            <div className="mb-6">
              <DashDateFilter
                preset={datePreset}
                onPresetChange={setDatePreset}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
              />
            </div>

            <Tabs defaultValue="reports" className="space-y-6">
              <TabsList>
                <TabsTrigger value="reports" className="gap-1.5">
                  <BarChart3 className="w-4 h-4" /> Relatórios
                </TabsTrigger>
                <TabsTrigger value="leads" className="gap-1.5">
                  <List className="w-4 h-4" /> Leads
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-1.5">
                  <Columns3 className="w-4 h-4" /> Kanban
                </TabsTrigger>
                <TabsTrigger value="messaging" className="gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Mensageria
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings className="w-4 h-4" /> Configurações
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-1.5">
                  <Users className="w-4 h-4" /> Usuários
                </TabsTrigger>
              </TabsList>
              <TabsContent value="reports">
                <DashReports leads={filteredLeads} />
              </TabsContent>
              <TabsContent value="leads">
                <DashLeadsList leads={filteredLeads} onRefresh={fetchLeads} />
              </TabsContent>
              <TabsContent value="kanban">
                <DashKanban leads={filteredLeads} onRefresh={fetchLeads} />
              </TabsContent>
              <TabsContent value="messaging">
                <DashMessaging />
              </TabsContent>
              <TabsContent value="settings">
                <DashSettings />
              </TabsContent>
              <TabsContent value="users">
                <DashUsers />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <DashContent />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
