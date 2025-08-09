import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy,
  Plus,
  BarChart3,
  Globe,
  Code,
  Eye,
  Calendar,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackingPixel {
  id: string;
  name: string;
  website: string;
  pixelCode: string;
  leads: number;
  conversions: number;
  createdAt: string;
  isActive: boolean;
}

export default function Tracking() {
  const [pixels, setPixels] = useState<TrackingPixel[]>([]);
  const [newPixel, setNewPixel] = useState({ name: "", website: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<TrackingPixel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular dados de pixels para demonstração
    const mockPixels: TrackingPixel[] = [
      {
        id: "px_001",
        name: "Site Principal",
        website: "www.meusite.com",
        pixelCode: "px_001",
        leads: 15,
        conversions: 3,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: "px_002",
        name: "Landing Page Produto A",
        website: "produto-a.meusite.com",
        pixelCode: "px_002",
        leads: 8,
        conversions: 2,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      },
      {
        id: "px_003",
        name: "Blog",
        website: "blog.meusite.com",
        pixelCode: "px_003",
        leads: 4,
        conversions: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false
      }
    ];
    
    setPixels(mockPixels);
    setLoading(false);
  }, []);

  const generatePixelCode = () => {
    return `px_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createPixel = () => {
    if (!newPixel.name || !newPixel.website) return;

    const pixel: TrackingPixel = {
      id: generatePixelCode(),
      name: newPixel.name,
      website: newPixel.website,
      pixelCode: generatePixelCode(),
      leads: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    setPixels(prev => [...prev, pixel]);
    setNewPixel({ name: "", website: "" });
    setIsDialogOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você poderia adicionar um toast de sucesso
  };

  const generateTrackingScript = (pixelCode: string) => {
    const baseUrl = window.location.origin;
    return `<!-- LeadHub Tracking Pixel -->
<script>
(function() {
  var pixel = '${pixelCode}';
  var baseUrl = '${baseUrl}';
  
  // Função para enviar lead
  window.LeadHub = {
    track: function(leadData) {
      fetch(baseUrl + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          source: pixel,
          _pixel: pixel,
          _referrer: document.referrer,
          _url: window.location.href
        })
      }).catch(function(e) { console.log('LeadHub tracking error:', e); });
    }
  };
  
  // Tracking automático de pageview
  var img = new Image();
  img.src = baseUrl + '/api/tracking/pageview?pixel=' + pixel + '&url=' + encodeURIComponent(window.location.href);
})();
</script>`;
  };

  const generateFormExample = (pixelCode: string) => {
    return `<!-- Exemplo de formulário com tracking -->
<form onsubmit="handleFormSubmit(event)">
  <input type="text" name="name" placeholder="Nome" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="tel" name="phone" placeholder="WhatsApp">
  <input type="text" name="company" placeholder="Empresa">
  <textarea name="message" placeholder="Mensagem"></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
function handleFormSubmit(event) {
  event.preventDefault();
  var form = event.target;
  var formData = new FormData(form);
  
  // Enviar lead para LeadHub
  LeadHub.track({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    message: formData.get('message')
  });
  
  // Aqui você pode adicionar sua lógica de envio normal do formulário
  alert('Lead enviado com sucesso!');
  form.reset();
}
</script>`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  const totalLeads = pixels.reduce((sum, pixel) => sum + pixel.leads, 0);
  const totalConversions = pixels.reduce((sum, pixel) => sum + pixel.conversions, 0);
  const conversionRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0";

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
          <h1 className="text-3xl font-bold text-foreground">Pixels de Rastreamento</h1>
          <p className="text-muted-foreground">
            Monitore de onde vêm seus leads criando pixels para seus sites
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pixel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Pixel</DialogTitle>
              <DialogDescription>
                Crie um pixel de rastreamento para monitorar leads de um site específico
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Pixel</Label>
                <Input
                  id="name"
                  placeholder="Ex: Site Principal, Landing Page..."
                  value={newPixel.name}
                  onChange={(e) => setNewPixel(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="Ex: www.meusite.com"
                  value={newPixel.website}
                  onChange={(e) => setNewPixel(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <Button onClick={createPixel} className="w-full">
                Criar Pixel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pixels</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pixels.length}</div>
            <p className="text-xs text-muted-foreground">
              {pixels.filter(p => p.isActive).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Todos os pixels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              Leads convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Média geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pixels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Pixels de Rastreamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Conversões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pixels.map((pixel) => (
                  <TableRow key={pixel.id}>
                    <TableCell className="font-medium">{pixel.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {pixel.website}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {pixel.pixelCode}
                      </Badge>
                    </TableCell>
                    <TableCell>{pixel.leads}</TableCell>
                    <TableCell>{pixel.conversions}</TableCell>
                    <TableCell>
                      <Badge variant={pixel.isActive ? "default" : "secondary"}>
                        {pixel.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(pixel.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPixel(pixel)}>
                            <Code className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Código do Pixel: {pixel.name}</DialogTitle>
                            <DialogDescription>
                              Copie e cole este código no seu site para começar a rastrear leads
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>1. Código do Pixel (adicione no &lt;head&gt; do site)</Label>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyToClipboard(generateTrackingScript(pixel.pixelCode))}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar
                                </Button>
                              </div>
                              <Textarea
                                value={generateTrackingScript(pixel.pixelCode)}
                                readOnly
                                className="font-mono text-xs h-32"
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>2. Exemplo de Formulário com Tracking</Label>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyToClipboard(generateFormExample(pixel.pixelCode))}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar
                                </Button>
                              </div>
                              <Textarea
                                value={generateFormExample(pixel.pixelCode)}
                                readOnly
                                className="font-mono text-xs h-64"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar os Pixels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold">Crie um novo pixel</h3>
                <p className="text-sm text-muted-foreground">
                  Clique em "Novo Pixel" e defina um nome e o website que será monitorado
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold">Instale o código no seu site</h3>
                <p className="text-sm text-muted-foreground">
                  Copie o código do pixel e adicione na seção &lt;head&gt; do seu website
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold">Configure seus formulários</h3>
                <p className="text-sm text-muted-foreground">
                  Use a função LeadHub.track() nos seus formulários para enviar leads automaticamente
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-semibold">Monitore os resultados</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe quantos leads cada site está gerando na sua dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
