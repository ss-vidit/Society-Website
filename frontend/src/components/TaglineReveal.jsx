import { useEffect, useRef, useState } from 'react';

export default function TaglineReveal({ lines }) {
  const rootRef = useRef(null);
  const [visibleWords, setVisibleWords] = useState(() => new Set());
  const words = lines.flatMap((line, lineIndex) =>
    line.split(/\s+/).map((word, wordIndex) => ({
      key: `${lineIndex}-${wordIndex}`,
      word,
      lineIndex
    }))
  ).map((word, sequence) => ({ ...word, sequence }));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setVisibleWords(new Set(words.map(({ key }) => key)));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      setVisibleWords((current) => {
        const next = new Set(current);
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            next.add(entry.target.dataset.wordKey);
            observer.unobserve(entry.target);
          }
        });
        return next;
      });
    }, { rootMargin: '0px 0px -24% 0px', threshold: 0.1 });

    root.querySelectorAll('[data-word-key]').forEach((word) => observer.observe(word));
    return () => observer.disconnect();
  }, [lines]);

  return (
    <h2 ref={rootRef} aria-label={lines.join(' ')} className="max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
        {words.filter((word) => word.lineIndex === lineIndex).map(({ key, word, sequence }) => (
            <span
              key={key}
              data-word-key={key}
              aria-hidden="true"
              style={{ transitionDelay: visibleWords.has(key) ? `${Math.min(sequence * 36, 400)}ms` : '0ms' }}
              className={`tagline-word mr-2 inline-block ${visibleWords.has(key) ? 'is-visible' : ''}`}
            >
              {word}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
