'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
  loop?: boolean;
}

export default function TypewriterText({
  phrases,
  typingSpeed = 45,
  pauseDuration = 3200,
  className = '',
  cursorClassName = 'bg-[#1D4ED8]',
  loop = true,
}: TypewriterTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex % phrases.length];

    // 1. Paused after finishing phrase -> trigger smooth fade out
    if (isPaused) {
      timerRef.current = setTimeout(() => {
        setFadeState('out');

        // After 380ms fade-out transition completes, reset to next phrase
        timerRef.current = setTimeout(() => {
          setCharIndex(0);
          setIsPaused(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setFadeState('in');
        }, 380);
      }, pauseDuration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    // 2. Typing characters one by one with micro-pauses
    if (charIndex < currentPhrase.length) {
      const nextChar = currentPhrase[charIndex];
      let delay = typingSpeed;

      // Realistic human rhythm: pause slightly at spaces and punctuation
      if (nextChar === ' ') {
        delay += 35;
      } else if (['.', ',', '!', '?', ':'].includes(nextChar)) {
        delay += 180;
      }

      timerRef.current = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, delay);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      // Finished typing current phrase
      if (phrases.length === 1 && !loop) return;
      setIsPaused(true);
    }
  }, [charIndex, isPaused, phraseIndex, phrases, typingSpeed, pauseDuration, loop]);

  const currentPhrase = phrases[phraseIndex % phrases.length] || '';
  const displayedText = currentPhrase.slice(0, charIndex);

  return (
    <span
      className={`inline-block relative transition-[opacity,transform,filter] duration-380 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fadeState === 'out'
          ? 'opacity-0 -translate-y-2.5 blur-[3px]'
          : 'opacity-100 translate-y-0 blur-0'
      } ${className}`}
    >
      {/* Typed Characters */}
      <span className="inline tracking-tight">
        {displayedText}
      </span>

      {/* Ultra-Smooth Glowing Caret */}
      <span
        className={`inline-block w-[3.5px] h-[0.82em] ml-1 rounded-full align-middle ${cursorClassName} ${
          isPaused ? 'animate-pulse' : 'opacity-100'
        }`}
        style={{
          boxShadow: '0 0 10px rgba(29, 78, 216, 0.65)',
          transition: 'opacity 0.2s ease-in-out',
        }}
        aria-hidden="true"
      />
    </span>
  );
}
