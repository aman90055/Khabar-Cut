import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicStatesPage() {
  const states = await prisma.state.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      _count: { select: { districts: true, articles: true } },
    },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => []);

  const serializedStates = serializeBigInt(states);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600 tracking-wider">
          <MapPin className="h-4 w-4" /> Regional Network
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
          State & District News Hubs
        </h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-xl">
          Get hyper-local news reporting, regional developments, election tracks, and administrative bulletins. Select your state below.
        </p>
      </div>

      {/* Grid of states */}
      {serializedStates.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10">
          <MapPin className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-extrabold mt-4 text-zinc-900 dark:text-zinc-50">No Regional Hubs Configured</h3>
          <p className="text-xs text-zinc-500 mt-1">Regional sections are being initialized. Check back shortly!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {serializedStates.map((st: any) => (
            <Link key={st.id} href={`/states/${st.slug}`}>
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden hover:shadow-md hover:border-red-500/30 transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-snug group-hover:text-red-600 transition-colors">
                      {st.name}
                    </h3>
                    <Badge variant="outline" className="font-mono text-[9px] uppercase font-bold">
                      {st.code}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-zinc-400 font-bold uppercase">
                    <span>{st._count.districts} reporting districts</span>
                    <span>•</span>
                    <span>{st._count.articles} articles</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold group-hover:translate-x-1.5 transition-transform pt-1">
                    Explore Local News <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
