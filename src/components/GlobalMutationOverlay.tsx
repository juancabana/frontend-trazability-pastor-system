import { useMutationState } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';

export function GlobalMutationOverlay() {
  const pending = useMutationState({ filters: { status: 'pending' } });
  const isVisible = pending.length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
          aria-live="polite"
          aria-label="Procesando solicitud"
        >
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/15" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-teal-400 animate-spin [animation-duration:600ms] [animation-direction:reverse]" />
            </div>
            {/* Label */}
            <p className="text-white text-sm font-medium tracking-wide select-none">
              Procesando...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
