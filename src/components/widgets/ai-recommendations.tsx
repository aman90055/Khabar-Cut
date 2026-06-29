'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, Cpu, RefreshCw, ChevronRight } from 'lucide-react';

const AI_RECOMMENDED = [
  {
    id: '1',
    title: 'क्या आपके कंप्यूटर पर भी मंडरा रहा है नया रैंसमवेयर खतरा? जानें कैसे बचें',
    category: 'सुरक्षा',
    time: '5 मिनट पहले',
    matchScore: 98,
  },
  {
    id: '2',
    title: 'टाटा की नई इलेक्ट्रिक सुपरकार: 500km रेंज के साथ इसी साल होगी लॉन्च',
    category: 'ऑटो',
    time: '12 मिनट पहले',
    matchScore: 94,
  },
  {
    id: '3',
    title: 'इसरो का गगनयान मिशन: अंतरिक्ष यात्रियों का पहला बैच प्रशिक्षण पूरा कर भारत लौटा',
    category: 'विज्ञान',
    time: '45 मिनट पहले',
    matchScore: 89,
  },
];

export function AIRecommendations() {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState(AI_RECOMMENDED);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Shuffle items as mockup refresh
      setItems([...items].reverse());
      setLoading(false);
    }, 600);
  };

  return (
    <div className="w-full bg-[#071330] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden border border-white/5">
      {/* Decorative background glows */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#0057FF]/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-[#D90429]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between border-b border-white/10 pb-3 mb-4 z-10">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#F6B100] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-300">
            AI पर्सनलाइज्ड रिकमेंडेशन
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
          title="रिफ्रेश करें"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative space-y-3 z-10">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-[#F6B100] tracking-wide">
                {item.category}
              </span>
              <span className="text-[9px] font-semibold text-[#0057FF] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                {item.matchScore}% Match
              </span>
            </div>
            <Link
              href={`/article/${item.id}`}
              className="text-xs font-bold leading-snug group-hover:text-[#F6B100] transition-colors line-clamp-2"
            >
              {item.title}
            </Link>
            <p className="text-[9px] text-gray-400 font-medium mt-1">
              {item.time}
            </p>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10 mt-4 pt-3 flex items-center justify-between z-10 text-[10px] font-semibold text-gray-400">
        <span className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-[#0057FF]" />
          Khabar Cut Engine v1.2
        </span>
        <Link
          href="/personalize"
          className="text-[#F6B100] hover:underline flex items-center gap-0.5"
        >
          प्राथमिकताएं बदलें <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
