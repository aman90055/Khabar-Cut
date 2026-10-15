'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSubscribe } from '@/features/newsletters/queries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site';
import { Twitter, Facebook, Youtube, Instagram, MessageCircle } from 'lucide-react';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
  whatsapp: MessageCircle,
};

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const subscribeMutation = useSubscribe();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await subscribeMutation.mutateAsync({ email, name, source: 'footer' });
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setName('');
    } catch (err: any) {
      toast.error(err.message || 'Subscription failed');
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pb-32 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: About & Logo */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Khabar Cut News Logo"
                className="h-14 w-auto object-contain dark:brightness-105"
              />
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              {Object.entries(siteConfig.social).map(([platform, handle]) => {
                const Icon = SOCIAL_ICONS[platform.toLowerCase()];
                const url = handle.startsWith('http')
                  ? handle
                  : platform.toLowerCase() === 'youtube'
                  ? `https://www.youtube.com/${handle}`
                  : `https://${platform}.com/${handle.replace('@', '')}`;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#D90429] hover:border-[#D90429] transition-all hover:scale-110 shadow-sm group"
                  >
                    {Icon ? <Icon className="w-4 h-4 transition-transform group-hover:scale-110" /> : <span className="text-xs uppercase">{platform[0]}</span>}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase mb-4 border-l-2 border-[#D90429] pl-2">
              श्रेणियां (Categories)
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/national" className="hover:text-white transition-colors">भारत (National)</Link></li>
              <li><Link href="/states" className="hover:text-white transition-colors">राज्य समाचार (States)</Link></li>
              <li><Link href="/business" className="hover:text-white transition-colors">बिज़नेस (Business)</Link></li>
              <li><Link href="/technology" className="hover:text-white transition-colors">टेक्नोलॉजी (Tech)</Link></li>
              <li><Link href="/sports" className="hover:text-white transition-colors">खेल (Sports)</Link></li>
              <li><Link href="/entertainment" className="hover:text-white transition-colors">मनोरंजन (Entertainment)</Link></li>
              <li><Link href="/web-stories" className="hover:text-white transition-colors">वेब स्टोरीज़ (Web Stories)</Link></li>
            </ul>
          </div>

          {/* Col 3: Company & Trust Pages */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase mb-4 border-l-2 border-[#0057FF] pl-2">
              संस्थान & नीतियां (Policies)
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors font-medium">About Us (हमारे बारे में)</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors font-medium">Contact Us (संपर्क करें)</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial Policy (सम्पादकीय नीति)</Link></li>
              <li><Link href="/correction-policy" className="hover:text-white transition-colors">Correction Policy (संशोधन नीति)</Link></li>
              <li><Link href="/grievance" className="hover:text-white transition-colors">Grievance Officer (शिकायत निवारण)</Link></li>
              <li><Link href="/advertise" className="hover:text-white transition-colors">Advertise With Us (विज्ञापन)</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Newsletter */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-zinc-200 uppercase mb-4 border-l-2 border-[#F6B100] pl-2">
              कानूनी & न्यूज़लेटर
            </h3>
            <ul className="space-y-2.5 text-xs mb-6">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy (गोपनीयता नीति)</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions (नियम व शर्तें)</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer (अस्वीकरण)</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy (कुकी नीति)</Link></li>
            </ul>

            <form className="space-y-2" onSubmit={handleSubscribe}>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="अपना ईमेल दर्ज करें"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold text-xs px-3 py-1.5 shrink-0"
                >
                  सब्सक्राइब
                </Button>
              </div>
            </form>
          </div>

        </div>

        {/* Trust Badges & Press Verification Bar */}
        <div className="border-t border-zinc-900 py-6 my-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <span className="text-emerald-500 font-bold">✓</span> IFCN Fact-Check Verified
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <span className="text-blue-500 font-bold">🛡️</span> Editor-in-Chief: Aman Vishwakarma
            </span>
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 px-3 py-1 rounded-lg font-bold transition-all"
            >
              📜 Press ID Card Verification System
            </Link>
          </div>
          <p className="text-zinc-500 text-[11px]">
            सत्यापित पत्रकारिता एवं डिजिटल समाचार नेटवर्क • Khabar Cut News
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 pt-6 pb-24 lg:pb-0 flex items-center justify-between flex-col md:flex-row gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} Media Network. All rights reserved. Registered Digital News Publisher.
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/disclaimer" className="hover:underline">Disclaimer</Link>
            <Link href="/grievance" className="hover:underline">Grievance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
