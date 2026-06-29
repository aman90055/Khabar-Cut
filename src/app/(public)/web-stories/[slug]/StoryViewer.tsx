'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Share2, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Slide {
  imageUrl: string;
  text?: string | null;
  link?: string | null;
}

interface StoryViewerProps {
  story: {
    id: string;
    title: string;
    coverImage: string | null;
    slides: any; // JSON
    author: {
      displayName: string;
    };
  };
}

export function StoryViewer({ story }: StoryViewerProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  // Parse slides safely
  const slides: Slide[] = React.useMemo(() => {
    try {
      if (typeof story.slides === 'string') {
        return JSON.parse(story.slides);
      }
      return Array.isArray(story.slides) ? story.slides : [];
    } catch {
      return [];
    }
  }, [story.slides]);

  const slideCount = slides.length;

  const handleNext = React.useCallback(() => {
    if (currentIdx < slideCount - 1) {
      setCurrentIdx((prev) => prev + 1);
      setProgress(0);
    } else {
      // return to index
      router.push('/web-stories');
    }
  }, [currentIdx, slideCount, router]);

  const handlePrev = React.useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIdx]);

  // Autoplay ticker
  React.useEffect(() => {
    if (slideCount === 0) return;

    const duration = 5000; // 5 seconds per slide
    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIdx, slideCount, handleNext]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    const x = e.nativeEvent.offsetX;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Story link copied!');
  };

  if (slideCount === 0) {
    return (
      <div className="text-white text-center space-y-4">
        <p className="text-sm">No slides available for this story.</p>
        <Button onClick={() => router.push('/web-stories')}>Go Back</Button>
      </div>
    );
  }

  const activeSlide = slides[currentIdx];

  return (
    <div className="relative w-full max-w-md h-full sm:h-[80vh] aspect-[9/16] bg-zinc-900 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Background slide image */}
      <img
        src={activeSlide.imageUrl}
        alt={`Slide ${currentIdx + 1}`}
        className="absolute inset-0 h-full w-full object-cover select-none"
      />
      {/* Visual Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      {/* Top Segmented Progress Indicators */}
      <div className="relative z-10 p-3.5 space-y-3.5 pointer-events-none">
        <div className="flex gap-1.5 w-full">
          {Array.from({ length: slideCount }).map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{
                  width: idx === currentIdx ? `${progress}%` : idx < currentIdx ? '100%' : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Info header inside reader */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-100 font-extrabold tracking-tight drop-shadow-md">
              Khabar Cut Stories
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/web-stories')}
              className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Tap Zone */}
      <div onClick={handleTap} className="absolute inset-0 z-0 cursor-pointer" />

      {/* Left/Right desktop chevron controls */}
      <div className="absolute inset-y-0 left-2 z-10 hidden sm:flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={currentIdx === 0}
          className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white disabled:opacity-20 flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-2 z-10 hidden sm:flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom text details & Call to action */}
      <div className="relative z-10 p-6 space-y-5 text-center pointer-events-none">
        {activeSlide.text && (
          <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed drop-shadow-md tracking-tight whitespace-pre-line px-2">
            {activeSlide.text}
          </p>
        )}

        {/* CTA Swipe/Click link */}
        {activeSlide.link && (
          <div className="pointer-events-auto flex justify-center pt-2">
            <a
              href={activeSlide.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Learn More <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Slide Counter Footer info */}
        <p className="text-[9px] text-zinc-400 font-bold uppercase drop-shadow-sm">
          Slide {currentIdx + 1} of {slideCount}
        </p>
      </div>
    </div>
  );
}
