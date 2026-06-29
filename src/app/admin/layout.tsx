import type { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AIAssistant } from '@/components/admin/ai-assistant';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar: hidden on mobile, visible md+ */}
      <aside className="hidden md:flex">
        <AdminSidebar />
      </aside>

      {/* Right column: header + scrollable content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
          {children}
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}

