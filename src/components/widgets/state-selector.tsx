'use client';

import * as React from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight, Newspaper } from 'lucide-react';

const STATES = [
  { name: 'उत्तर प्रदेश', slug: 'uttar-pradesh', districts: ['लखनऊ', 'कानपुर', 'वाराणसी', 'नोएडा', 'प्रयागराज'] },
  { name: 'बिहार', slug: 'bihar', districts: ['पटना', 'गया', 'मुजफ्फरपुर', 'भागलपुर', 'दरभंगा'] },
  { name: 'मध्य प्रदेश', slug: 'madhya-pradesh', districts: ['भोपाल', 'इंदौर', 'ग्वालियर', 'जबलपुर', 'उज्जैन'] },
  { name: 'दिल्ली NCR', slug: 'delhi-ncr', districts: ['नई दिल्ली', 'नोएडा', 'गुरुग्राम', 'गाजियाबाद', 'फरीदाबाद'] },
  { name: 'राजस्थान', slug: 'rajasthan', districts: ['जयपुर', 'जोधपुर', 'उदयपुर', 'कोटा', 'अजमेर'] },
];

export function StateSelector() {
  const [activeStateIndex, setActiveStateIndex] = React.useState(0);
  const activeState = STATES[activeStateIndex];

  return (
    <div className="w-full bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2.5 mb-3.5">
        <MapPin className="w-4 h-4 text-[#0057FF]" />
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
          अपना राज्य / शहर चुनें
        </span>
      </div>

      {/* States Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin mb-4">
        {STATES.map((state, idx) => (
          <button
            key={state.slug}
            onClick={() => setActiveStateIndex(idx)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeStateIndex === idx
                ? 'bg-[#0057FF] text-white'
                : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8'
            }`}
          >
            {state.name}
          </button>
        ))}
      </div>

      {/* Districts List */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          प्रमुख जिले (Districts)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {activeState.districts.map((district) => (
            <Link
              key={district}
              href={`/districts/${encodeURIComponent(district)}`}
              className="flex items-center justify-between p-2 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 hover:border-[#0057FF]/35 hover:text-[#0057FF] hover:bg-blue-50/10 dark:hover:bg-blue-950/20 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all group"
            >
              <span className="truncate">{district}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0057FF] group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-white/5 mt-4 pt-3.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
          सभी राज्यों की खबरें देखें
        </span>
        <Link
          href="/states"
          className="text-xs font-bold text-[#0057FF] hover:underline flex items-center gap-0.5"
        >
          यहाँ क्लिक करें <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
