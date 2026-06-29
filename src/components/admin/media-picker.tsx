'use client';

import * as React from 'react';
import { Search, Loader2, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  originalName?: string | null;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  size: string | number;
}

interface MediaPickerProps {
  onSelect: (media: MediaItem) => void;
  onClose: () => void;
  accept?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ALL';
}

export function MediaPicker({ onSelect, onClose, accept = 'ALL' }: MediaPickerProps) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const typeFilter = accept !== 'ALL' ? `&type=${accept}` : '';
      const res = await fetch(`/api/admin/media?q=${encodeURIComponent(query)}${typeFilter}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMedia();
  }, [query, accept]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Select Media</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Select a file from your library or search for one.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Filter / Search */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-semibold">Loading media library...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center space-y-2">
              <ImageIcon className="h-10 w-10 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No files found</p>
              <p className="text-xs text-zinc-500">Search for something else or upload a file first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 relative bg-zinc-50 dark:bg-zinc-900/40 hover:border-red-500 transition-colors"
                >
                  <div className="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {item.type === 'IMAGE' ? (
                      <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                    ) : item.type === 'VIDEO' ? (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-950">
                        <Video className="h-8 w-8 text-white/50" />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                        <FileText className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                      {item.originalName || item.filename}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
