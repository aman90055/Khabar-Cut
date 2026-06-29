'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, ArrowLeft, Play, Square, Volume2, Mic, VolumeX, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AIAnchorPage() {
  const [script, setScript] = React.useState(
    'Good evening. You are watching Khabar Cut Digital Newsroom. Tonight, the Indian union cabinet has approved a major project to accelerate national quantum computing capabilities, focusing on advanced cryptographic codes and regional intelligence nodes in Bengaluru. Our reporting team will bring you complete ground updates shortly. Stay tuned.'
  );
  const [gender, setGender] = React.useState<'male' | 'female'>('female');
  const [language, setLanguage] = React.useState<'en' | 'hi'>('en');
  const [speed, setSpeed] = React.useState<number>(1); // rate modifier

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speechInstance, setSpeechInstance] = React.useState<SpeechSynthesisUtterance | null>(null);

  const startSpeech = () => {
    if (!script.trim()) {
      toast.error('Specify a script for the anchor to read');
      return;
    }

    // Cancel any active synthesis
    window.speechSynthesis?.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = speed;

    // Try finding matching voice
    const voices = window.speechSynthesis?.getVoices() || [];
    let selectedVoice = null;

    if (language === 'hi') {
      selectedVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
    } else {
      if (gender === 'female') {
        selectedVoice = voices.find((v) => v.name.includes('Google US English') || v.lang === 'en-US');
      } else {
        selectedVoice = voices.find((v) => v.name.includes('Microsoft David') || v.name.includes('Male') || v.lang === 'en-GB');
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      toast.success('Anchor script reading complete');
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    setSpeechInstance(utterance);
    window.speechSynthesis?.speak(utterance);
    toast.success('AI virtual anchor reading active');
  };

  const stopSpeech = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    toast.info('Broadcast stopped');
  };

  React.useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Navigation header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/ai" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 uppercase tracking-wider transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> AI control center
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-red-600" /> AI Virtual News Anchor System
        </h1>
        <p className="text-sm text-zinc-555">
          Live teleprompter script reading utilizing integrated voice synthesis matching local reporting standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Configurations */}
        <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Anchor Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Anchor Gender</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none font-bold"
                >
                  <option value="female">Female Voice</option>
                  <option value="male">Male Voice</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Language Profile</label>
                <select
                  value={language}
                  onChange={(e: any) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none font-bold"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Reading Speed multiplier</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:border-red-500 focus:outline-none font-bold"
              >
                <option value={0.8}>Slow (0.8x)</option>
                <option value={1}>Normal (1.0x)</option>
                <option value={1.2}>Fast (1.2x)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Edit Broadcast Script</label>
              <textarea
                placeholder="Anchor reading text..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full min-h-[140px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            {isPlaying ? (
              <Button onClick={stopSpeech} variant="destructive" className="w-full font-bold gap-2">
                <Square className="h-4 w-4" /> Stop Live Broadcast
              </Button>
            ) : (
              <Button onClick={startSpeech} className="w-full font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 border-none">
                <Play className="h-4 w-4 fill-white" /> Start Live Broadcast
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right teleprompter screen */}
        <Card className="lg:col-span-3 border border-zinc-250 dark:border-zinc-800 bg-zinc-950 text-white rounded-3xl overflow-hidden relative min-h-[420px] flex flex-col justify-between">
          <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex justify-between items-center z-10">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5">
              <Mic className="h-4 w-4 animate-pulse" /> Live Teleprompter Studio
            </span>
            <Badge variant="secondary" className="font-mono text-[8px] bg-zinc-800 text-zinc-300 border-none">
              SPEED: {speed}X
            </Badge>
          </div>

          {/* Teleprompter scrolling zone */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 select-none text-center relative overflow-hidden">
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 pointer-events-none z-10" />
            )}

            <div className={`transition-all duration-1000 ${isPlaying ? 'animate-teleprompter text-2xl font-black text-emerald-400' : 'text-lg text-zinc-400 font-bold'} max-w-xl leading-relaxed`}>
              {script}
            </div>
          </div>

          {/* Voice active audio wave visual indicator */}
          <div className="h-16 bg-zinc-900 border-t border-zinc-850 p-4 flex items-center justify-center gap-1.5">
            {isPlaying ? (
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 15 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-emerald-500 rounded-full animate-wave-bar"
                    style={{
                      height: `${10 + Math.random() * 22}px`,
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider flex items-center gap-1">
                <VolumeX className="h-4 w-4" /> Studio Muted — Press start to speak
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
