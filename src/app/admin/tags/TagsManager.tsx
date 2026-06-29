'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    articles: number;
  };
}

interface TagsManagerProps {
  initialTags: TagItem[];
}

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
          }),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          toast.success(`Tag "${result.data.name}" created successfully`);
          setName('');
          setDescription('');
          // Refresh list by prepending or fetching again
          setTags((prev) => [
            {
              ...result.data,
              _count: { articles: 0 },
            },
            ...prev,
          ]);
        } else {
          toast.error(result.error || 'Failed to create tag');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to create tag');
      }
    });
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(`Tag "${tagName}" deleted successfully`);
        setTags((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete tag');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Inline Creation Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Create New Tag</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Add a tag inline to associate with articles.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="tag-name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Tag Name *
            </label>
            <input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Artificial Intelligence"
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="tag-desc" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Description (Optional)
            </label>
            <textarea
              id="tag-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this tag..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors resize-none"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isPending ? 'Creating...' : 'Create Tag'}
          </Button>
        </form>
      </div>

      {/* Listing Table */}
      <div className="lg:col-span-2">
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No tags found. Create one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Articles</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-50">
                      <div>
                        <div>{tag.name}</div>
                        {tag.description && (
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-normal line-clamp-1 mt-0.5">
                            {tag.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                      {tag.slug}
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-500 dark:text-zinc-400">
                      {tag._count?.articles ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(tag.id, tag.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
