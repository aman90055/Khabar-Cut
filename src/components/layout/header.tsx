'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search, Menu, X, Sun, Moon, Bell, Tv, ChevronDown,
  Sparkles, TrendingUp, Globe, Zap, Mic, User, LogOut,
  Radio, Newspaper, Video, BookOpen, BarChart3,
  Home, Smartphone, Hash,
} from 'lucide-react';

const NAV_CATEGORIES = [
  { label: 'होम', href: '/', icon: Home },
  { label: 'भारत', href: '/national', icon: Newspaper },
  { label: 'राज्य', href: '/states', icon: Globe },
  { label: 'विश्व', href: '/world', icon: Globe },
  { label: 'बिज़नेस', href: '/business', icon: BarChart3 },
  { label: 'टेक', href: '/technology', icon: Smartphone },
  { label: 'खेल', href: '/sports', icon: Hash },
  { label: 'मनोरंजन', href: '/entertainment', icon: Video },
  { label: 'वीडियो', href: '/videos', icon: Video },
  { label: 'वेब स्टोरीज़', href: '/web-stories', icon: BookOpen },
];

const MEGA_MENU_ITEMS = [
  { section: 'समाचार', items: [
    { label: 'राष्ट्रीय', href: '/national', icon: '🇮🇳' },
    { label: 'अंतरराष्ट्रीय', href: '/world', icon: '🌍' },
    { label: 'राजनीति', href: '/politics', icon: '🏛️' },
    { label: 'क्राइम', href: '/crime', icon: '⚖️' },
    { label: 'शिक्षा', href: '/education', icon: '📚' },
    { label: 'स्वास्थ्य', href: '/health', icon: '🏥' },
  ]},
  { section: 'व्यापार', items: [
    { label: 'बिज़नेस', href: '/business', icon: '💼' },
    { label: 'स्टार्टअप', href: '/startup', icon: '🚀' },
    { label: 'शेयर बाज़ार', href: '/market', icon: '📈' },
    { label: 'कृषि', href: '/agriculture', icon: '🌾' },
    { label: 'रियल एस्टेट', href: '/realestate', icon: '🏢' },
    { label: 'ऑटो', href: '/auto', icon: '🚗' },
  ]},
  { section: 'टेक & विज्ञान', items: [
    { label: 'टेक्नोलॉजी', href: '/technology', icon: '💻' },
    { label: 'AI न्यूज़', href: '/ai', icon: '🤖' },
    { label: 'विज्ञान', href: '/science', icon: '🔬' },
    { label: 'गैजेट्स', href: '/gadgets', icon: '📱' },
    { label: 'गेमिंग', href: '/gaming', icon: '🎮' },
    { label: 'साइबर', href: '/cyber', icon: '🔒' },
  ]},
];

const BREAKING_ITEMS = [
  'प्रधानमंत्री ने नई शिक्षा नीति 2026 का किया ऐलान, 10 करोड़ छात्रों को मिलेगा फायदा',
  'Sensex 83,000 के पार: बाजार ने बनाया नया ऑल-टाइम हाई रिकॉर्ड',
  'भारत ने सफलतापूर्वक लॉन्च किया GSAT-24: अंतरिक्ष में बड़ी छलांग',
  'ICC World Test Championship: Team India ने Final में बनाई जगह',
  'OpenAI ने लॉन्च किया GPT-5: AI की दुनिया में आई बड़ी क्रांति',
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [megaMenu, setMegaMenu] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const megaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMegaMenu(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* ── Breaking News Ticker ── */}
      <div className="bg-[#D90429] text-white h-9 flex items-center overflow-hidden z-50 relative no-print">
        <div className="flex items-center gap-0 h-full shrink-0">
          <div className="flex items-center gap-1.5 bg-[#071330] h-full px-4 text-[11px] font-black uppercase tracking-wider select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ब्रेकिंग
          </div>
          <div className="w-0 h-0 border-t-[18px] border-b-[18px] border-l-[10px] border-t-transparent border-b-transparent border-l-[#071330]" />
        </div>
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="animate-marquee select-none">
            {[...BREAKING_ITEMS, ...BREAKING_ITEMS].map((item, idx) => (
              <span key={idx} className="text-[12.5px] font-semibold cursor-pointer hover:underline whitespace-nowrap mr-16">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header
        className={`sticky top-0 z-[200] w-full transition-all duration-300 no-print ${
          scrolled
            ? 'bg-white/92 dark:bg-[#070C18]/92 backdrop-blur-xl shadow-md border-b border-gray-200/60 dark:border-white/5'
            : 'bg-white dark:bg-[#070C18] border-b border-gray-100 dark:border-white/5'
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Khabar Cut Home">
              <div className="relative">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D90429] text-white font-black text-sm tracking-tight shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-shadow">
                  KC
                </span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F6B100] rounded-full border-2 border-white dark:border-[#070C18]" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[19px] font-black tracking-tight text-[#071330] dark:text-white">
                  KHABAR<span className="text-[#D90429]"> CUT</span>
                </span>
                <span className="text-[9px] font-semibold text-gray-400 tracking-[0.15em] uppercase">India's Next Gen News</span>
              </div>
            </Link>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_CATEGORIES.slice(0, 7).map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                      active
                        ? 'text-[#D90429] bg-red-50 dark:bg-red-950/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#D90429] rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={megaRef}>
                <button
                  onClick={() => setMegaMenu(!megaMenu)}
                  onBlur={(e) => { if (!megaRef.current?.contains(e.relatedTarget as Node)) setMegaMenu(false); }}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all"
                >
                  और देखें
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenu ? 'rotate-180' : ''}`} />
                </button>

                {megaMenu && (
                  <div className="absolute top-full left-0 mt-2 w-[680px] bg-white dark:bg-[#0D1526] border border-gray-100 dark:border-[#1E293B] rounded-2xl shadow-2xl p-6 z-[250] animate-slide-down">
                    <div className="grid grid-cols-3 gap-6">
                      {MEGA_MENU_ITEMS.map((section) => (
                        <div key={section.section}>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 mb-3">
                            {section.section}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMegaMenu(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-[#D90429] transition-all group"
                              >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* AI Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 h-9 px-3 sm:px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[12.5px] font-medium hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-white/8 transition-all"
                aria-label="Search"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">खोजें…</span>
                <kbd className="hidden md:flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md font-mono text-gray-400">
                  ⌘K
                </kbd>
              </button>

              {/* Live TV */}
              <a
                href="/live"
                className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#D90429] text-white text-[12px] font-black uppercase tracking-wide hover:bg-[#A80320] transition-colors shadow-md shadow-red-500/20"
                aria-label="Live TV"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE TV
              </a>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-all"
                aria-label="Toggle theme"
              >
                <Sun className="w-4.5 h-4.5 dark:hidden" />
                <Moon className="w-4.5 h-4.5 hidden dark:block" />
              </button>

              {/* Notifications */}
              <button className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-all relative">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D90429] rounded-full border-2 border-white dark:border-[#070C18]" />
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 transition-all"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#070C18] animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {NAV_CATEGORIES.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'text-[#D90429] bg-red-50 dark:bg-red-950/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4 opacity-70" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                <a
                  href="/live"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D90429] text-white font-bold text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE TV देखें
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[300] bg-[#071330]/75 backdrop-blur-xl flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Box */}
            <div className="bg-white dark:bg-[#0D1526] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#1E293B] overflow-hidden">
              <form onSubmit={handleSearch}>
                <div className="flex items-center px-5 py-4 gap-3">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="खबर खोजें... (Search news)"
                    className="flex-1 bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                    autoComplete="off"
                  />
                  <div className="flex items-center gap-2">
                    <button type="button" className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-all" title="Voice search">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setSearchOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Trending Searches */}
              <div className="border-t border-gray-100 dark:border-[#1E293B] px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  ट्रेंडिंग खोज
                </p>
                <div className="flex flex-wrap gap-2">
                  {['भारत vs पाकिस्तान', 'Budget 2026', 'Chandrayaan 4', 'IPL 2026', 'AI News', 'Modi Speech', 'Stock Market'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); searchRef.current?.focus(); }}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-[#D90429] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="border-t border-gray-100 dark:border-[#1E293B] px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    त्वरित लिंक
                  </p>
                  <kbd className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded font-mono">
                    ESC बंद करें
                  </kbd>
                </div>
                <div className="flex gap-3 mt-2">
                  {[
                    { label: 'ब्रेकिंग न्यूज़', href: '/national', icon: Zap },
                    { label: 'वीडियो', href: '/videos', icon: Tv },
                    { label: 'वेब स्टोरीज़', href: '/web-stories', icon: Sparkles },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-[#D90429] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
