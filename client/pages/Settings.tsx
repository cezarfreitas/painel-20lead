import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Cog, Wrench } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Configure integrações, notificações e personalize seu sistema de leads
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Página em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Cog className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configurações em Breve</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Esta página permitirá configurar integrações com formulários externos, 
              definir notificações automáticas, personalizar campos dos leads e muito mais.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Wrench className="h-4 w-4" />
              Continue fazendo prompts para implementar esta funcionalidade
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
