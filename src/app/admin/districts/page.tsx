import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { DistrictsManager } from './DistrictsManager';

export const dynamic = 'force-dynamic';

export default async function DistrictsAdminPage() {
  const [districts, states] = await Promise.all([
    prisma.district.findMany({
      where: { deletedAt: null },
      include: {
        state: { select: { name: true } },
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.state.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]).catch(() => [[], []]);

  const serializedDistricts = serializeBigInt(districts);
  const serializedStates = serializeBigInt(states);

  return (
    <div className="space-y-6">
      <DistrictsManager initialDistricts={serializedDistricts} states={serializedStates} />
    </div>
  );
}
