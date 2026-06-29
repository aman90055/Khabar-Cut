'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Hash, Video, Bookmark, Menu } from 'lucide-react';

const BOTTOM_NAV = [
  { label: 'होम', href: '/', icon: Home },
  { label: 'ट्रेंडिंग', href: '/trending', icon: Hash },
  { label: 'वीडियो', href: '/videos', icon: Video },
  { label: 'सेव', href: '/saved', icon: Bookmark },
  { label: 'और', href: '#', icon: Menu },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-bottom-nav lg:hidden no-print"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {BOTTOM_NAV.map((item) => {
        const active = item.href !== '#' && pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px] transition-all duration-200 ${
              active ? 'text-[#D90429]' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-label={item.label}
          >
            <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
              active ? 'bg-red-50 dark:bg-red-950/30' : ''
            }`}>
              <item.icon
                className={`w-5 h-5 transition-all duration-200 ${
                  active ? 'fill-[#D90429]/15 stroke-[#D90429]' : ''
                }`}
              />
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D90429] rounded-full" />
              )}
            </div>
            <span className={`text-[10px] font-semibold leading-none transition-all ${
              active ? 'text-[#D90429]' : ''
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
