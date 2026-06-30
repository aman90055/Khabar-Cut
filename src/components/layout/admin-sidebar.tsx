'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  MessageSquare,
  Image,
  Radio,
  Video,
  BookOpen,
  Megaphone,
  Mail,
  Users,
  Settings,
  Activity,
  MapPin,
  Map,
  Sparkles,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { adminNavigation } from '@/config/navigation';
import { cn } from '@/utils/cn';

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  FolderTree,
  MessageSquare,
  Image,
  Radio,
  Video,
  BookOpen,
  Megaphone,
  Mail,
  Users,
  Settings,
  Activity,
  MapPin,
  Map,
  Sparkles,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-zinc-950 border-r border-zinc-800 h-screen sticky top-0 flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Khabar Cut Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-base font-bold text-zinc-50 tracking-tight">
            Khabar Cut
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {adminNavigation.map((item) => {
          const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
          // Active if exact match for /admin, prefix match for sub-routes
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-red-600/15 text-red-500 border border-red-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent',
              )}
            >
              {IconComponent && (
                <IconComponent
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-red-500' : 'text-zinc-500',
                  )}
                />
              )}
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-4 border-t border-zinc-800 shrink-0">
        <p className="text-xs text-zinc-600">Admin Panel v1.0</p>
      </div>
    </nav>
  );
}
