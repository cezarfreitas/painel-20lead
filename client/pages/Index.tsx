import { useState, useEffect } from "react";
import { DashboardStatsResponse, Lead } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Eye,
  ArrowRight,
  BarChart3,
  PieChart
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = (await response.json()) as DashboardStatsResponse;
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusLabel = (status: Lead["status"]) => {
    const labels = {
      new: "Novo",
      contacted: "Contatado", 
      qualified: "Qualificado",
      converted: "Convertido",
      lost: "Perdido"
    };
    return labels[status];
  };

  const getPriorityColor = (priority: Lead["priority"]) => {
    const colors = {
      low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      high: "bg-red-500/10 text-red-500 border-red-500/20"
    };
    return colors[priority];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Leads</h1>
          <p className="text-muted-foreground">
            Visão geral dos leads recebidos através dos seus formulários
          </p>
        </div>
        <Button asChild>
          <Link to="/leads">
            Ver todos os leads
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Todos os leads recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats?.newLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando primeiro contato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.convertedLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              Leads que se tornaram clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats?.totalLeads && stats.totalLeads > 0 
                ? Math.round((stats.convertedLeads / stats.totalLeads) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de conversão atual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Leads */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Leads Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentLeads && stats.recentLeads.length > 0 ? (
              <div className="space-y-4">
                {stats.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-start justify-between p-3 rounded-lg border">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lead.name}</span>
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(lead.priority)}
                        >
                          {lead.priority === "high" ? "Alta" : lead.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      {lead.company && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-3 w-3" />
                          {lead.company}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {getStatusLabel(lead.status)}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/leads">Ver todos os leads</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum lead recente
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats by Status */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Leads por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.leadsByStatus && Object.keys(stats.leadsByStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === "new" ? "bg-blue-500" :
                        status === "contacted" ? "bg-yellow-500" :
                        status === "qualified" ? "bg-purple-500" :
                        status === "converted" ? "bg-green-500" : "bg-red-500"
                      }`} />
                      <span className="text-sm">{getStatusLabel(status as Lead["status"])}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <Link to="/leads">
                <div className="text-left">
                  <div className="font-medium">Gerenciar Leads</div>
                  <div className="text-sm text-muted-foreground">
                    Visualizar e editar todos os leads
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <Link to="/webhooks">
                <div className="text-left">
                  <div className="font-medium">Configurar Webhooks</div>
                  <div className="text-sm text-muted-foreground">
                    Integrar com sistemas externos
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4" asChild>
              <Link to="/reports">
                <div className="text-left">
                  <div className="font-medium">Relatórios</div>
                  <div className="text-sm text-muted-foreground">
                    Análises e métricas detalhadas
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Integração via API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use o endpoint abaixo para enviar leads dos seus formulários externos:
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div className="text-green-600">POST</div>
              <div className="mt-1">
                {window.location.origin}/api/leads
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Campos obrigatórios:</strong> name, email, source<br />
              <strong>Campos opcionais:</strong> phone, company, message, tags[]
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
