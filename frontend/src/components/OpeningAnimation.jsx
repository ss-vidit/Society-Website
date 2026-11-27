import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function OpeningAnimation({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();
  const completed = useRef(false);
  const completionTimer = useRef(null);
  const onCompleteRef = useRef(onComplete);

  const particles = useMemo(() => Array.from({ length: 34 }, (_, index) => ({
    id: index,
    digit: index % 2 === 0 ? '1' : '0',
    left: `${(index * 29) % 96 + 2}%`,
    top: `${(index * 41) % 90 + 5}%`,
    delay: (index % 7) * 0.14,
    size: index % 3 === 0 ? 'text-2xl' : index % 2 === 0 ? 'text-lg' : 'text-sm'
  })), []);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    setVisible(false);
    completionTimer.current = window.setTimeout(() => onCompleteRef.current?.(), 450);
  };

  useEffect(() => {
    const timer = window.setTimeout(finish, reduceMotion ? 1000 : 3200);
    return () => {
      window.clearTimeout(timer);
      if (completionTimer.current) window.clearTimeout(completionTimer.current);
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black"
          aria-label="Binary Boppers introduction"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {!reduceMotion && particles.map((particle) => (
              <motion.span
                key={particle.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: [0, 0.62, 0.24, 0], y: [24, -18, -42] }}
                transition={{ duration: 2.6, delay: particle.delay, ease: [0.22, 1, 0.36, 1] }}
                style={{ left: particle.left, top: particle.top }}
                className={`absolute font-mono font-semibold text-amber-400/70 ${particle.size}`}
              >
                {particle.digit}
              </motion.span>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            {!reduceMotion && (
              <motion.div
                initial={{ rotate: 0, scale: 0.72, opacity: 0 }}
                animate={{ rotate: 360, scale: 1, opacity: 1 }}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute h-52 w-52 rounded-full border border-dashed border-amber-400/65 sm:h-60 sm:w-60"
                aria-hidden="true"
              />
            )}
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { scale: 0.72, opacity: 0, rotate: -8 }}
              animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 h-40 w-40 overflow-hidden rounded-full border-2 border-amber-400/80 sm:h-48 sm:w-48"
            >
              <img src="/logo.jpg" alt="Binary Boppers" className="h-full w-full object-cover" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-8 text-center"
          >
            <h1 className="font-display text-2xl font-semibold tracking-[0.02em] text-white sm:text-3xl">
              BINARY BOPPERS
            </h1>
            <p className="mt-2 flex justify-center gap-2 text-xs font-medium text-zinc-300 sm:text-sm">
              <span>CODE.</span>
              <span className="text-amber-400">DANCE.</span>
              <span>CREATE.</span>
            </p>
          </motion.div>

          <button
            type="button"
            onClick={finish}
            className="absolute bottom-6 right-6 rounded-md border border-white/20 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-white"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
