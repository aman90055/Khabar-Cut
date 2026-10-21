import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Terminal, User } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface SearchParams {
  action?: string;
  entityType?: string;
}

export default async function AuditLogsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const action = params.action || '';
  const entityType = params.entityType || '';

  const supabase = await createClient();

  let queryBuilder = supabase
    .from('audit_logs')
    .select(`
      id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at,
      user:users!user_id (full_name, email)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (action) {
    queryBuilder = queryBuilder.ilike('action', `%${action}%`);
  }

  if (entityType) {
    queryBuilder = queryBuilder.ilike('entity_type', `%${entityType}%`);
  }

  const { data: rawLogs } = await queryBuilder;

  const serializedLogs = (rawLogs || []).map((l: any) => ({
    id: l.id,
    action: l.action,
    entityType: l.entity_type,
    entityId: l.entity_id,
    ipAddress: l.ip_address,
    createdAt: l.created_at,
    user: {
      fullName: l.user?.full_name || 'System / Automated',
      email: l.user?.email || '',
    },
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">System Audit Logs</h1>
        <p className="text-sm text-zinc-500 mt-1">Trace all admin actions, article status changes, uploads, settings updates, and logins.</p>
      </div>

      {/* Filter strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <form className="flex flex-wrap gap-4 w-full">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Action filter</span>
            <input
              type="text"
              name="action"
              defaultValue={action}
              placeholder="e.g. CREATE, UPDATE..."
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Entity Type</span>
            <input
              type="text"
              name="entityType"
              defaultValue={entityType}
              placeholder="e.g. article, user..."
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="self-end px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg text-xs font-semibold"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Table list */}
      {serializedLogs.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Terminal className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Logs Recorded</h3>
          <p className="text-xs text-zinc-500 mt-1">Audit log records will automatically appear when actions occur.</p>
        </div>
      ) : (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold">
                    <th className="text-left py-3 px-4">Action</th>
                    <th className="text-left py-3 px-4">Entity</th>
                    <th className="text-left py-3 px-4">Actor</th>
                    <th className="text-left py-3 px-4">IP Address</th>
                    <th className="text-left py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {serializedLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{log.entityType}</span>
                        <span className="text-[10px] text-zinc-400 block font-mono">{log.entityId?.slice(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-zinc-400" />
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{log.user.fullName}</span>
                        </div>
                        {log.user.email && (
                          <span className="text-[10px] text-zinc-400 block">{log.user.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[10px]">
                        {log.ipAddress || 'unknown'}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                        {log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
