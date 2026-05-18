import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { Loader2, Plus, Users, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: recommendations } = trpc.recommendations.getProjectRecommendations.useQuery();
  
  if (!user) {
    return null;
  }

  const canCreateProject = user.role === "ADMIN" || user.role === "GERENTE";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Bem-vindo, {user.name}</p>
          </div>
          {canCreateProject && (
            <Button onClick={() => navigate("/projects/new")} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Projetos que você tem acesso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seu Papel</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.role}</div>
              <p className="text-xs text-muted-foreground">Papel global no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Projetos sugeridos para você</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Seus Projetos</h2>
            <p className="text-muted-foreground">Projetos que você é membro</p>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description || "Sem descrição"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Ver Detalhes</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Você ainda não é membro de nenhum projeto</p>
                {canCreateProject && (
                  <Button onClick={() => navigate("/projects/new")}>Criar Primeiro Projeto</Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Projetos Recomendados</h2>
              <p className="text-muted-foreground">Baseado no seu histórico de acessos</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 3).map((project) => (
                <Card key={project.id} className="border-amber-200 bg-amber-50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{project.description || "Sem descrição"}</CardDescription>
                      </div>
                      <span className="text-xs font-semibold bg-amber-200 text-amber-900 px-2 py-1 rounded">
                        {(project as any).accessCount || 0} acessos
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">Ver Detalhes</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
