import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { ArrowRight, BookOpen, Lock, Zap, Users, Brain, BarChart3 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex items-center justify-between py-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ProjectHub
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/documentation")}>
                <BookOpen className="w-4 h-4 mr-2" />
                Documentação
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                Bem-vindo,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {user.name}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gerencie seus projetos e equipes com elegância e sofisticação. Acesse recomendações inteligentes baseadas no seu histórico de atividades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => navigate("/dashboard")}>
                  Ir para Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/documentation")}>
                  Ver Documentação
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold tracking-tight mb-4">Recursos Principais</h2>
                <p className="text-lg text-muted-foreground">Tudo que você precisa para gerenciar projetos eficientemente</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="space-y-4 p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Gerenciamento de Equipes</h3>
                  <p className="text-muted-foreground">Adicione e remova membros de seus projetos com controle de papéis granular.</p>
                </div>

                {/* Feature 2 */}
                <div className="space-y-4 p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">RBAC Avançado</h3>
                  <p className="text-muted-foreground">Controle de acesso baseado em papéis: ADMIN, GERENTE e MEMBRO.</p>
                </div>

                {/* Feature 3 */}
                <div className="space-y-4 p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Recomendações IA</h3>
                  <p className="text-muted-foreground">Sugestões inteligentes de projetos baseadas no seu histórico de acessos.</p>
                </div>

                {/* Feature 4 */}
                <div className="space-y-4 p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Análise de Atividade</h3>
                  <p className="text-muted-foreground">Rastreie e analise o histórico de acessos aos seus projetos.</p>
                </div>

                {/* Feature 5 */}
                <div className="space-y-4 p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Microsserviço Escalável</h3>
                  <p className="text-muted-foreground">Arquitetura moderna e escalável para integração com outros módulos.</p>
                </div>

                {/* Feature 6 */}
                <div className="space-y-4 p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Documentação Completa</h3>
                  <p className="text-muted-foreground">Documentação arquitetural detalhada e guias de integração.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-600">3</div>
                  <p className="text-muted-foreground">Papéis de Usuário</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-purple-600">21</div>
                  <p className="text-muted-foreground">Testes Unitários</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-green-600">100%</div>
                  <p className="text-muted-foreground">Tipagem TypeScript</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto text-center space-y-6 text-white">
              <h2 className="text-4xl font-bold">Pronto para começar?</h2>
              <p className="text-lg opacity-90">Acesse seu dashboard e comece a gerenciar seus projetos agora mesmo.</p>
              <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
                Ir para Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                © 2024 ProjectHub. Microsserviço de Gerenciamento de Projetos e Usuários.
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/documentation")}>
                  Documentação
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ProjectHub
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Bem-vindo ao{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ProjectHub
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Microsserviço elegante e sofisticado para gerenciamento de projetos, usuários e equipes com controle de acesso avançado.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">Faça login para acessar o dashboard e começar a gerenciar seus projetos.</p>
            <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
              Fazer Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 pt-8 border-t">
            <div className="space-y-2">
              <Users className="w-8 h-8 mx-auto text-blue-600" />
              <h3 className="font-semibold">Gerenciamento de Equipes</h3>
              <p className="text-sm text-muted-foreground">Controle granular de membros e papéis</p>
            </div>
            <div className="space-y-2">
              <Lock className="w-8 h-8 mx-auto text-purple-600" />
              <h3 className="font-semibold">RBAC Avançado</h3>
              <p className="text-sm text-muted-foreground">Três níveis de acesso: ADMIN, GERENTE, MEMBRO</p>
            </div>
            <div className="space-y-2">
              <Brain className="w-8 h-8 mx-auto text-green-600" />
              <h3 className="font-semibold">Recomendações IA</h3>
              <p className="text-sm text-muted-foreground">Sugestões baseadas em histórico de acessos</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          © 2024 ProjectHub. Microsserviço de Gerenciamento de Projetos e Usuários.
        </div>
      </footer>
    </div>
  );
}
