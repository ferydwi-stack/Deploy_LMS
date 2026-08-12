'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
  loop?: boolean;
  /**
   * Mode:
   * - 'smooth-typewriter': Snappy natural typing + seamless fade-slide out transition (Recommended)
   * - 'fade-slide': Full phrase cross-fade & slide morph animation
   * - 'classic': Traditional character-by-character delete & type
   */
  mode?: 'smooth-typewriter' | 'fade-slide' | 'classic';
}

export default function TypewriterText({
  phrases,
  typingSpeed = 50,
  deletingSpeed = 25,
  pauseDuration = 3000,
  className = '',
  cursorClassName = 'bg-[#1D4ED8]',
  loop = true,
  mode = 'smooth-typewriter',
}: TypewriterTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fade-slide state
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // --- MODE 1: Smooth Typewriter (Natural typing + smooth phrase morph fade out) ---
  useEffect(() => {
    if (!phrases || phrases.length === 0) return;
    if (mode === 'fade-slide') return; // Handled separately

    const currentPhrase = phrases[phraseIndex % phrases.length];

    if (isTransitioning) {
      // Smooth fade-slide out transition before starting next phrase
      setFadeState('out');
      timerRef.current = setTimeout(() => {
        setCharIndex(0);
        setIsTransitioning(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setFadeState('in');
      }, 350); // 350ms matching CSS transition
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    if (isPaused) {
      timerRef.current = setTimeout(() => {
        setIsPaused(false);
        if (phrases.length > 1 || loop) {
          if (mode === 'smooth-typewriter') {
            // Smoothly morph to next phrase via fade-slide
            setIsTransitioning(true);
          } else {
            // Classic mode deletes character by character
            setIsDeleting(true);
          }
        }
      }, pauseDuration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        // Precise typing rhythm: slight pause at punctuation for realism
        const nextChar = currentPhrase[charIndex];
        let delay = typingSpeed;

        if (['.', ',', '!', '?', ':'].includes(nextChar)) {
          delay += 200; // brief pause on punctuation
        }

        timerRef.current = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, delay);
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      } else {
        // Finished typing phrase
        if (phrases.length === 1 && !loop) return;
        setIsPaused(true);
      }
    } else {
      // Classic mode character deletion
      if (charIndex > 0) {
        timerRef.current = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, deletingSpeed);
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [charIndex, isDeleting, isPaused, isTransitioning, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, loop, mode]);

  // --- MODE 2: Full Fade-Slide Phrase Morph ---
  useEffect(() => {
    if (mode !== 'fade-slide' || !phrases || phrases.length === 0) return;

    const interval = setTimeout(() => {
      setFadeState('out');
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setFadeState('in');
      }, 400);
    }, pauseDuration);

    return () => clearTimeout(interval);
  }, [phraseIndex, phrases, pauseDuration, mode]);

  const currentPhrase = phrases[phraseIndex % phrases.length] || '';
  const displayedText = mode === 'fade-slide' ? currentPhrase : currentPhrase.slice(0, charIndex);

  return (
    <span
      className={`inline-block relative transition-[opacity,transform,filter] duration-350 ease-out ${
        fadeState === 'out'
          ? 'opacity-0 -translate-y-2 blur-[2px]'
          : 'opacity-100 translate-y-0 blur-0'
      } ${className}`}
    >
      <span className="inline">{displayedText}</span>

      {/* Smooth Caret Cursor - strictly synchronized with typed characters */}
      {mode !== 'fade-slide' && (
        <span
          className={`inline-block w-[3.5px] h-[0.82em] ml-1 rounded-full align-middle ${cursorClassName} ${
            isPaused ? 'animate-pulse' : 'opacity-100'
          }`}
          style={{
            boxShadow: '0 0 10px rgba(37, 99, 235, 0.6)',
          }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
