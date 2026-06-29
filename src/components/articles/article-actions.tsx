'use client';

import * as React from 'react';
import { Share2, Bookmark, Heart, Smile, Frown, Award, Check } from 'lucide-react';

export function ArticleActions({ articleTitle }: { articleTitle: string }) {
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [reactions, setReactions] = React.useState({
    love: { count: 42, active: false, emoji: '❤️' },
    happy: { count: 28, active: false, emoji: '🔥' },
    sad: { count: 5, active: false, emoji: '😢' },
    wow: { count: 18, active: false, emoji: '😮' },
  });

  const handleReaction = (type: keyof typeof reactions) => {
    setReactions((prev) => {
      const item = prev[type];
      return {
        ...prev,
        [type]: {
          ...item,
          count: item.active ? item.count - 1 : item.count + 1,
          active: !item.active,
        },
      };
    });
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
      {/* Reactions */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3.5">
          अपनी प्रतिक्रिया दें (Reactions)
        </h4>
        <div className="flex gap-2.5 flex-wrap">
          {Object.entries(reactions).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleReaction(key as keyof typeof reactions)}
              className={`reaction-btn ${val.active ? 'active' : ''}`}
            >
              <span>{val.emoji}</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">
                {val.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Share / Save Actions */}
      <div className="flex flex-wrap gap-2.5 pt-2">
        <button
          onClick={handleCopyLink}
          className="kc-btn kc-btn-outline flex-1 sm:flex-none justify-center"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#00C853]" />
              लिंक कॉपी हो गया
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              शेयर करें
            </>
          )}
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`kc-btn flex-1 sm:flex-none justify-center ${
            saved
              ? 'bg-[#0057FF]/10 text-[#0057FF] border border-[#0057FF]/20 hover:bg-[#0057FF]/15'
              : 'kc-btn-outline'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#0057FF]' : ''}`} />
          {saved ? 'सेव्ड (Saved)' : 'बुकमार्क'}
        </button>
      </div>
    </div>
  );
}
