export interface Permission {
  resource: string;
  action: string;
}

export const ROLE_LEVELS = {
  'super-admin': 0,
  'ceo': 1,
  'editor-in-chief': 2,
  'managing-editor': 3,
  'state-editor': 4,
  'district-reporter': 5,
  'reporter': 6,
  'contributor': 7,
  'seo-manager': 8,
  'social-media-manager': 9,
  'moderator': 10,
  'guest': 50,
  'reader': 100,
} as const;

export type RoleSlug = keyof typeof ROLE_LEVELS;

const RESOURCES = [
  'articles', 'categories', 'comments', 'media', 'users', 'roles', 'settings',
  'analytics', 'advertisements', 'breaking_news', 'web_stories', 'videos',
  'live_blogs', 'newsletters', 'seo_metadata', 'audit_logs'
] as const;

const ACTIONS = ['create', 'read', 'update', 'delete', 'publish', 'moderate'] as const;

function generatePermissionsForRole(role: RoleSlug): string[] {
  const perms = new Set<string>();
  const addAll = (res: string) => ACTIONS.forEach(act => perms.add(`${res}:${act}`));
  const add = (res: string, ...acts: string[]) => acts.forEach(act => perms.add(`${res}:${act}`));

  switch (role) {
    case 'super-admin':
      RESOURCES.forEach(addAll);
      break;
    case 'ceo':
      RESOURCES.forEach(res => add(res, 'read'));
      addAll('users');
      addAll('roles');
      addAll('settings');
      addAll('analytics');
      addAll('audit_logs');
      add('articles', 'create', 'update', 'delete', 'publish');
      add('advertisements', 'create', 'update', 'delete');
      add('newsletters', 'create', 'update', 'delete', 'publish');
      break;
    case 'editor-in-chief':
      addAll('articles');
      addAll('categories');
      addAll('comments');
      addAll('media');
      addAll('breaking_news');
      addAll('web_stories');
      addAll('videos');
      addAll('live_blogs');
      addAll('seo_metadata');
      addAll('newsletters');
      add('users', 'read');
      add('roles', 'read');
      add('settings', 'read');
      add('analytics', 'read');
      add('advertisements', 'read');
      add('audit_logs', 'read');
      break;
    case 'managing-editor':
      addAll('articles');
      addAll('categories');
      addAll('comments');
      addAll('media');
      addAll('breaking_news');
      addAll('web_stories');
      addAll('videos');
      addAll('live_blogs');
      add('seo_metadata', 'read', 'update');
      add('newsletters', 'create', 'read', 'update', 'publish');
      add('users', 'read');
      add('analytics', 'read');
      add('settings', 'read');
      add('advertisements', 'read');
      add('audit_logs', 'read');
      break;
    case 'state-editor':
      add('articles', 'create', 'read', 'update', 'publish', 'moderate');
      add('categories', 'read');
      add('comments', 'read', 'moderate');
      add('media', 'create', 'read', 'update');
      add('breaking_news', 'create', 'read', 'update');
      add('web_stories', 'create', 'read', 'update', 'publish');
      add('videos', 'create', 'read', 'update', 'publish');
      add('live_blogs', 'create', 'read', 'update', 'publish');
      add('seo_metadata', 'read', 'update');
      add('analytics', 'read');
      add('newsletters', 'read');
      add('users', 'read');
      break;
    case 'district-reporter':
      add('articles', 'create', 'read', 'update');
      add('categories', 'read');
      add('comments', 'read');
      add('media', 'create', 'read', 'update');
      add('web_stories', 'create', 'read', 'update');
      add('videos', 'create', 'read', 'update');
      add('live_blogs', 'create', 'read', 'update');
      add('analytics', 'read');
      break;
    case 'reporter':
      add('articles', 'create', 'read', 'update');
      add('categories', 'read');
      add('comments', 'read');
      add('media', 'create', 'read', 'update');
      add('web_stories', 'create', 'read', 'update');
      add('videos', 'create', 'read', 'update');
      add('live_blogs', 'create', 'read', 'update');
      add('analytics', 'read');
      break;
    case 'contributor':
      add('articles', 'create', 'read', 'update');
      add('categories', 'read');
      add('media', 'create', 'read');
      add('comments', 'read');
      break;
    case 'seo-manager':
      addAll('seo_metadata');
      add('articles', 'read', 'update');
      add('categories', 'read');
      add('web_stories', 'read');
      add('videos', 'read');
      add('live_blogs', 'read');
      break;
    case 'social-media-manager':
      add('articles', 'read');
      add('web_stories', 'read');
      add('videos', 'read');
      add('live_blogs', 'read');
      break;
    case 'moderator':
      add('comments', 'read', 'moderate', 'update', 'delete');
      add('articles', 'read');
      break;
    case 'guest':
      add('articles', 'read');
      add('categories', 'read');
      break;
    case 'reader':
      add('articles', 'read');
      add('categories', 'read');
      add('comments', 'create', 'read');
      break;
  }
  return Array.from(perms);
}

export const ROLE_PERMISSIONS: Record<RoleSlug, string[]> = Object.keys(ROLE_LEVELS).reduce(
  (acc, role) => {
    acc[role as RoleSlug] = generatePermissionsForRole(role as RoleSlug);
    return acc;
  },
  {} as Record<RoleSlug, string[]>
);

export function hasPermission(userRole: string, resource: string, action: string): boolean {
  const role = userRole as RoleSlug;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(`${resource}:${action}`);
}

export function canAccessResource(userRoleLevel: number, requiredLevel: number): boolean {
  return userRoleLevel <= requiredLevel;
}
