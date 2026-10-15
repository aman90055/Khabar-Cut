'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, Video, Bookmark, Compass } from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'होम', href: '/', icon: Home },
  { label: 'ट्रेंडिंग', href: '/national', icon: Flame },
  { label: 'वीडियो', href: '/videos', icon: Video },
  { label: 'वेब स्टोरीज़', href: '/web-stories', icon: Bookmark },
  { label: 'एक्सप्लोर', href: '/states', icon: Compass },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-bottom-nav show-mobile-only no-print"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {BOTTOM_NAV.map((item) => {
        const active = item.href !== '#' && pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-1 min-w-[58px] rounded-2xl transition-all duration-300 relative ${
              active
                ? 'text-[#D90429] dark:text-red-400 scale-105 font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            aria-label={item.label}
          >
            <div
              className={`relative p-2 rounded-2xl transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-tr from-[#D90429] to-[#EF233C] text-white shadow-md shadow-red-600/40 dark:shadow-red-500/30'
                  : 'bg-transparent'
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform duration-300 ${
                  active ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-[9.5px] font-bold leading-none tracking-tight transition-all ${
                active ? 'text-[#D90429] dark:text-red-400 font-black' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
