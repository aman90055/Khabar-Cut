'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(data.error || 'कुछ गलत हो गया');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">सफलतापूर्वक सब्सक्राइब हो गए!</h3>
        <p className="text-zinc-400 text-sm">हमारे न्यूज़लेटर से जुड़ने के लिए धन्यवाद।</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">ताज़ा ख़बरें आपके इनबॉक्स में</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">हर सुबह देश और दुनिया की ज़रूरी ख़बरें पढ़ें।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="आपका नाम (वैकल्पिक)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500"
            />
            <input
              type="email"
              placeholder="आपका ईमेल पता"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/5 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-500">{message}</p>
          )}

          <Button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white rounded-xl py-6 font-bold text-base transition-all disabled:opacity-70 shadow-lg shadow-red-500/25"
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'सब्सक्राइब करें'
            )}
          </Button>

          <p className="text-center text-xs text-zinc-500">
            आपकी जानकारी सुरक्षित है
          </p>
        </form>
      </div>
    </div>
  );
}
