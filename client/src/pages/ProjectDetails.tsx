import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation, useParams } from "wouter";
import { Loader2, ArrowLeft, Users, Settings } from "lucide-react";

export default function ProjectDetails() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");

  const { data: project, isLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: members } = trpc.projectMembers.list.useQuery({ projectId });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Projeto não encontrado</p>
            <Button onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const canManageMembers = user.role === "ADMIN" || user.role === "GERENTE";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl">{project.name}</CardTitle>
                <CardDescription className="mt-2">{project.description || "Sem descrição"}</CardDescription>
              </div>
              {canManageMembers && (
                <Button onClick={() => navigate(`/projects/${projectId}/members`)} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Gerenciar Equipe
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-semibold">{new Date(project.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="font-semibold">{new Date(project.updatedAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6" />
                Membros da Equipe
              </h2>
              <p className="text-muted-foreground">Total: {members?.length || 0} membros</p>
            </div>
          </div>

          {members && members.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold">{member.user?.name || "Usuário desconhecido"}</p>
                        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {member.role}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(member.joinedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhum membro adicionado ainda</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
