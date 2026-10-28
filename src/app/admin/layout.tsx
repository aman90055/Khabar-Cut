import type { ReactNode } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AIAssistant } from '@/components/admin/ai-assistant';
import { getAuthUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let authUser = null;
  try {
    authUser = await getAuthUser();
  } catch {
    authUser = null;
  }

  if (!authUser) {
    redirect('/login?redirectTo=/admin');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar: hidden on mobile, visible md+ */}
      <aside className="hidden md:flex">
        <AdminSidebar />
      </aside>

      {/* Right column: admin header + scrollable content */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
