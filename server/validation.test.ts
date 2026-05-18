import { describe, expect, it } from "vitest";
import { z } from "zod";

// Test Zod schemas used in the application
const projectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

const projectMemberSchema = z.object({
  projectId: z.number(),
  userId: z.number(),
  role: z.enum(["ADMIN", "GERENTE", "MEMBRO"]),
});

const updateMemberRoleSchema = z.object({
  projectId: z.number(),
  userId: z.number(),
  role: z.enum(["ADMIN", "GERENTE", "MEMBRO"]),
});

describe("Input Validation Schemas", () => {
  describe("projectSchema", () => {
    it("should accept valid project data", () => {
      const validData = {
        name: "Test Project",
        description: "A test project",
      };
      
      const result = projectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        description: "A test project",
      };
      
      const result = projectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept project without description", () => {
      const validData = {
        name: "Test Project",
      };
      
      const result = projectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject non-string name", () => {
      const invalidData = {
        name: 123,
        description: "A test project",
      };
      
      const result = projectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("projectMemberSchema", () => {
    it("should accept valid member data with ADMIN role", () => {
      const validData = {
        projectId: 1,
        userId: 2,
        role: "ADMIN" as const,
      };
      
      const result = projectMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid member data with GERENTE role", () => {
      const validData = {
        projectId: 1,
        userId: 2,
        role: "GERENTE" as const,
      };
      
      const result = projectMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid member data with MEMBRO role", () => {
      const validData = {
        projectId: 1,
        userId: 2,
        role: "MEMBRO" as const,
      };
      
      const result = projectMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const invalidData = {
        projectId: 1,
        userId: 2,
        role: "INVALID_ROLE",
      };
      
      const result = projectMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-numeric projectId", () => {
      const invalidData = {
        projectId: "1",
        userId: 2,
        role: "ADMIN",
      };
      
      const result = projectMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject non-numeric userId", () => {
      const invalidData = {
        projectId: 1,
        userId: "2",
        role: "ADMIN",
      };
      
      const result = projectMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateMemberRoleSchema", () => {
    it("should accept valid update data", () => {
      const validData = {
        projectId: 1,
        userId: 2,
        role: "GERENTE" as const,
      };
      
      const result = updateMemberRoleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const invalidData = {
        projectId: 1,
        userId: 2,
        role: "SUPER_ADMIN",
      };
      
      const result = updateMemberRoleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should validate all three valid roles", () => {
      const roles = ["ADMIN", "GERENTE", "MEMBRO"] as const;
      
      for (const role of roles) {
        const validData = {
          projectId: 1,
          userId: 2,
          role,
        };
        
        const result = updateMemberRoleSchema.safeParse(validData);
        expect(result.success).toBe(true);
      }
    });
  });
});
