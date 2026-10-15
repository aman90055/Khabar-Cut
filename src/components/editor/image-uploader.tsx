'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedImage {
  url: string;
  media_id: string | null;
  file_name: string;
}

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string, mediaId?: string | null) => void;
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Featured Image',
  hint = 'JPG, PNG, WebP — Max 10MB',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 10,
  className = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', file.name.replace(/\.[^.]+$/, ''));

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url, data.media_id);
      toast.success('✅ Image uploaded successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }, [maxSizeMB, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange('', null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      {value ? (
        /* Image preview */
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          <img
            src={value}
            alt="Featured"
            className="w-full h-52 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-3">
            <span className="text-white text-xs font-semibold truncate max-w-[200px]">
              <CheckCircle className="w-3 h-3 inline mr-1 text-emerald-400" />
              Uploaded
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-bold bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 text-xs font-bold bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-8
            rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-200
            ${dragOver
              ? 'border-[#D90429] bg-red-50/10 dark:bg-red-950/20 scale-[1.01]'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-[#D90429]/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }
            ${uploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#D90429] animate-spin" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {uploading ? 'Uploading...' : 'Click or drag & drop image'}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{hint}</p>
          </div>
          {dragOver && (
            <div className="absolute inset-0 rounded-2xl bg-[#D90429]/5 border-2 border-[#D90429] flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#D90429]" />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {/* Manual URL input as fallback */}
      <div className="relative">
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value, null)}
          placeholder="या image URL paste करें (https://...)"
          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/20 outline-none transition-all"
        />
      </div>
    </div>
  );
}
