import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation, useParams } from "wouter";
import { Loader2, ArrowLeft, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const addMemberSchema = z.object({
  userId: z.string().min(1, "Selecione um usuário"),
  role: z.enum(["ADMIN", "GERENTE", "MEMBRO"]),
});

type AddMemberData = z.infer<typeof addMemberSchema>;

export default function ProjectMembers() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0");
  const [open, setOpen] = useState(false);

  const { data: project } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: members, refetch: refetchMembers } = trpc.projectMembers.list.useQuery({ projectId });
  const { data: allUsers } = trpc.users.list.useQuery();
  const addMemberMutation = trpc.projectMembers.add.useMutation();
  const removeMemberMutation = trpc.projectMembers.remove.useMutation();

  const form = useForm<AddMemberData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: "",
      role: "MEMBRO",
    },
  });

  const onSubmit = async (data: AddMemberData) => {
    try {
      await addMemberMutation.mutateAsync({
        projectId,
        userId: parseInt(data.userId),
        role: data.role,
      });
      toast.success("Membro adicionado com sucesso!");
      setOpen(false);
      form.reset();
      refetchMembers();
    } catch (error) {
      toast.error("Erro ao adicionar membro");
      console.error(error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    try {
      await removeMemberMutation.mutateAsync({ projectId, userId });
      toast.success("Membro removido com sucesso!");
      refetchMembers();
    } catch (error) {
      toast.error("Erro ao remover membro");
      console.error(error);
    }
  };

  if (!user || (user.role !== "ADMIN" && user.role !== "GERENTE")) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Você não tem permissão para gerenciar membros</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const availableUsers = allUsers?.filter(u => !members?.some(m => m.userId === u.id)) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Membros</h1>
            <p className="text-muted-foreground mt-2">Projeto: {project.name}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Membro</DialogTitle>
                <DialogDescription>Selecione um usuário e defina seu papel no projeto</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um usuário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableUsers.map((u) => (
                              <SelectItem key={u.id} value={u.id.toString()}>
                                {u.name} ({u.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="GERENTE">Gerente</SelectItem>
                            <SelectItem value="MEMBRO">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? "Adicionando..." : "Adicionar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={removeMemberMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
    </DashboardLayout>
  );
}
