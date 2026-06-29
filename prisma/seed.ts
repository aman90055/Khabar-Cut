import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Role Definitions
// ---------------------------------------------------------------------------

interface RoleDef {
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  level: number;
}

const ROLES: RoleDef[] = [
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Full system access with no restrictions",
    isSystem: true,
    level: 0,
  },
  {
    name: "CEO",
    slug: "ceo",
    description: "Chief Executive Officer with executive-level access",
    isSystem: true,
    level: 1,
  },
  {
    name: "Editor in Chief",
    slug: "editor-in-chief",
    description: "Top editorial authority overseeing all content",
    isSystem: true,
    level: 2,
  },
  {
    name: "Managing Editor",
    slug: "managing-editor",
    description: "Manages day-to-day editorial operations",
    isSystem: true,
    level: 3,
  },
  {
    name: "State Editor",
    slug: "state-editor",
    description: "Manages editorial content for a specific state",
    isSystem: true,
    level: 4,
  },
  {
    name: "District Reporter",
    slug: "district-reporter",
    description: "Reports news from a specific district",
    isSystem: true,
    level: 5,
  },
  {
    name: "Reporter",
    slug: "reporter",
    description: "General news reporter with content creation access",
    isSystem: true,
    level: 6,
  },
  {
    name: "Contributor",
    slug: "contributor",
    description: "External contributor with limited content creation access",
    isSystem: false,
    level: 7,
  },
  {
    name: "SEO Manager",
    slug: "seo-manager",
    description: "Manages search engine optimization metadata",
    isSystem: true,
    level: 8,
  },
  {
    name: "Social Media Manager",
    slug: "social-media-manager",
    description: "Manages social media presence and content sharing",
    isSystem: true,
    level: 9,
  },
  {
    name: "Moderator",
    slug: "moderator",
    description: "Moderates user comments and community interactions",
    isSystem: true,
    level: 10,
  },
  {
    name: "Guest",
    slug: "guest",
    description: "Unauthenticated or temporary access with read-only privileges",
    isSystem: true,
    level: 50,
  },
  {
    name: "Reader",
    slug: "reader",
    description: "Authenticated reader with basic interaction privileges",
    isSystem: true,
    level: 100,
  },
];

// ---------------------------------------------------------------------------
// Permission Definitions
// ---------------------------------------------------------------------------

const RESOURCES: string[] = [
  "articles",
  "categories",
  "comments",
  "media",
  "users",
  "roles",
  "settings",
  "analytics",
  "advertisements",
  "breaking_news",
  "web_stories",
  "videos",
  "live_blogs",
  "newsletters",
  "seo_metadata",
  "audit_logs",
];

const ACTIONS: string[] = [
  "create",
  "read",
  "update",
  "delete",
  "publish",
  "moderate",
];

function describePermission(resource: string, action: string): string {
  const resourceLabel = resource.replace(/_/g, " ");
  switch (action) {
    case "create":
      return `Create new ${resourceLabel}`;
    case "read":
      return `View ${resourceLabel}`;
    case "update":
      return `Edit existing ${resourceLabel}`;
    case "delete":
      return `Delete ${resourceLabel}`;
    case "publish":
      return `Publish or unpublish ${resourceLabel}`;
    case "moderate":
      return `Moderate ${resourceLabel}`;
    default:
      return `${action} ${resourceLabel}`;
  }
}

// ---------------------------------------------------------------------------
// Role-Permission Mapping
// ---------------------------------------------------------------------------

/** Returns the set of "resource:action" strings a role should have. */
function getPermissionsForRole(slug: string): Set<string> {
  const all = new Set<string>();

  // Helper to add every action for a resource
  const addAll = (resource: string) => {
    for (const action of ACTIONS) {
      all.add(`${resource}:${action}`);
    }
  };

  // Helper to add specific actions for a resource
  const add = (resource: string, ...actions: string[]) => {
    for (const action of actions) {
      all.add(`${resource}:${action}`);
    }
  };

  switch (slug) {
    // ── Full access ───────────────────────────────────────────────────
    case "super-admin":
      for (const resource of RESOURCES) {
        addAll(resource);
      }
      break;

    // ── Executive read-everything + manage users/roles/settings ──────
    case "ceo":
      for (const resource of RESOURCES) {
        add(resource, "read");
      }
      addAll("users");
      addAll("roles");
      addAll("settings");
      addAll("analytics");
      addAll("audit_logs");
      add("articles", "create", "update", "delete", "publish");
      add("advertisements", "create", "update", "delete");
      add("newsletters", "create", "update", "delete", "publish");
      break;

    // ── Top editorial authority ──────────────────────────────────────
    case "editor-in-chief":
      addAll("articles");
      addAll("categories");
      addAll("comments");
      addAll("media");
      addAll("breaking_news");
      addAll("web_stories");
      addAll("videos");
      addAll("live_blogs");
      addAll("seo_metadata");
      addAll("newsletters");
      add("users", "read");
      add("roles", "read");
      add("settings", "read");
      add("analytics", "read");
      add("advertisements", "read");
      add("audit_logs", "read");
      break;

    // ── Day-to-day editorial ops ─────────────────────────────────────
    case "managing-editor":
      addAll("articles");
      addAll("categories");
      addAll("comments");
      addAll("media");
      addAll("breaking_news");
      addAll("web_stories");
      addAll("videos");
      addAll("live_blogs");
      add("seo_metadata", "read", "update");
      add("newsletters", "create", "read", "update", "publish");
      add("users", "read");
      add("analytics", "read");
      add("settings", "read");
      add("advertisements", "read");
      add("audit_logs", "read");
      break;

    // ── State-level editorial ────────────────────────────────────────
    case "state-editor":
      add("articles", "create", "read", "update", "publish", "moderate");
      add("categories", "read");
      add("comments", "read", "moderate");
      add("media", "create", "read", "update");
      add("breaking_news", "create", "read", "update");
      add("web_stories", "create", "read", "update", "publish");
      add("videos", "create", "read", "update", "publish");
      add("live_blogs", "create", "read", "update", "publish");
      add("seo_metadata", "read", "update");
      add("analytics", "read");
      add("newsletters", "read");
      add("users", "read");
      break;

    // ── District-level reporting ─────────────────────────────────────
    case "district-reporter":
      add("articles", "create", "read", "update");
      add("categories", "read");
      add("comments", "read");
      add("media", "create", "read", "update");
      add("web_stories", "create", "read", "update");
      add("videos", "create", "read", "update");
      add("live_blogs", "create", "read", "update");
      add("analytics", "read");
      break;

    // ── General reporter ─────────────────────────────────────────────
    case "reporter":
      add("articles", "create", "read", "update");
      add("categories", "read");
      add("comments", "read");
      add("media", "create", "read", "update");
      add("web_stories", "create", "read", "update");
      add("videos", "create", "read", "update");
      add("live_blogs", "create", "read", "update");
      add("analytics", "read");
      break;

    // ── External contributor ─────────────────────────────────────────
    case "contributor":
      add("articles", "create", "read", "update");
      add("categories", "read");
      add("media", "create", "read");
      add("comments", "read");
      break;

    // ── SEO specialist ───────────────────────────────────────────────
    case "seo-manager":
      addAll("seo_metadata");
      add("articles", "read", "update");
      add("categories", "read");
      add("web_stories", "read");
      add("videos", "read");
      add("analytics", "read");
      add("media", "read");
      break;

    // ── Social media operations ──────────────────────────────────────
    case "social-media-manager":
      add("articles", "read");
      add("categories", "read");
      add("media", "create", "read", "update");
      add("web_stories", "create", "read", "update", "publish");
      add("videos", "read");
      add("analytics", "read");
      add("newsletters", "create", "read", "update");
      break;

    // ── Community moderator ──────────────────────────────────────────
    case "moderator":
      addAll("comments");
      add("articles", "read");
      add("users", "read");
      add("media", "read");
      add("audit_logs", "read");
      break;

    // ── Guest (unauthenticated) ──────────────────────────────────────
    case "guest":
      add("articles", "read");
      add("categories", "read");
      add("web_stories", "read");
      add("videos", "read");
      break;

    // ── Authenticated reader ─────────────────────────────────────────
    case "reader":
      add("articles", "read");
      add("categories", "read");
      add("comments", "create", "read");
      add("media", "read");
      add("web_stories", "read");
      add("videos", "read");
      break;

    default:
      break;
  }

  return all;
}

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("🌱 Starting Khabar Cut database seed…\n");

  // ── 1. Seed Roles ─────────────────────────────────────────────────────
  console.log("📋 Seeding roles…");
  const roleMap = new Map<string, string>(); // slug → id

  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { slug: roleDef.slug },
      update: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        level: roleDef.level,
      },
      create: {
        name: roleDef.name,
        slug: roleDef.slug,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
        level: roleDef.level,
      },
    });
    roleMap.set(role.slug, role.id);
    console.log(`  ✔ Role: ${role.name} (level ${role.level})`);
  }

  console.log(`  → ${roleMap.size} roles seeded.\n`);

  // ── 2. Seed Permissions ───────────────────────────────────────────────
  console.log("🔐 Seeding permissions…");
  const permMap = new Map<string, string>(); // "resource:action" → id
  let permCount = 0;

  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const perm = await prisma.permission.upsert({
        where: {
          resource_action: { resource, action },
        },
        update: {
          description: describePermission(resource, action),
        },
        create: {
          resource,
          action,
          description: describePermission(resource, action),
        },
      });
      permMap.set(`${resource}:${action}`, perm.id);
      permCount++;
    }
  }

  console.log(`  → ${permCount} permissions seeded.\n`);

  // ── 3. Map Roles → Permissions ────────────────────────────────────────
  console.log("🔗 Mapping role-permissions…");
  let mappingCount = 0;

  for (const roleDef of ROLES) {
    const roleId = roleMap.get(roleDef.slug);
    if (!roleId) {
      console.warn(`  ⚠ Role ${roleDef.slug} not found in map, skipping.`);
      continue;
    }

    const permKeys = getPermissionsForRole(roleDef.slug);

    // Remove stale mappings that are no longer in the definition
    const existingMappings = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { id: true, permissionId: true },
    });

    const desiredPermIds = new Set<string>();
    for (const key of permKeys) {
      const pid = permMap.get(key);
      if (pid) desiredPermIds.add(pid);
    }

    const staleIds = existingMappings
      .filter((m) => !desiredPermIds.has(m.permissionId))
      .map((m) => m.id);

    if (staleIds.length > 0) {
      await prisma.rolePermission.deleteMany({
        where: { id: { in: staleIds } },
      });
      console.log(
        `  🗑 Removed ${staleIds.length} stale mappings for ${roleDef.slug}`
      );
    }

    // Batch insert new mappings
    const existingPermIds = new Set(existingMappings.map(m => m.permissionId));
    const newMappingsToCreate: Array<{ roleId: string; permissionId: string }> = [];

    for (const key of permKeys) {
      const permId = permMap.get(key);
      if (!permId) {
        console.warn(`  ⚠ Permission ${key} not found, skipping.`);
        continue;
      }

      if (!existingPermIds.has(permId)) {
        newMappingsToCreate.push({ roleId, permissionId: permId });
      }
    }

    if (newMappingsToCreate.length > 0) {
      await prisma.rolePermission.createMany({
        data: newMappingsToCreate,
        skipDuplicates: true,
      });
      mappingCount += newMappingsToCreate.length;
    }

    console.log(
      `  ✔ ${roleDef.name}: ${permKeys.size} permissions assigned (${newMappingsToCreate.length} new)`
    );
  }

  console.log(`  → ${mappingCount} role-permission mappings processed.\n`);

  console.log("✅ Seed completed successfully.");
}

async function runWithRetry(retries = 5, delay = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await main();
      return;
    } catch (error: any) {
      console.error(`❌ Attempt ${i} failed:`, error.message || error);
      if (i === retries) {
        throw error;
      }
      console.log(`⏳ Waiting ${delay / 1000}s before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

runWithRetry()
  .catch((error: unknown) => {
    console.error("❌ Seed execution fully failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
