import React from "react";
import { WebhookField } from "@shared/webhooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";

interface WebhookFieldsConfigProps {
  customFields: WebhookField[];
  sendFields: string[];
  onAddCustomField: () => void;
  onUpdateCustomField: (index: number, field: Partial<WebhookField>) => void;
  onRemoveCustomField: (index: number) => void;
  onToggleSendField: (fieldName: string) => void;
}

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

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "url", label: "URL" },
  { value: "boolean", label: "Sim/Não" }
];

export default function WebhookFieldsConfig({
  customFields,
  sendFields,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
  onToggleSendField
}: WebhookFieldsConfigProps) {
  const allFields = [
    ...defaultFields,
    ...customFields.map(cf => ({ name: cf.name, label: cf.label || cf.name }))
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="send-fields" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send-fields">Campos Enviados</TabsTrigger>
          <TabsTrigger value="custom-fields">Campos Personalizados</TabsTrigger>
        </TabsList>

        <TabsContent value="send-fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selecionar Campos para Enviar</CardTitle>
              <p className="text-xs text-muted-foreground">
                Escolha quais campos serão incluídos no payload do webhook
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {allFields.map((field) => (
                <div key={field.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`send-${field.name}`}
                    checked={sendFields.includes(field.name)}
                    onCheckedChange={() => onToggleSendField(field.name)}
                  />
                  <Label htmlFor={`send-${field.name}`} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Campos Personalizados</CardTitle>
              <p className="text-xs text-muted-foreground">
                Defina campos adicionais que podem ser enviados na API
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {customFields.map((field, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Campo {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveCustomField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`field-name-${index}`} className="text-xs">
                        Nome do Campo
                      </Label>
                      <Input
                        id={`field-name-${index}`}
                        placeholder="ex: budget"
                        value={field.name}
                        onChange={(e) =>
                          onUpdateCustomField(index, { name: e.target.value })
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`field-label-${index}`} className="text-xs">
                        Rótulo
                      </Label>
                      <Input
                        id={`field-label-${index}`}
                        placeholder="ex: Orçamento"
                        value={field.label}
                        onChange={(e) =>
                          onUpdateCustomField(index, { label: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`field-type-${index}`} className="text-xs">
                        Tipo
                      </Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          onUpdateCustomField(index, { type: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <Checkbox
                        id={`field-required-${index}`}
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          onUpdateCustomField(index, { required: !!checked })
                        }
                      />
                      <Label htmlFor={`field-required-${index}`} className="text-xs">
                        Obrigatório
                      </Label>
                    </div>
                  </div>

                  {field.type !== "boolean" && (
                    <div>
                      <Label htmlFor={`field-default-${index}`} className="text-xs">
                        Valor Padrão (opcional)
                      </Label>
                      <Input
                        id={`field-default-${index}`}
                        placeholder="Valor padrão"
                        value={field.defaultValue || ""}
                        onChange={(e) =>
                          onUpdateCustomField(index, { defaultValue: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={onAddCustomField}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Campo Personalizado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
