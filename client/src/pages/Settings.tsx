import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">Gerencie suas preferências e informações de conta</p>
        </div>

        <div className="grid gap-6">
          {/* Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Seus dados de conta e papel no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-lg font-semibold mt-1">{user?.name || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg font-semibold mt-1">{user?.email || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Papel Global</label>
                <div className="mt-1">
                  <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
                    {user?.role === "ADMIN" ? "Administrador" : user?.role === "GERENTE" ? "Gerente" : "Membro"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sobre o Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
              <CardDescription>Informações sobre o microsserviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Versão</label>
                <p className="text-lg font-semibold mt-1">1.0.0</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <p className="text-lg font-semibold mt-1">Microsserviço de Gerenciamento</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tecnologia</label>
                <p className="text-lg font-semibold mt-1">React + FastAPI + tRPC</p>
              </div>
            </CardContent>
          </Card>

          {/* Papéis e Permissões */}
          <Card>
            <CardHeader>
              <CardTitle>Papéis e Permissões</CardTitle>
              <CardDescription>Entenda os diferentes papéis do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">ADMIN</p>
                      <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
                    </div>
                    <Badge>Máximo</Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">GERENTE</p>
                      <p className="text-sm text-muted-foreground">Pode criar e gerenciar projetos</p>
                    </div>
                    <Badge variant="secondary">Médio</Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">MEMBRO</p>
                      <p className="text-sm text-muted-foreground">Acesso limitado aos projetos</p>
                    </div>
                    <Badge variant="outline">Básico</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
