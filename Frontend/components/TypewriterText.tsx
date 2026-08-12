'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
  loop?: boolean;
}

export default function TypewriterText({
  phrases,
  typingSpeed = 55,
  deletingSpeed = 30,
  pauseDuration = 2500,
  className = '',
  cursorClassName = 'bg-[#1D4ED8]',
  loop = true,
}: TypewriterTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex % phrases.length];

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        if (phrases.length > 1 || loop) {
          setIsDeleting(true);
        }
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        const timer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Finished typing current phrase
        if (phrases.length === 1 && !loop) {
          return; // Stay completely typed
        }
        setIsPaused(true);
      }
    } else {
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Finished deleting current phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [charIndex, isDeleting, isPaused, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, loop]);

  const currentPhrase = phrases[phraseIndex % phrases.length] || '';
  const displayedText = currentPhrase.slice(0, charIndex);

  return (
    <span className={`inline-block ${className}`}>
      <span>{displayedText}</span>
      <span
        className={`inline-block w-[3px] h-[0.82em] ml-1 rounded-full align-middle animate-pulse ${cursorClassName}`}
        style={{ animationDuration: '0.75s' }}
        aria-hidden="true"
      />
    </span>
  );
}
