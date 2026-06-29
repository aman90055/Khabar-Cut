export interface NavItem {
  title: string;
  href: string;
  icon?: string; // Icon name from lucide-react
  children?: NavItem[];
  requiredPermission?: string;
}

export const mainNavigation: NavItem[] = [
  { title: 'Home', href: '/' },
  { title: 'National', href: '/national' },
  { title: 'States', href: '/states' },
  { title: 'Business', href: '/business' },
  { title: 'Tech', href: '/tech' },
  { title: 'Videos', href: '/videos' },
  { title: 'Web Stories', href: '/web-stories' },
];

export const adminNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
  },
  {
    title: 'AI Newsroom',
    href: '/admin/ai',
    icon: 'Sparkles',
    requiredPermission: 'articles.create',
  },
  {
    title: 'Articles',
    href: '/admin/articles',
    icon: 'FileText',
    requiredPermission: 'articles.read',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: 'FolderTree',
    requiredPermission: 'categories.read',
  },
  {
    title: 'States',
    href: '/admin/states',
    icon: 'MapPin',
    requiredPermission: 'settings.read',
  },
  {
    title: 'Districts',
    href: '/admin/districts',
    icon: 'Map',
    requiredPermission: 'settings.read',
  },
  {
    title: 'Comments',
    href: '/admin/comments',
    icon: 'MessageSquare',
    requiredPermission: 'comments.moderate',
  },
  {
    title: 'Media Gallery',
    href: '/admin/media',
    icon: 'Image',
    requiredPermission: 'media.read',
  },
  {
    title: 'Live Blogs',
    href: '/admin/live-blogs',
    icon: 'Radio',
    requiredPermission: 'live_blogs.read',
  },
  {
    title: 'Videos',
    href: '/admin/videos',
    icon: 'Video',
    requiredPermission: 'videos.read',
  },
  {
    title: 'Web Stories',
    href: '/admin/web-stories',
    icon: 'BookOpen',
    requiredPermission: 'web_stories.read',
  },
  {
    title: 'Advertisements',
    href: '/admin/advertisements',
    icon: 'Megaphone',
    requiredPermission: 'advertisements.read',
  },
  {
    title: 'Newsletters',
    href: '/admin/newsletters',
    icon: 'Mail',
    requiredPermission: 'newsletters.read',
  },
  {
    title: 'Users & Roles',
    href: '/admin/users',
    icon: 'Users',
    requiredPermission: 'users.read',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
    requiredPermission: 'settings.read',
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: 'Activity',
    requiredPermission: 'audit_logs.read',
  },
];
