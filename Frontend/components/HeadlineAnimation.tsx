'use client';

import React, { useState, useEffect } from 'react';

interface HeadlineAnimationProps {
  phrases: string[];
  intervalDuration?: number;
  className?: string;
  variant?: 'word-stagger' | 'vertical-roll' | 'gradient-wave';
}

export default function HeadlineAnimation({
  phrases,
  intervalDuration = 3600,
  className = '',
  variant = 'word-stagger',
}: HeadlineAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (!phrases || phrases.length <= 1) return;

    const timer = setInterval(() => {
      // 1. Trigger exit animation
      setAnimationState('exit');

      // 2. Switch phrase & trigger enter animation
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
        setAnimationState('enter');
      }, 500); // matching exit duration
    }, intervalDuration);

    return () => clearInterval(timer);
  }, [phrases, intervalDuration]);

  const currentPhrase = phrases[currentIndex % (phrases.length || 1)] || '';
  const words = currentPhrase.split(' ');

  // VARIANT 1: Word-by-Word Staggered Fade & Slide (Apple Style)
  if (variant === 'word-stagger') {
    return (
      <div className={`inline-block relative ${className}`}>
        <div className="flex flex-wrap gap-x-[0.28em] gap-y-1 items-baseline">
          {words.map((word, wIdx) => {
            const isExiting = animationState === 'exit';
            const delayMs = isExiting ? (words.length - 1 - wIdx) * 35 : wIdx * 65;

            return (
              <span
                key={`${currentIndex}-${wIdx}-${word}`}
                className="inline-block transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
                style={{
                  transitionDelay: `${delayMs}ms`,
                  opacity: isExiting ? 0 : 1,
                  transform: isExiting
                    ? 'translateY(-12px) scale(0.96)'
                    : 'translateY(0px) scale(1)',
                  filter: isExiting ? 'blur(4px)' : 'blur(0px)',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // VARIANT 2: Vertical Roll (Vercel 3D Slot Cylinder)
  if (variant === 'vertical-roll') {
    const isExiting = animationState === 'exit';
    return (
      <div className={`inline-block relative overflow-hidden py-1 ${className}`}>
        <div
          className="transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
          style={{
            opacity: isExiting ? 0 : 1,
            transform: isExiting
              ? 'translateY(-100%) scale(0.95)'
              : 'translateY(0%) scale(1)',
            filter: isExiting ? 'blur(6px)' : 'blur(0px)',
          }}
        >
          {currentPhrase}
        </div>
      </div>
    );
  }

  // VARIANT 3: Gradient Wave & Morph
  const isExiting = animationState === 'exit';
  return (
    <div className={`inline-block relative ${className}`}>
      <span
        className="inline-block bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent transition-all duration-600 ease-out transform"
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting ? 'scale(0.97) translateY(-8px)' : 'scale(1) translateY(0)',
          filter: isExiting ? 'blur(8px)' : 'blur(0px)',
        }}
      >
        {currentPhrase}
      </span>
    </div>
  );
}
