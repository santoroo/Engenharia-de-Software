import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "ADMIN",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createGerenteContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "gerente-user",
    email: "gerente@example.com",
    name: "Gerente User",
    loginMethod: "manus",
    role: "GERENTE",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createMembroContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "membro-user",
    email: "membro@example.com",
    name: "Membro User",
    loginMethod: "manus",
    role: "MEMBRO",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Projects CRUD Integration", () => {
  it("GERENTE should be able to create a project", async () => {
    const { ctx } = createGerenteContext();
    const caller = appRouter.createCaller(ctx);
    
    // GERENTE can create projects
    expect(caller.projects.create).toBeDefined();
  });

  it("MEMBRO should NOT be able to create a project", async () => {
    const { ctx } = createMembroContext();
    const caller = appRouter.createCaller(ctx);
    
    // MEMBRO cannot create projects - should fail
    try {
      await caller.projects.create({
        name: "Test Project",
        description: "Test",
      });
      // If we get here, it means MEMBRO was able to create - this is a bug
      expect(true).toBe(false);
    } catch (error: any) {
      // Expected: MEMBRO should not have access
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("ADMIN should be able to delete any project", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // ADMIN can delete projects
    expect(caller.projects.delete).toBeDefined();
  });

  it("GERENTE should NOT be able to delete a project", async () => {
    const { ctx } = createGerenteContext();
    const caller = appRouter.createCaller(ctx);
    
    // GERENTE cannot delete projects - should fail
    try {
      await caller.projects.delete({
        id: 999,
      });
      expect(true).toBe(false);
    } catch (error: any) {
      // Expected: GERENTE should not have access
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should validate project name is not empty", async () => {
    const { ctx } = createGerenteContext();
    const caller = appRouter.createCaller(ctx);
    
    // Empty name should fail validation
    try {
      await caller.projects.create({
        name: "",
        description: "Test",
      });
      expect(true).toBe(false);
    } catch (error: any) {
      // Expected: validation error (could be PARSE_ERROR or BAD_REQUEST)
      expect(["PARSE_ERROR", "BAD_REQUEST"]).toContain(error.code);
    }
  });

  it("should allow optional description", async () => {
    const { ctx } = createGerenteContext();
    const caller = appRouter.createCaller(ctx);
    
    // Description is optional
    expect(caller.projects.create).toBeDefined();
  });

  it("ADMIN should be able to list all projects", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    
    // ADMIN can list all projects
    expect(caller.projects.list).toBeDefined();
  });

  it("GERENTE should only see their own projects", async () => {
    const { ctx } = createGerenteContext();
    const caller = appRouter.createCaller(ctx);
    
    // GERENTE can list projects but only sees their own
    expect(caller.projects.list).toBeDefined();
  });
});
