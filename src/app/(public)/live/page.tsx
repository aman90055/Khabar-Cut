'use client';

import * as React from 'react';
import {
  Tv, Play, Volume2, Maximize, AlertCircle, Calendar,
  Clock, Share2, MessageSquare, Flame, Sparkles, User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Program {
  title: string;
  time: string;
  host: string;
  isActive?: boolean;
}

const CHANNELS = [
  { id: '1', name: 'Khabar Cut Live Hindi', slug: 'hindi', viewers: '14.2K' },
  { id: '2', name: 'Khabar Cut Global English', slug: 'english', viewers: '8.9K' },
];

const EPG_SCHEDULE: Program[] = [
  { title: 'सुबह की सुर्खियां (Morning Headlines)', time: '08:00 AM - 09:00 AM', host: 'आदित्य राज' },
  { title: 'देश की बात (National Debate)', time: '08:00 PM - 09:00 PM', host: 'अमित कुमार', isActive: true },
  { title: 'टेक वर्ल्ड (Tech Weekly)', time: '09:30 PM - 10:00 PM', host: 'प्रिया शर्मा' },
];

const LIVE_UPDATES = [
  { id: '1', time: '13:45', content: 'भारत ने सेमीकंडक्टर क्रांति की शुरुआत की: गुजरात में नए प्लांट का काम शुरू हुआ।' },
  { id: '2', time: '13:30', content: 'शेयर बाजार में रिकॉर्ड उछाल: सेंसेक्स पहली बार 83,000 के पार बंद।' },
  { id: '3', time: '13:12', content: 'मौसम विभाग की चेतावनी: दिल्ली और एनसीआर में अगले 24 घंटों में भारी बारिश की आशंका।' },
];

export default function PublicLivePage() {
  const [activeChannel, setActiveChannel] = React.useState('1');
  const selectedChannel = CHANNELS.find((ch) => ch.id === activeChannel) || CHANNELS[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 xl:px-10 py-6 sm:py-8 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-white/5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D90429] animate-pulse" />
            Live TV & 24x7 Broadcast
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            Watch Khabar Cut live channels, breaking updates, and debate EPG schedules.
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Video Player & Controller (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Video Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-xl group border border-gray-150 dark:border-white/5">
            {/* Simulated Stream Banner Overlay */}
            <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
              <div className="text-center space-y-3 z-10">
                <div className="w-16 h-16 rounded-full bg-[#D90429]/90 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all cursor-pointer">
                  <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                </div>
                <p className="text-white text-xs font-black tracking-widest uppercase">
                  Streaming {selectedChannel.name}
                </p>
              </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="flex items-center gap-4">
                <Play className="w-4 h-4 cursor-pointer" />
                <Volume2 className="w-4 h-4 cursor-pointer" />
                <span className="text-[10px] font-bold">LIVE | {selectedChannel.viewers} watching</span>
              </div>
              <Maximize className="w-4 h-4 cursor-pointer" />
            </div>

            {/* Live Flashing Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-[#D90429] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          </div>

          {/* Channel Selector */}
          <div className="flex gap-3">
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
                  activeChannel === ch.id
                    ? 'border-[#0057FF] bg-blue-50/10 dark:bg-blue-950/20 text-[#0057FF]'
                    : 'border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526] text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide">{ch.name}</span>
                  <Badge className="bg-[#0057FF] text-white text-[8px] font-bold">{ch.viewers} Live</Badge>
                </div>
              </button>
            ))}
          </div>

          {/* Live Blog Updates */}
          <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Flame className="w-4 h-4 text-[#D90429]" />
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                  Live Feed Updates
                </h3>
              </div>
              <div className="space-y-4">
                {LIVE_UPDATES.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start border-l-2 border-red-500 pl-4 py-0.5">
                    <span className="text-[10px] font-black text-[#D90429]">{item.time} IST</span>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar EPG & Commentary (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* EPG Timeline */}
          <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <Calendar className="w-4 h-4 text-[#F6B100]" />
                <h3 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">
                  EPG Schedule
                </h3>
              </div>
              <div className="space-y-3.5">
                {EPG_SCHEDULE.map((prog) => (
                  <div
                    key={prog.title}
                    className={`p-3 rounded-xl border ${
                      prog.isActive
                        ? 'border-[#0057FF] bg-blue-50/10 dark:bg-blue-950/20'
                        : 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2'
                    } space-y-1`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{prog.title}</h4>
                      {prog.isActive && (
                        <Badge className="bg-[#D90429] text-white text-[8px] font-bold">ON AIR</Badge>
                      )}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {prog.time}</span>
                      <span>Host: {prog.host}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ad Slot */}
          <div className="ad-container ad-rectangle">
            <span className="ad-label">Advertisement</span>
            <div className="text-center p-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Direct Premium Ad</p>
              <p className="text-xs font-bold text-[#D90429]">300 x 250 Sidebar Banner</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
