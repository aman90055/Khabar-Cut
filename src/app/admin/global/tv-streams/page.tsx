'use client';

import * as React from 'react';
import {
  Tv, Plus, Calendar, Clock, Edit2, Trash2, PlayCircle, Eye, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  slug: string;
  streamUrl: string;
  isActive: boolean;
  views: number;
}

interface Program {
  id: string;
  title: string;
  time: string;
  duration: string;
  host: string;
}

const INITIAL_CHANNELS: Channel[] = [
  { id: '1', name: 'Khabar Cut Live Hindi', slug: 'hindi', streamUrl: 'https://stream.khabarcut.com/live/hindi.m3u8', isActive: true, views: 14200 },
  { id: '2', name: 'Khabar Cut Global English', slug: 'english', streamUrl: 'https://stream.khabarcut.com/live/english.m3u8', isActive: true, views: 8900 },
  { id: '3', name: 'KC Business TV', slug: 'business', streamUrl: 'https://stream.khabarcut.com/live/business.m3u8', isActive: false, views: 0 },
];

const INITIAL_PROGRAMS: Program[] = [
  { id: 'p1', title: 'सुबह की सुर्खियां (Morning Headlines)', time: '08:00 AM - 09:00 AM', duration: '60 mins', host: 'आदित्य राज' },
  { id: 'p2', title: 'देश की बात (National Debate)', time: '08:00 PM - 09:00 PM', duration: '60 mins', host: 'अमित कुमार' },
  { id: 'p3', title: 'टेक वर्ल्ड (Tech Weekly)', time: '09:30 PM - 10:00 PM', duration: '30 mins', host: 'प्रिया शर्मा' },
];

export default function TvStreamsAdminPage() {
  const [channels, setChannels] = React.useState<Channel[]>(INITIAL_CHANNELS);
  const [programs, setPrograms] = React.useState<Program[]>(INITIAL_PROGRAMS);
  const [showAddChannel, setShowAddChannel] = React.useState(false);
  const [showAddProgram, setShowAddProgram] = React.useState(false);

  const [newChannel, setNewChannel] = React.useState({ name: '', slug: '', streamUrl: '' });
  const [newProgram, setNewProgram] = React.useState({ title: '', time: '', duration: '', host: '' });

  const toggleChannel = (id: string) => {
    setChannels(
      channels.map((ch) => (ch.id === id ? { ...ch, isActive: !ch.isActive } : ch))
    );
    toast.success('Channel broadcast state updated');
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name || !newChannel.streamUrl) return;

    const ch: Channel = {
      id: Date.now().toString(),
      name: newChannel.name,
      slug: newChannel.slug || newChannel.name.toLowerCase().replace(/\s+/g, '-'),
      streamUrl: newChannel.streamUrl,
      isActive: true,
      views: 0,
    };

    setChannels([...channels, ch]);
    setNewChannel({ name: '', slug: '', streamUrl: '' });
    setShowAddChannel(false);
    toast.success('New live stream channel registered');
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.title || !newProgram.time) return;

    const prog: Program = {
      id: Date.now().toString(),
      title: newProgram.title,
      time: newProgram.time,
      duration: newProgram.duration || '30 mins',
      host: newProgram.host || 'Guest Host',
    };

    setPrograms([...programs, prog]);
    setNewProgram({ title: '', time: '', duration: '', host: '' });
    setShowAddProgram(false);
    toast.success('EPG program slot scheduled');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-[#0057FF]" />
            Live TV & EPG Streams Control
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage multi-channel live streaming URLs, EPG schedules, and global broadcast states.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddChannel(true)} className="bg-[#0057FF] hover:bg-[#003FBB]">
            <Plus className="w-4 h-4 mr-1.5" /> Add Channel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Channels Grid (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {channels.map((ch) => (
              <Card key={ch.id} className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526] overflow-hidden group">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#0057FF] transition-colors">{ch.name}</h3>
                      <p className="text-[10px] text-gray-400 font-semibold">{ch.streamUrl}</p>
                    </div>
                    <Badge className={`${ch.isActive ? 'bg-emerald-600' : 'bg-gray-500'} text-white text-[8px] font-black`}>
                      {ch.isActive ? 'LIVE' : 'OFFLINE'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5 text-[10px] text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {ch.views.toLocaleString()} Watchers
                    </span>
                    <button
                      onClick={() => toggleChannel(ch.id)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                        ch.isActive ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {ch.isActive ? 'Stop Broadcast' : 'Start Broadcast'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: EPG Schedules */}
        <div className="space-y-6">
          <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F6B100]" />
                  <h2 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                    Live EPG Schedules
                  </h2>
                </div>
                <button onClick={() => setShowAddProgram(true)} className="p-1 text-[#0057FF] hover:underline text-[10px] font-black">
                  + Add Slot
                </button>
              </div>

              <div className="space-y-3.5">
                {programs.map((prog) => (
                  <div key={prog.id} className="p-3 rounded-xl border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{prog.title}</h4>
                      <span className="text-[9px] text-[#0057FF] bg-blue-500/10 px-1.5 py-0.5 rounded font-black">{prog.duration}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {prog.time}</span>
                      <span>Host: {prog.host}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Add Channel Modal */}
      {showAddChannel && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => setShowAddChannel(false)}>
          <div className="bg-white dark:bg-[#0D1526] rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase mb-4">Add Channel Stream</h3>
            <form onSubmit={handleAddChannel} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Channel Name</label>
                <input
                  type="text"
                  required
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  placeholder="Khabar Cut English"
                  className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">M3U8 Stream URL</label>
                <input
                  type="url"
                  required
                  value={newChannel.streamUrl}
                  onChange={(e) => setNewChannel({ ...newChannel, streamUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setShowAddChannel(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#0057FF] hover:bg-[#003FBB]">Save Channel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Program Modal */}
      {showAddProgram && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => setShowAddProgram(false)}>
          <div className="bg-white dark:bg-[#0D1526] rounded-2xl w-full max-w-md shadow-2xl p-6 border border-gray-100 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase mb-4">Add EPG Schedule</h3>
            <form onSubmit={handleAddProgram} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Time Slot (e.g. 09:00 PM - 10:00 PM)</label>
                <input
                  type="text"
                  required
                  value={newProgram.time}
                  onChange={(e) => setNewProgram({ ...newProgram, time: e.target.value })}
                  className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Duration</label>
                  <input
                    type="text"
                    value={newProgram.duration}
                    onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                    placeholder="60 mins"
                    className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Host Name</label>
                  <input
                    type="text"
                    value={newProgram.host}
                    onChange={(e) => setNewProgram({ ...newProgram, host: e.target.value })}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setShowAddProgram(false)} variant="outline" className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-[#0057FF] hover:bg-[#003FBB]">Schedule Slot</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
