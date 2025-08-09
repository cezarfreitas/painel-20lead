import { useState, useEffect } from "react";
import { Lead, GetLeadsResponse, UpdateLeadRequest, UpdateLeadResponse } from "@shared/api";
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
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", 
  qualified: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  converted: "bg-green-500/10 text-green-500 border-green-500/20",
  lost: "bg-red-500/10 text-red-500 border-red-500/20"
};

const priorityColors = {
  low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20"
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchLeads();
  }, [search]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append("search", search);

      const response = await fetch(`/api/leads?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as GetLeadsResponse;

      if (data.success) {
        setLeads(data.leads);
      } else {
        console.error("Failed to fetch leads:", data);
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };


  const updateLeadPriority = async (leadId: string, priority: Lead["priority"]) => {
    try {
      const updates: UpdateLeadRequest = { priority };
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      
      const data = (await response.json()) as UpdateLeadResponse;
      
      if (data.success) {
        // Update local state
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, priority, updatedAt: new Date().toISOString() } : lead
        ));
      }
    } catch (error) {
      console.error("Error updating lead:", error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Leads</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os leads recebidos através dos seus formulários
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            

          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lead encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Lead</TableHead>
                    <TableHead className="w-[200px]">WhatsApp</TableHead>
                    <TableHead className="w-[150px]">Empresa</TableHead>
                    <TableHead className="w-[120px]">Origem</TableHead>
                    <TableHead className="w-[140px]">Data</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="w-[250px]">
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          {lead.message && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {lead.message}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="w-[200px]">
                        <div className="space-y-1">
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="w-[150px]">
                        {lead.company && (
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{lead.company}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="w-[120px]">
                        <Badge variant="outline" className="text-xs">
                          {lead.source}
                        </Badge>
                      </TableCell>

                      <TableCell className="w-[140px]">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{formatDate(lead.createdAt)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="w-[50px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Enviar email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
