import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { TagsManager } from './TagsManager';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  const rawTags = await prisma.tag
    .findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { articles: { where: { deletedAt: null } } },
        },
      },
      orderBy: { name: 'asc' },
    })
    .catch(() => []);

  const tags = serializeBigInt(rawTags);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tags</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Create, edit, and delete tags used to classify and search articles.
        </p>
      </div>

      <TagsManager initialTags={tags} />
    </div>
  );
}
