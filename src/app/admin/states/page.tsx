import * as React from 'react';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { StatesManager } from './StatesManager';

export const dynamic = 'force-dynamic';

export default async function StatesAdminPage() {
  const states = await prisma.state.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { districts: true, articles: true } },
    },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => []);

  const serializedStates = serializeBigInt(states);

  return (
    <div className="space-y-6">
      <StatesManager initialStates={serializedStates} />
    </div>
  );
}
