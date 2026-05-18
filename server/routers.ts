import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, gerenteProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Users
  users: router({
    me: protectedProcedure.query(({ ctx }) => ctx.user),
    
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getUserById(input.id);
    }),

    getByOpenId: protectedProcedure.input(z.object({ openId: z.string() })).query(async ({ input }) => {
      return await db.getUserByOpenId(input.openId);
    }),
  }),

  // Projects
  projects: router({
    create: gerenteProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createProject({
          name: input.name,
          description: input.description,
          ownerId: ctx.user.id,
        });

        if (!result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar projeto" });
        }

        // Get the created project (last one)
        const allProjects = await db.getAllProjects();
        const newProject = allProjects[allProjects.length - 1];
        
        if (newProject) {
          // Add creator as ADMIN in the project
          await db.addProjectMember({
            projectId: newProject.id,
            userId: ctx.user.id,
            role: "ADMIN",
          });
        }

        return { id: newProject?.id || 0, name: input.name, description: input.description };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const allProjects = await db.getAllProjects();
      
      // Filter projects based on user role
      if (ctx.user.role === "ADMIN") {
        return allProjects;
      }

      // For GERENTE and MEMBRO, only return projects they're members of
      const userProjects = [];
      for (const project of allProjects) {
        const membership = await db.getUserProjectRole(project.id, ctx.user.id);
        if (membership) {
          userProjects.push(project);
        }
      }
      return userProjects;
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check access: ADMIN can see all, others only their projects
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado a este projeto" });
          }
        }

        // Record access
        await db.recordAccess({
          userId: ctx.user.id,
          projectId: project.id,
        });

        return project;
      }),

    update: gerenteProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check permissions: ADMIN or project ADMIN/GERENTE
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership || (membership.role !== "ADMIN" && membership.role !== "GERENTE")) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado para atualizar este projeto" });
          }
        }

        await db.updateProject(input.id, {
          name: input.name,
          description: input.description,
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const project = await db.getProjectById(input.id);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        await db.deleteProject(input.id);
        return { success: true };
      }),
  }),

  // Project Members
  projectMembers: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check access
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
          }
        }

        const members = await db.getProjectMembers(input.projectId);
        
        // Enrich with user data
        const enrichedMembers = [];
        for (const member of members) {
          const user = await db.getUserById(member.userId);
          enrichedMembers.push({
            ...member,
            user: user ? { id: user.id, name: user.name, email: user.email } : null,
          });
        }
        
        return enrichedMembers;
      }),

    add: gerenteProcedure
      .input(z.object({
        projectId: z.number(),
        userId: z.number(),
        role: z.enum(["ADMIN", "GERENTE", "MEMBRO"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check permissions
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership || (membership.role !== "ADMIN" && membership.role !== "GERENTE")) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado para adicionar membros" });
          }
        }

        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        }

        // Check if already a member
        const existing = await db.getUserProjectRole(input.projectId, input.userId);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário já é membro do projeto" });
        }

        await db.addProjectMember({
          projectId: input.projectId,
          userId: input.userId,
          role: input.role,
        });

        return { success: true };
      }),

    remove: gerenteProcedure
      .input(z.object({
        projectId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check permissions
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership || (membership.role !== "ADMIN" && membership.role !== "GERENTE")) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado para remover membros" });
          }
        }

        await db.removeProjectMember(input.projectId, input.userId);
        return { success: true };
      }),

    updateRole: gerenteProcedure
      .input(z.object({
        projectId: z.number(),
        userId: z.number(),
        role: z.enum(["ADMIN", "GERENTE", "MEMBRO"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check permissions
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership || (membership.role !== "ADMIN" && membership.role !== "GERENTE")) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado para atualizar papéis" });
          }
        }

        // Check if member exists
        const member = await db.getUserProjectRole(input.projectId, input.userId);
        if (!member) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Membro não encontrado neste projeto" });
        }

        await db.updateProjectMemberRole(input.projectId, input.userId, input.role);
        return { success: true };
      }),
  }),

  // Access History & AI Recommendations
  recommendations: router({
    getProjectRecommendations: protectedProcedure.query(async ({ ctx }) => {
      const history = await db.getUserAccessHistory(ctx.user.id);
      
      // Count access frequency by project
      const accessCount: Record<number, number> = {};
      for (const access of history) {
        accessCount[access.projectId] = (accessCount[access.projectId] || 0) + 1;
      }

      // Get all projects user has access to
      const allProjects = await db.getAllProjects();
      const userProjects = [];
      
      for (const project of allProjects) {
        if (ctx.user.role === "ADMIN") {
          userProjects.push({ ...project, accessCount: accessCount[project.id] || 0 });
        } else {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (membership) {
            userProjects.push({ ...project, accessCount: accessCount[project.id] || 0 });
          }
        }
      }

      // Sort by access frequency (descending)
      userProjects.sort((a, b) => b.accessCount - a.accessCount);

      // Return top recommendations
      return userProjects.slice(0, 5);
    }),

    getAccessHistory: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAccessHistory(ctx.user.id);
    }),

    getProjectAccessStats: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        
        if (!project) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
        }

        // Check access
        if (ctx.user.role !== "ADMIN") {
          const membership = await db.getUserProjectRole(project.id, ctx.user.id);
          if (!membership) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
          }
        }

        const stats = await db.getProjectAccessStats(input.projectId);
        
        // Group by user
        const userStats: Record<number, { userId: number; accessCount: number; lastAccess: Date }> = {};
        
        for (const stat of stats) {
          if (!userStats[stat.userId]) {
            userStats[stat.userId] = {
              userId: stat.userId,
              accessCount: 0,
              lastAccess: stat.accessedAt,
            };
          }
          userStats[stat.userId].accessCount += 1;
          if (stat.accessedAt > userStats[stat.userId].lastAccess) {
            userStats[stat.userId].lastAccess = stat.accessedAt;
          }
        }

        return Object.values(userStats);
      }),
  }),
});

export type AppRouter = typeof appRouter;
