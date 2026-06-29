'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, CloudSun, DollarSign } from 'lucide-react';

const MARKET_DATA = [
  { name: 'NIFTY 50', value: '25,122.40', change: '+142.10', isPositive: true },
  { name: 'SENSEX', value: '82,341.20', change: '+482.50', isPositive: true },
  { name: 'USD/INR', value: '83.42', change: '-0.04', isPositive: false },
  { name: 'GOLD 24K', value: '72,450', change: '+210', isPositive: true },
  { name: 'BTC/USD', value: '64,120.50', change: '-850.20', isPositive: false },
];

export function MarketWidget() {
  return (
    <div className="w-full bg-white dark:bg-[#0D1526] border border-gray-150 dark:border-white/5 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5 mb-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#0057FF]" />
          मार्केट & विजेट्स
        </span>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          <CloudSun className="w-3.5 h-3.5 text-[#F6B100]" />
          दिल्ली: 32°C
        </div>
      </div>

      <div className="space-y-2">
        {MARKET_DATA.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                item.isPositive
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {item.isPositive ? '+' : ''}{item.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
