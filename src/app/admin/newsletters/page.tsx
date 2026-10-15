'use client';

import * as React from 'react';
import { Mail, Send, Plus, Users, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function NewslettersAdminPage() {
  const [subscribers, setSubscribers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/admin/subscriptions/subscribers')
      .then(r => r.json())
      .then(data => setSubscribers(data.data || data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      toast.error('Subject and message content are required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content: body }),
      });
      if (res.ok) {
        toast.success('Newsletter dispatched successfully!');
        setSubject('');
        setBody('');
      } else {
        toast.error('Failed to send newsletter');
      }
    } catch {
      toast.error('Newsletter error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#D90429]" /> Newsletter & Broadcast Center
        </h1>
        <p className="text-sm text-zinc-500">Send custom email broadcasts to all your subscribed readers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Broadcast */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#D90429]" /> Compose Email Broadcast
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Breaking News Digest — Khabar Cut"
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Message Content</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={6}
                placeholder="Write your email updates or newsletter text..."
                className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D90429]"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 bg-[#D90429] hover:bg-red-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? 'Dispatching...' : 'Send Broadcast to Subscribers'}
            </button>
          </form>
        </div>

        {/* Stats & Subscribers */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Subscribers</span>
              <Users className="w-4 h-4 text-[#D90429]" />
            </div>
            <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{subscribers.length || 0}</p>
            <p className="text-xs text-zinc-400">Readers opted-in for daily news digests.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
