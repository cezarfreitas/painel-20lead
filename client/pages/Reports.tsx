import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, TrendingUp } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">
          Análises detalhadas e relatórios de performance dos seus leads
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Página em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Relatórios em Breve</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Esta página está sendo desenvolvida e em breve você terá acesso a relatórios 
              detalhados sobre o desempenho dos seus leads, métricas de conversão e análises avançadas.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Continue fazendo prompts para implementar esta funcionalidade
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
