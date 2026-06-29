'use client';

import * as React from 'react';
import { Vote, CheckCircle2 } from 'lucide-react';

const INITIAL_POLL = {
  question: 'क्या भारत 2030 तक दुनिया की तीसरी सबसे बड़ी आर्थिक महाशक्ति बन पाएगा?',
  options: [
    { id: '1', text: 'हां, बिल्कुल संभव है', votes: 1420 },
    { id: '2', text: 'नहीं, अभी समय लगेगा', votes: 412 },
    { id: '3', text: 'कह नहीं सकते', votes: 128 },
  ],
};

export function InteractivePoll() {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [voted, setVoted] = React.useState(false);
  const [options, setOptions] = React.useState(INITIAL_POLL.options);

  const handleVote = (id: string) => {
    if (voted) return;
    setSelectedOption(id);
    setOptions(
      options.map((opt) =>
        opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );
    setVoted(true);
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="w-full bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2.5 mb-3.5">
        <Vote className="w-4 h-4 text-[#D90429]" />
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
          ओपिनियन पोल (Poll)
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-4">
        {INITIAL_POLL.question}
      </h3>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          return (
            <button
              key={opt.id}
              disabled={voted}
              onClick={() => handleVote(opt.id)}
              className="relative w-full text-left p-3 rounded-xl border border-gray-200/80 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all overflow-hidden group"
            >
              {voted && (
                <div
                  className="absolute inset-y-0 left-0 bg-red-500/10 dark:bg-red-500/15 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between z-10 text-xs font-semibold">
                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {voted && selectedOption === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-[#D90429] shrink-0" />
                  )}
                  {opt.text}
                </span>
                {voted && (
                  <span className="text-gray-900 dark:text-white font-bold ml-2">
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3 font-semibold">
          कुल मत: {totalVotes.toLocaleString()} • वोट दर्ज कर दिया गया है
        </p>
      )}
    </div>
  );
}
