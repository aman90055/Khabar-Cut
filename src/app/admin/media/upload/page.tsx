'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaUploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    try {
      for (const file of selectedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Failed to upload file');
        }
      }

      toast.success('Files uploaded successfully');
      router.push('/admin/media');
    } catch {
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Upload Media</h1>
        <p className="text-sm text-zinc-500 mt-1">Upload images, videos, or documents to the media library.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-red-500 bg-red-50/10'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,application/pdf"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-3 block">
              <Upload className="h-10 w-10 text-zinc-400 mx-auto" />
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Drag & drop files here, or <span className="text-red-500 hover:underline">browse</span>
              </div>
              <div className="text-xs text-zinc-500">Supports Images, Videos, PDFs (Max 10MB per file)</div>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Selected Files</h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-sm">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={isUploading}
                      className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() => router.push('/admin/media')}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              disabled={selectedFiles.length === 0 || isUploading}
              onClick={handleUpload}
              className="font-semibold gap-2"
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Start Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
