'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, MessageSquare, Send, Clock } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    body: '',
  });

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      const json = await res.json();
      if (res.ok) {
        setComments(json.data || []);
      } else {
        console.error('Failed to fetch comments', json);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('आपकी टिप्पणी सफलतापूर्वक सबमिट कर दी गई है और समीक्षा के लिए लंबित है।');
        setFormData({ author_name: '', author_email: '', body: '' });
      } else {
        const errData = await res.json();
        toast.error('टिप्पणी सबमिट करने में विफल: ' + (errData.error || 'अज्ञात त्रुटि'));
      }
    } catch (err) {
      toast.error('कुछ गलत हो गया।');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200/60 dark:border-white/5 space-y-8 no-print">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-500/10 rounded-xl">
          <MessageSquare className="w-5 h-5 text-[#0057FF]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-display">
          टिप्पणियाँ ({comments.length})
        </h3>
      </div>

      <div className="bg-white/50 dark:bg-[#0D1526]/50 backdrop-blur-xl border border-gray-150 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-6">
          अपनी राय साझा करें
        </h4>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="author_name" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">नाम</label>
              <input
                id="author_name"
                type="text"
                required
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                placeholder="अपना नाम दर्ज करें"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="author_email" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ईमेल</label>
              <input
                id="author_email"
                type="email"
                required
                value={formData.author_email}
                onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                placeholder="अपना ईमेल दर्ज करें"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="body" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">टिप्पणी</label>
            <textarea
              id="body"
              required
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF]/30 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              placeholder="आपकी राय क्या है?"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-[#0057FF] hover:bg-[#0047D4] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,87,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,87,255,0.23)] hover:-translate-y-0.5"
          >
            {submitting ? 'भेज रहा है...' : 'टिप्पणी पोस्ट करें'}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-[#0057FF] rounded-full animate-spin"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group relative pl-4 sm:pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-white/10 group-hover:bg-[#0057FF] transition-colors rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-white/5 shrink-0 shadow-inner">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                      {comment.author_name}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.created_at).toLocaleDateString('hi-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-[14.5px] text-gray-700 dark:text-gray-300 leading-relaxed ml-13 sm:ml-13 pl-13 sm:pl-13 bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">
                  {comment.body}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-[#0D1526]/30 border border-gray-100 dark:border-white/5 rounded-3xl">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">कोई टिप्पणी नहीं। सबसे पहले टिप्पणी करें!</p>
          </div>
        )}
      </div>
    </section>
  );
}
