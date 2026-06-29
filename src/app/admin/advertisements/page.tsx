import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus, Trash2, Power, Eye, MousePointer } from 'lucide-react';
import { format } from 'date-fns';
import { toggleAdActive, deleteAd } from '@/features/advertisements/actions';

export const dynamic = 'force-dynamic';

export default async function AdvertisementsAdminPage() {
  const ads = await prisma.advertisement.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const serializedAds = serializeBigInt(ads);

  async function handleToggle(id: string) {
    'use server';
    await toggleAdActive(id);
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteAd(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Advertisements</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage advertising campaigns, positions, and track performance metrics.</p>
        </div>
        <Link href="/admin/advertisements/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Grid of ads */}
      {serializedAds.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <Megaphone className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Ad Campaigns</h3>
          <p className="text-xs text-zinc-500 mt-1">Configure your first banner or native script ad slot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serializedAds.map((ad: any) => {
            const ctr = ad.impressions > 0 ? ((Number(ad.clicks) / Number(ad.impressions)) * 100).toFixed(2) : '0.00';
            return (
              <Card key={ad.id} className="border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-950 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  {/* Title & Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-1">
                        {ad.title}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold">{ad.type}</Badge>
                        <Badge variant="secondary" className="text-[9px] uppercase font-bold">{ad.position}</Badge>
                      </div>
                    </div>
                    <Badge
                      className={`border-none font-bold uppercase text-[8px] ${
                        ad.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Visual preview */}
                  {ad.imageUrl && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border">
                      <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
                    </div>
                  )}

                  {/* Stats & range */}
                  <div className="grid grid-cols-3 gap-2 border-y border-zinc-100 dark:border-zinc-800 py-3 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase text-zinc-400 flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" /> Imps
                      </span>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{Number(ad.impressions).toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5 border-x">
                      <span className="text-[9px] font-black uppercase text-zinc-400 flex items-center justify-center gap-1">
                        <MousePointer className="h-3 w-3" /> Clicks
                      </span>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{Number(ad.clicks).toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase text-zinc-400">CTR</span>
                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{ctr}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[9px] text-zinc-400 font-semibold">
                      Ends: {format(new Date(ad.endDate), 'dd MMM yyyy')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <form action={handleToggle.bind(null, ad.id)}>
                        <Button variant="outline" size="sm" type="submit" className="font-semibold text-xs h-8 gap-1.5">
                          <Power className="h-3.5 w-3.5" />
                          Toggle status
                        </Button>
                      </form>
                      <form action={handleDelete.bind(null, ad.id)}>
                        <Button variant="ghost" size="sm" type="submit" className="h-8 text-red-500 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
