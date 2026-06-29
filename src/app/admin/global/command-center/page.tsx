'use client';

import * as React from 'react';
import {
  ShieldAlert, Radio, Users, MapPin, AlertTriangle, Send,
  Globe, Compass, Terminal, Activity, MessageSquare, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Correspondent {
  name: string;
  location: string;
  status: 'active' | 'offline' | 'incident';
  lastReport: string;
}

const INITIAL_CORRESPONDENTS: Correspondent[] = [
  { name: 'Vijay Shekhar', location: 'नई दिल्ली, भारत', status: 'active', lastReport: 'सेमीकंडक्टर प्लांट से लाइव रिपोर्ट' },
  { name: 'Sarah Jenkins', location: 'London, UK', status: 'active', lastReport: 'Inflation rate analysis filed' },
  { name: 'Carlos Gomez', location: 'New York, USA', status: 'incident', lastReport: 'Protests near UN Headquarters' },
  { name: 'Aisha Al-Harbi', location: 'Riyadh, Saudi Arabia', status: 'active', lastReport: 'Riyadh Tech Summit coverage' },
];

const INITIAL_ALERTS = [
  { id: '1', title: 'PM Address in 15 mins', priority: 'URGENT', time: '13:05' },
  { id: '2', title: 'Tokyo Stock Index down 2.4%', priority: 'UPDATE', time: '12:50' },
  { id: '3', title: 'Breaking: Major cybersecurity policy announced', priority: 'FLASH', time: '12:35' },
];

export default function CommandCenterPage() {
  const [alerts, setAlerts] = React.useState(INITIAL_ALERTS);
  const [correspondents] = React.useState<Correspondent[]>(INITIAL_CORRESPONDENTS);
  const [emergencyText, setEmergencyText] = React.useState('');
  const [dispatchPriority, setDispatchPriority] = React.useState<'URGENT' | 'FLASH' | 'UPDATE'>('UPDATE');
  const [sending, setSending] = React.useState(false);

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyText.trim()) return;

    setSending(true);
    // Simulate push alert dispatch to global sitemaps & wire sitemaps
    setTimeout(() => {
      const newAlert = {
        id: Date.now().toString(),
        title: emergencyText,
        priority: dispatchPriority,
        time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setAlerts([newAlert, ...alerts]);
      toast.success('Emergency alert dispatched to CDN and Mobile Apps!');
      setEmergencyText('');
      setSending(false);
    }, 500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#D90429] animate-pulse" />
            Live News Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time global bureau dispatch dashboard & emergency wire alerts queue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#D90429] text-white flex items-center gap-1 font-bold">
            <Activity className="w-3.5 h-3.5" /> Edge Active
          </Badge>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Live Dispatch */}
        <div className="space-y-6">
          <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <ShieldAlert className="w-4 h-4 text-[#D90429]" />
                <h2 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                  Emergency Dispatcher
                </h2>
              </div>
              <form onSubmit={handleSendAlert} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Alert Content</label>
                  <textarea
                    value={emergencyText}
                    onChange={(e) => setEmergencyText(e.target.value)}
                    placeholder="Type urgent global alert..."
                    rows={3}
                    className="w-full text-xs p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 rounded-xl outline-none focus:border-[#D90429] transition-all resize-none text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  {(['UPDATE', 'FLASH', 'URGENT'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDispatchPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                        dispatchPriority === p
                          ? p === 'URGENT'
                            ? 'bg-[#D90429] text-white'
                            : p === 'FLASH'
                            ? 'bg-[#0057FF] text-white'
                            : 'bg-[#F6B100] text-white'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button type="submit" disabled={sending} className="w-full h-10 font-bold bg-[#D90429] hover:bg-[#A80320]">
                  <Send className="w-4 h-4 mr-2" /> Dispatch Alert
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0D1526] p-4 rounded-xl border border-gray-150 dark:border-white/5 shadow-sm text-center">
              <Globe className="w-5 h-5 mx-auto text-[#0057FF] mb-2" />
              <p className="text-xl font-black text-gray-900 dark:text-white">195</p>
              <p className="text-[10px] font-bold text-gray-400">MONITORED REGIONS</p>
            </div>
            <div className="bg-white dark:bg-[#0D1526] p-4 rounded-xl border border-gray-150 dark:border-white/5 shadow-sm text-center">
              <Users className="w-5 h-5 mx-auto text-[#F6B100] mb-2" />
              <p className="text-xl font-black text-gray-900 dark:text-white">42</p>
              <p className="text-[10px] font-bold text-gray-400">ACTIVE BUREAU REPORTERS</p>
            </div>
          </div>
        </div>

        {/* Column 2: Wire Alerts Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#0057FF]" />
                  <h2 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                    Live Wire Queue
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-gray-400">Real-time Stream</span>
              </div>

              <div className="space-y-3">
                {alerts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={`${
                        item.priority === 'URGENT' ? 'bg-[#D90429]' : item.priority === 'FLASH' ? 'bg-[#0057FF]' : 'bg-[#F6B100]'
                      } text-white text-[9px] font-black`}>
                        {item.priority}
                      </Badge>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bureau Correspondents */}
          <Card className="border border-gray-150 dark:border-white/5 bg-white dark:bg-[#0D1526]">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Compass className="w-4 h-4 text-[#F6B100]" />
                <h2 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
                  Global Correspondents Map (Simulated)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {correspondents.map((c) => (
                  <div
                    key={c.name}
                    className="p-3 rounded-xl border border-gray-150 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{c.name}</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        c.status === 'active' ? 'bg-emerald-500' : c.status === 'offline' ? 'bg-gray-400' : 'bg-red-500 animate-pulse'
                      }`} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold">{c.location} • {c.lastReport}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
