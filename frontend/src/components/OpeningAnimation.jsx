import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpeningAnimation({ onComplete }) {
  const [visible, setVisible] = useState(true);

  // Generate floating binary particles (0s and 1s) matching the Binary Boppers logo
  const particles = useMemo(() => {
    return Array.from({ length: 34 }, (_, idx) => ({
      id: idx,
      digit: idx % 2 === 0 ? '1' : '0',
      left: `${(idx * 29) % 96 + 2}%`,
      top: `${(idx * 41) % 90 + 5}%`,
      delay: (idx % 7) * 0.14,
      size: idx % 3 === 0 ? 'text-2xl' : idx % 2 === 0 ? 'text-lg' : 'text-sm'
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onComplete?.(), 500);
    }, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black"
        >
          {/* Radial golden spotlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.45, scale: 1.25 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-amber-600/40 via-orange-500/20 to-yellow-400/30 blur-3xl"
          />

          {/* Floating binary 0s and 1s */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: [0, 0.7, 0.25, 0],
                  y: [24, -18, -42]
                }}
                transition={{
                  duration: 2.6,
                  delay: p.delay,
                  ease: 'easeOut'
                }}
                style={{ left: p.left, top: p.top }}
                className={`absolute font-mono font-bold text-amber-400/70 ${p.size}`}
              >
                {p.digit}
              </motion.span>
            ))}
          </div>

          {/* Rotating golden ring + Logo reveal */}
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ rotate: 0, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 360, scale: 1.08, opacity: 1 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute h-60 w-60 rounded-full border-2 border-dashed border-amber-400/60 shadow-[0_0_50px_rgba(245,158,11,0.35)] sm:h-72 sm:w-72"
            />
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.95, delay: 0.2, type: 'spring', stiffness: 120 }}
              className="relative z-10 h-48 w-48 overflow-hidden rounded-full border-4 border-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.45)] sm:h-56 sm:w-56"
            >
              <img
                src="/logo.jpg"
                alt="Binary Boppers Logo"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>

          {/* Title & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="relative z-10 mt-8 text-center"
          >
            <h1 className="font-display bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 bg-clip-text text-3xl font-extrabold tracking-[0.25em] text-transparent sm:text-5xl">
              BINARY BOPPERS
            </h1>
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.35em' }}
              transition={{ duration: 0.8, delay: 1.35 }}
              className="mt-2 text-xs font-medium uppercase text-amber-300/80 sm:text-sm"
            >
              Rhythm • Code • Motion
            </motion.p>
          </motion.div>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 rounded-full border border-amber-500/40 bg-black/60 px-4 py-1.5 text-xs font-medium text-amber-300 backdrop-blur transition hover:border-amber-400 hover:bg-amber-500/10"
          >
            Skip Intro →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
