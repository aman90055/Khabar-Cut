import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
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

  const where = {
    deletedAt: null,
    ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
    ...(entityType && { entityType: { contains: entityType, mode: 'insensitive' as const } }),
  };

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  }).catch(() => []);

  const serializedLogs = serializeBigInt(logs);

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
              name="action"
              defaultValue={action}
              placeholder="e.g. CREATE_ARTICLE"
              className="text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Entity Type</span>
            <input
              name="entityType"
              defaultValue={entityType}
              placeholder="e.g. article"
              className="text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none"
            />
          </div>
          <div className="self-end flex gap-2">
            <Button type="submit" size="sm" className="font-semibold h-9">Filter</Button>
            <Link href="/admin/audit-logs">
              <Button type="button" variant="outline" size="sm" className="font-semibold h-9">Reset</Button>
            </Link>
          </div>
        </form>
      </div>

      {/* Logs timeline list */}
      {serializedLogs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Terminal className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No audit logs</h3>
          <p className="text-xs text-zinc-500 mt-1">System activity has not generated any records matching the filters.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-zinc-200 dark:divide-zinc-800">
            {serializedLogs.map((log: any) => (
              <div key={log.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-red-500/10 border-red-500/20 text-red-500 text-[10px] font-black uppercase">
                      {log.action}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-bold capitalize">
                      {log.entityType}
                    </Badge>
                    <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    Entity ID: <span className="font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded-sm">{log.entityId}</span>
                  </p>
                  {log.newValues && (
                    <pre className="text-[10px] bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto max-w-2xl">
                      {JSON.stringify(log.newValues, null, 2)}
                    </pre>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 justify-end">
                      <User className="h-3.5 w-3.5" />
                      {log.user?.fullName || 'System Event'}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold">{log.user?.email || 'automated@khabarcut.com'}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Inline Imports
import Link from 'next/link';
import { Button } from '@/components/ui/button';
