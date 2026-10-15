'use client';

import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, Award, MapPin, Calendar, QrCode } from 'lucide-react';

interface PressIdCardProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
    role?: { name: string; slug: string } | null;
    created_at?: string;
  };
  onClose: () => void;
}

export function PressIdCardModal({ user, onClose }: PressIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const pressId = `KC-PRESS-${user.id.slice(0, 6).toUpperCase()}`;
  const issueDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('hi-IN', { month: 'short', year: 'numeric' })
    : 'JAN 2026';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D90429]" /> Official Press ID Card
            </h2>
            <p className="text-xs text-zinc-400">Professional Press Credential for {user.full_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D90429] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4" /> Print / Save ID
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div ref={cardRef} className="print:p-0 flex flex-col items-center justify-center gap-6">
          {/* Card Container */}
          <div className="w-[340px] h-[520px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl border-2 border-red-600/30 shadow-2xl overflow-hidden relative flex flex-col justify-between p-5 text-white">
            {/* Background Hologram overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,4,41,0.15),transparent_50%)] pointer-events-none" />

            {/* Card Header */}
            <div className="text-center relative z-10 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.png" alt="Khabar Cut" className="h-9 w-auto object-contain" />
                <span className="text-lg font-black tracking-tight text-white">KHABAR CUT</span>
              </div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                OFFICIAL PRESS CARD
              </div>
            </div>

            {/* Journalist Photo & Badge */}
            <div className="flex flex-col items-center relative z-10 space-y-3 my-2">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-red-500 shadow-xl bg-zinc-800">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-red-500 bg-red-500/10">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-500 border-2 border-zinc-900 flex items-center justify-center shadow-md">
                  <Award className="w-4 h-4 text-zinc-950" />
                </div>
              </div>

              {/* Name & Role */}
              <div className="text-center space-y-0.5">
                <h3 className="text-base font-extrabold text-white tracking-wide">{user.full_name}</h3>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  {user.role?.name || 'Journalist / Reporter'}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">{pressId}</p>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-zinc-900/90 rounded-xl p-3 border border-zinc-800 text-[11px] space-y-1.5 relative z-10">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Issue Date:</span>
                <span className="text-zinc-200 font-medium">{issueDate}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">VERIFIED PRESS</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Bureau:</span>
                <span className="text-zinc-200 font-medium">Headquarters</span>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white p-1 rounded-lg">
                  <div className="w-full h-full bg-black rounded flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-white" />
                  </div>
                </div>
                <span className="text-[8px] text-zinc-500 mt-0.5">VERIFY ONLINE</span>
              </div>

              {/* Authorized Signature of Aman Vishwakarma */}
              <div className="text-right space-y-0.5">
                <div className="h-7 flex items-end justify-end">
                  <span className="font-serif italic font-extrabold text-sm text-zinc-200 tracking-wider underline decoration-red-500 decoration-1 underline-offset-2">
                    Aman Vishwakarma
                  </span>
                </div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                  Authorized Signatory (CEO)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
