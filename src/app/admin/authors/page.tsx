import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils';
import { AuthorCard } from './AuthorCard';

export const dynamic = 'force-dynamic';

export default async function AuthorsPage() {
  const rawAuthors = await prisma.author
    .findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
            _count: { select: { articles: { where: { deletedAt: null } } } },
          },
        },
        _count: {
          select: {
            webStories: true,
            videos: true,
            liveBlogs: true,
          },
        },
      },
      orderBy: { displayName: 'asc' },
    })
    .catch(() => []);

  const authors = serializeBigInt(rawAuthors);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Authors</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage journalists, editors, and contributors profiles, verification, and social settings.
        </p>
      </div>

      {authors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">No authors found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author: any) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}
    </div>
  );
}
