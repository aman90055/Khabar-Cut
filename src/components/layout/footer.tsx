'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSubscribe } from '@/features/newsletters/queries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site';

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
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Khabar Cut News Logo"
                className="h-14 w-auto object-contain dark:brightness-105"
              />
            </Link>
            <p className="text-sm text-zinc-400 max-w-xs">
              {siteConfig.description}
            </p>
            <div className="flex space-x-6">
              {/* Social icons links */}
              {Object.entries(siteConfig.social).map(([platform, handle]) => (
                <a
                  key={platform}
                  href={`https://${platform}.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase text-xs font-bold"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-zinc-200 uppercase">
                  Categories
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/national" className="text-sm hover:text-white transition-colors">
                      National
                    </Link>
                  </li>
                  <li>
                    <Link href="/business" className="text-sm hover:text-white transition-colors">
                      Business
                    </Link>
                  </li>
                  <li>
                    <Link href="/tech" className="text-sm hover:text-white transition-colors">
                      Technology
                    </Link>
                  </li>
                  <li>
                    <Link href="/videos" className="text-sm hover:text-white transition-colors">
                      Videos
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider text-zinc-200 uppercase">
                  Editorial
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/web-stories" className="text-sm hover:text-white transition-colors">
                      Web Stories
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-sm hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-zinc-200 uppercase">
                Subscribe to our newsletter
              </h3>
              <p className="mt-4 text-sm text-zinc-400">
                Get the latest news and features delivered straight to your inbox daily.
              </p>
              <form className="mt-4 sm:flex sm:max-w-md flex-col gap-2" onSubmit={handleSubscribe}>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-w-0 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div className="flex gap-2 w-full">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-w-0 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <Button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 rounded-md font-semibold text-sm px-4"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-900 pt-8 flex items-center justify-between flex-col md:flex-row gap-4">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} {siteConfig.name} Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
