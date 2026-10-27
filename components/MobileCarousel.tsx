'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface MobileCarouselProps {
  items: React.ReactNode[];
  autoPlayInterval?: number;
  className?: string;
  minHeightClass?: string;
}

export default function MobileCarousel({
  items,
  autoPlayInterval = 4000,
  className = '',
  minHeightClass = '',
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  // Safeguard if items count changes dynamically (e.g., active tab filter)
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((curr) => (curr === 0 ? items.length - 1 : curr - 1));
  }, [items.length]);

  const next = useCallback(() => {
    setCurrentIndex((curr) => (curr + 1) % items.length);
  }, [items.length]);

  // Auto-play timer (4 seconds default)
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      next();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [items.length, isPaused, autoPlayInterval, next]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = touchStartX.current - currentX;
    const diffY = touchStartY.current !== null ? Math.abs(touchStartY.current - currentY) : 0;
    
    // If predominantly horizontal, track delta
    if (Math.abs(diffX) > diffY) {
      touchDeltaX.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const threshold = 40; // minimum swipe distance in pixels
    if (Math.abs(touchDeltaX.current) > threshold) {
      if (touchDeltaX.current > 0) {
        // Swiped left -> next
        next();
      } else {
        // Swiped right -> prev
        prev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchDeltaX.current = 0;
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Viewport */}
      <div
        className="relative w-full overflow-hidden rounded-2xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`w-full shrink-0 px-1 flex flex-col justify-stretch ${minHeightClass}`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Floating Navigation Arrows (< & >) */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Slide sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center border border-slate-200/90 dark:border-slate-700/90 active:scale-95 transition-all hover:bg-white dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Slide berikutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-md flex items-center justify-center border border-slate-200/90 dark:border-slate-700/90 active:scale-95 transition-all hover:bg-white dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Capsule Dots */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Buka slide ${idx + 1}`}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-7 bg-blue-600 dark:bg-blue-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
