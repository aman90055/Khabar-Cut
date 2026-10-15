"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Share2 } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
  text_content: string;
  position: number;
}

interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string;
  web_story_slides: Slide[];
}

export default function WebStoryViewer({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [story, setStory] = useState<WebStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const SLIDE_DURATION = 5000; // 5 seconds per slide

  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch(`/api/web-stories?slug=${resolvedParams.slug}`);
        if (res.ok) {
          const data = await res.json();
          setStory(data);
        }
      } catch (error) {
        console.error("Failed to fetch story", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
  }, [resolvedParams.slug]);

  const nextSlide = useCallback(() => {
    if (!story) return;
    if (currentSlideIndex < story.web_story_slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      router.back();
    }
  }, [story, currentSlideIndex, router]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentSlideIndex]);

  useEffect(() => {
    if (!story || story.web_story_slides.length === 0) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / (SLIDE_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [story, currentSlideIndex, nextSlide]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!story || !story.web_story_slides || story.web_story_slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
        <p>Story not found or has no slides.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition">
          Go Back
        </button>
      </div>
    );
  }

  const slides = story.web_story_slides;
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex justify-center items-center overflow-hidden">
      {/* Desktop wrapper to constrain width */}
      <div className="relative w-full h-full sm:w-[400px] sm:h-[800px] sm:max-h-[95vh] sm:rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out scale-105"
          style={{ backgroundImage: `url(${currentSlide.image_url})` }}
        >
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        </div>

        {/* Top Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-6 sm:pt-4 z-20 flex gap-1.5">
          {slides.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{ 
                  width: idx === currentSlideIndex 
                    ? `${progress}%` 
                    : idx < currentSlideIndex 
                      ? "100%" 
                      : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header (Title and Close button) */}
        <div className="absolute top-8 sm:top-6 left-0 right-0 p-4 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-3 drop-shadow-md">
            {story.cover_image_url && (
              <img src={story.cover_image_url} alt="Cover" className="w-8 h-8 rounded-full border border-white/50 object-cover" />
            )}
            <span className="font-semibold text-sm line-clamp-1">{story.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-colors" title="Share">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => router.back()} className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-colors" title="Close">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tap Areas for Navigation */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={prevSlide} />
        <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={nextSlide} />

        {/* Desktop Navigation Arrows (hidden on mobile) */}
        <button 
          onClick={prevSlide}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center z-20 text-white transition-colors"
          disabled={currentSlideIndex === 0}
          style={{ opacity: currentSlideIndex === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center z-20 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Area (Glassmorphism card) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pb-12 sm:pb-8">
          {currentSlide.text_content && (
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transform transition-all duration-500 translate-y-0 opacity-100">
              <p className="text-white text-lg font-medium leading-relaxed drop-shadow-md">
                {currentSlide.text_content}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
