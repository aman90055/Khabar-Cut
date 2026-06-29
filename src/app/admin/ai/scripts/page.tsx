'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, ArrowLeft, Loader2, Video, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AIScriptsPage() {
  const [content, setContent] = React.useState('');
  const [videoScripts, setVideoScripts] = React.useState<any>(null);
  const [socialPosts, setSocialPosts] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'video' | 'social'>('video');

  const handleGenerate = async () => {
    if (!content) {
      toast.error('Specify news content to draft scripts');
      return;
    }
    setIsLoading(true);
    try {
      const [vRes, sRes] = await Promise.all([
        fetch('/api/admin/ai/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }),
        fetch('/api/admin/ai/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }),
      ]);

      if (vRes.ok && sRes.ok) {
        const vJson = await vRes.json();
        const sJson = await sRes.json();
        setVideoScripts(vJson);
        setSocialPosts(sJson);
        toast.success('Social copies & TV scripts prepared');
      } else {
        toast.error('Failed to compose scripts');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyField = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Navigation header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/ai" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 uppercase tracking-wider transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> AI control center
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <History className="h-6 w-6 text-red-600" /> AI Video Scripts & Social Copywriter
        </h1>
        <p className="text-sm text-zinc-555">
          Converts raw article drafts into teleprompter-ready TV anchor segments, Reels transcripts, and viral social announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Content Source</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Article Draft / Notes</label>
              <textarea
                placeholder="Paste news summary or draft content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[180px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <Button onClick={handleGenerate} disabled={isLoading} className="w-full font-bold gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
              Generate Scripts & Posts
            </Button>
          </CardContent>
        </Card>

        {/* Right Output */}
        <Card className="lg:col-span-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-6">
            {/* Tabs header */}
            <div className="flex justify-between items-center border-b pb-3 dark:border-zinc-800">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('video')}
                  className="font-bold gap-1.5 h-8 text-xs"
                >
                  <Video className="h-3.5 w-3.5" /> TV & Reels Scripts
                </Button>
                <Button
                  variant={activeTab === 'social' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('social')}
                  className="font-bold gap-1.5 h-8 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" /> Social Media Posts
                </Button>
              </div>
            </div>

            {/* Content body based on active tab */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-semibold">Composing scripts...</span>
              </div>
            ) : activeTab === 'video' && videoScripts ? (
              <div className="space-y-6 text-sm font-semibold">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">TV News Anchor Script</span>
                    <Button variant="ghost" size="sm" onClick={() => copyField(videoScripts.anchorScript)} className="h-7 text-xs text-red-500 font-bold">Copy</Button>
                  </div>
                  <p className="text-zinc-850 dark:text-zinc-150 mt-1 leading-relaxed bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-dashed dark:border-zinc-800 font-semibold">{videoScripts.anchorScript}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Reels / Shorts storyboard script</span>
                    <Button variant="ghost" size="sm" onClick={() => copyField(videoScripts.reelsScript)} className="h-7 text-xs text-red-500 font-bold">Copy</Button>
                  </div>
                  <p className="text-zinc-500 mt-1 leading-relaxed">{videoScripts.reelsScript}</p>
                </div>
              </div>
            ) : activeTab === 'social' && socialPosts ? (
              <div className="space-y-6 text-sm font-semibold">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">X (formerly Twitter) Post</span>
                    <Button variant="ghost" size="sm" onClick={() => copyField(socialPosts.twitterPost)} className="h-7 text-xs text-red-500 font-bold">Copy</Button>
                  </div>
                  <p className="text-zinc-850 dark:text-zinc-150 mt-1 leading-relaxed bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-dashed dark:border-zinc-800 font-semibold">{socialPosts.twitterPost}</p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">LinkedIn professional announcement</span>
                    <Button variant="ghost" size="sm" onClick={() => copyField(socialPosts.linkedinPost)} className="h-7 text-xs text-red-500 font-bold">Copy</Button>
                  </div>
                  <p className="text-zinc-555 mt-1 leading-relaxed">{socialPosts.linkedinPost}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400">
                <History className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-sm mt-3 font-semibold">Scripts and post previews will render here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
