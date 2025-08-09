import { useState, useEffect } from "react";
import {
  Webhook,
  CreateWebhookRequest,
  GetWebhooksResponse,
  WebhookResponse,
  WebhookField,
} from "@shared/webhooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Webhook as WebhookIcon,
  Globe,
  CheckCircle,
  XCircle,
  Calendar,
  MoreHorizontal,
  Activity,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    customFields: [] as WebhookField[],
    sendFields: [] as string[]
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/webhooks");
      const data = (await response.json()) as GetWebhooksResponse;

      if (data.success) {
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) return;

    try {
      const webhookData: CreateWebhookRequest = {
        name: newWebhook.name,
        url: newWebhook.url,
        customFields: newWebhook.customFields,
        sendFields: newWebhook.sendFields,
      };

      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as WebhookResponse;

      if (data.success && data.webhook) {
        setWebhooks((prev) => [...prev, data.webhook!]);
        setNewWebhook({
          name: "",
          url: "",
          customFields: [],
          sendFields: []
        });
        setIsDialogOpen(false);
      } else {
        alert("Erro ao criar webhook: " + (data.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
      alert("Erro ao criar webhook");
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as WebhookResponse;

      if (data.success && data.webhook) {
        setWebhooks((prev) =>
          prev.map((wh) => (wh.id === webhookId ? data.webhook! : wh)),
        );
      } else {
        console.error("Failed to update webhook:", data.error);
        alert("Erro ao atualizar webhook: " + (data.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Error updating webhook:", error);
      alert("Erro ao atualizar webhook. Tente novamente.");
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm("Tem certeza que deseja excluir este webhook?")) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWebhooks((prev) => prev.filter((wh) => wh.id !== webhookId));
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Functions for managing custom fields
  const addCustomField = () => {
    setNewWebhook(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { name: "", label: "", type: "text", required: false }
      ]
    }));
  };

  const updateCustomField = (index: number, field: Partial<WebhookField>) => {
    setNewWebhook(prev => ({
      ...prev,
      customFields: prev.customFields.map((cf, i) =>
        i === index ? { ...cf, ...field } : cf
      )
    }));
  };

  const removeCustomField = (index: number) => {
    setNewWebhook(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const toggleSendField = (fieldName: string) => {
    setNewWebhook(prev => ({
      ...prev,
      sendFields: prev.sendFields.includes(fieldName)
        ? prev.sendFields.filter(f => f !== fieldName)
        : [...prev.sendFields, fieldName]
    }));
  };

  // Available default fields
  const defaultFields = [
    { name: "phone", label: "Telefone/WhatsApp" },
    { name: "source", label: "Origem" },
    { name: "name", label: "Nome" },
    { name: "email", label: "Email" },
    { name: "company", label: "Empresa" },
    { name: "message", label: "Mensagem" },
    { name: "status", label: "Status" },
    { name: "priority", label: "Prioridade" },
    { name: "tags", label: "Tags" },
    { name: "createdAt", label: "Data de Criação" }
  ];

  const totalWebhooks = webhooks.length;
  const activeWebhooks = webhooks.filter((wh) => wh.isActive).length;
  const totalSuccess = webhooks.reduce((sum, wh) => sum + wh.successCount, 0);
  const totalFailures = webhooks.reduce((sum, wh) => sum + wh.failureCount, 0);
  const successRate =
    totalSuccess + totalFailures > 0
      ? ((totalSuccess / (totalSuccess + totalFailures)) * 100).toFixed(1)
      : "100";

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
          <h1 className="text-3xl font-bold text-foreground">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure webhooks para reenviar leads automaticamente para seus
            sistemas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
              <DialogDescription>
                Adicione uma URL que receberá os leads automaticamente quando
                eles forem criados
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Webhook</Label>
                <Input
                  id="name"
                  placeholder="Ex: Sistema CRM, Email Marketing..."
                  value={newWebhook.name}
                  onChange={(e) =>
                    setNewWebhook((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="url">URL do Webhook</Label>
                <Input
                  id="url"
                  placeholder="https://api.seucrm.com/webhooks/leads"
                  value={newWebhook.url}
                  onChange={(e) =>
                    setNewWebhook((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
              </div>
              <Button onClick={createWebhook} className="w-full">
                Criar Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Webhooks
            </CardTitle>
            <WebhookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWebhooks}</div>
            <p className="text-xs text-muted-foreground">
              {activeWebhooks} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entregas Bem-sucedidas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {totalSuccess}
            </div>
            <p className="text-xs text-muted-foreground">Total de sucessos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totalFailures}
            </div>
            <p className="text-xs text-muted-foreground">Total de falhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {successRate}%
            </div>
            <p className="text-xs text-muted-foreground">Taxa média</p>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8">
              <WebhookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum webhook configurado
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure webhooks para reenviar leads automaticamente para seus
                sistemas
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Webhook
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sucessos</TableHead>
                    <TableHead>Falhas</TableHead>
                    <TableHead>Último Envio</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">
                        {webhook.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate text-sm">
                            {webhook.url}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={webhook.isActive}
                            onCheckedChange={(checked) =>
                              toggleWebhook(webhook.id, checked)
                            }
                          />
                          <Badge
                            variant={webhook.isActive ? "default" : "secondary"}
                          >
                            {webhook.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {webhook.successCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {webhook.failureCount > 0 && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                          {webhook.failureCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.lastTriggered ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(webhook.lastTriggered)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Nunca
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Zap className="h-4 w-4 mr-2" />
                              Testar Webhook
                            </DropdownMenuItem>
                            <DropdownMenuItem>Ver Logs</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteWebhook(webhook.id)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funcionam os Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Lead é recebido</h3>
                <p className="text-sm text-muted-foreground">
                  Quando um lead é criado via API, o sistema processa e salva os
                  dados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Webhooks são disparados</h3>
                <p className="text-sm text-muted-foreground">
                  Automaticamente, todos os webhooks ativos recebem os dados do
                  lead
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Tentativas automáticas</h3>
                <p className="text-sm text-muted-foreground">
                  Se um webhook falhar, o sistema tentará novamente até 3 vezes
                  automaticamente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">Logs e monitoramento</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o status de cada entrega e identifique problemas
                  rapidamente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
