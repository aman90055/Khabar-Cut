import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart2, Plus, Trash2, Power, Users } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function PollsAdminPage() {
  const supabase = await createClient();

  // Fetch polls from settings where group = 'polls'
  const { data: pollsSettings } = await supabase
    .from('settings')
    .select('*')
    .eq('group', 'polls')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const serializedPolls = (pollsSettings || []).map((item: any) => {
    let parsed: any = {};
    try {
      parsed = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
    } catch {
      // ignore
    }
    return {
      id: item.id,
      key: item.key,
      question: parsed.question || item.description || 'Untitled Poll',
      options: parsed.options || [],
      isActive: parsed.isActive ?? false,
      totalVotes: parsed.totalVotes || 0,
      startDate: parsed.startDate || null,
      endDate: parsed.endDate || null,
      originalValue: parsed,
    };
  });

  async function handleToggle(key: string, currentValue: any) {
    'use server';
    const supabase = await createClient();
    const parsed = typeof currentValue === 'string' ? JSON.parse(currentValue) : { ...currentValue };
    parsed.isActive = !parsed.isActive;

    await supabase
      .from('settings')
      .update({ value: parsed, updated_at: new Date().toISOString() })
      .eq('key', key);

    revalidatePath('/admin/polls');
  }

  async function handleDelete(key: string) {
    'use server';
    const supabase = await createClient();
    await supabase.from('settings').delete().eq('key', key);
    revalidatePath('/admin/polls');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Polls & Opinions</h1>
          <p className="text-sm text-zinc-500 mt-1">Create user opinion polls, view aggregate responses, and configure display slots.</p>
        </div>
        <Link href="/admin/polls/new">
          <Button className="font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {/* Grid */}
      {serializedPolls.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 dark:border-zinc-800">
          <BarChart2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold mt-4 text-zinc-900 dark:text-zinc-50">No Polls</h3>
          <p className="text-xs text-zinc-500 mt-1">Get started by creating your first opinion poll.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serializedPolls.map((poll: any) => (
            <Card key={poll.id} className="border border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-950 flex flex-col justify-between">
              <CardContent className="p-6 space-y-5">
                {/* Question & Status */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                    {poll.question}
                  </h3>
                  <Badge
                    className={`border-none font-bold uppercase text-[8px] shrink-0 ${
                      poll.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {poll.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Options & Votes bars */}
                <div className="space-y-3">
                  {poll.options.map((opt: any, idx: number) => {
                    const pct = poll.totalVotes > 0 ? ((opt.votes / poll.totalVotes) * 100).toFixed(1) : '0';
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          <span>{opt.text}</span>
                          <span>{opt.votes} votes ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Meta details */}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Total: {poll.totalVotes} responses
                  </span>
                  <div className="flex items-center gap-1.5">
                    <form action={handleToggle.bind(null, poll.key, poll.originalValue)}>
                      <Button variant="outline" size="sm" type="submit" className="font-semibold text-xs h-8 gap-1.5">
                        <Power className="h-3.5 w-3.5" />
                        Toggle status
                      </Button>
                    </form>
                    <form action={handleDelete.bind(null, poll.key)}>
                      <Button variant="ghost" size="sm" type="submit" className="h-8 text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
