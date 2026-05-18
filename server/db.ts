import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  projectMembers, 
  accessHistory,
  Project,
  InsertProject,
  ProjectMember,
  InsertProjectMember,
  AccessHistory,
  InsertAccessHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'ADMIN';
      updateSet.role = 'ADMIN';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      values.lastSignedIn = new Date();
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return await db.select().from(users);
}

// Projects
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create project: database not available");
    return undefined;
  }

  const result = await db.insert(projects).values(project);
  return result;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get project: database not available");
    return undefined;
  }

  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get projects: database not available");
    return [];
  }

  return await db.select().from(projects);
}

export async function updateProject(id: number, updates: Partial<Project>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update project: database not available");
    return undefined;
  }

  const result = await db.update(projects).set(updates).where(eq(projects.id, id));
  return result;
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete project: database not available");
    return undefined;
  }

  return await db.delete(projects).where(eq(projects.id, id));
}

// Project Members
export async function addProjectMember(member: InsertProjectMember) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add project member: database not available");
    return undefined;
  }

  return await db.insert(projectMembers).values(member);
}

export async function getProjectMembers(projectId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get project members: database not available");
    return [];
  }

  return await db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId));
}

export async function removeProjectMember(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot remove project member: database not available");
    return undefined;
  }

  return await db.delete(projectMembers).where(
    and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))
  );
}

export async function getUserProjectRole(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user project role: database not available");
    return undefined;
  }

  const result = await db.select().from(projectMembers).where(
    and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateProjectMemberRole(projectId: number, userId: number, role: "ADMIN" | "GERENTE" | "MEMBRO") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update project member role: database not available");
    return undefined;
  }

  return await db.update(projectMembers)
    .set({ role })
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
}

// Access History
export async function recordAccess(access: InsertAccessHistory) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record access: database not available");
    return undefined;
  }

  return await db.insert(accessHistory).values(access);
}

export async function getUserAccessHistory(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get access history: database not available");
    return [];
  }

  return await db.select().from(accessHistory).where(eq(accessHistory.userId, userId));
}

export async function getProjectAccessStats(projectId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get project access stats: database not available");
    return [];
  }

  return await db.select().from(accessHistory).where(eq(accessHistory.projectId, projectId));
}
