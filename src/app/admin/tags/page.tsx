import { createClient } from '@/lib/supabase/server';
import { TagsManager } from './TagsManager';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  const supabase = await createClient();

  const { data: rawTags } = await supabase
    .from('tags')
    .select('id, name, slug, description')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  const tags = (rawTags || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description || null,
    _count: { articles: 0 },
  }));

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
