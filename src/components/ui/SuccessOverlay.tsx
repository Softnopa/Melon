"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

export function SuccessOverlay({
  show,
  message,
  onDone,
}: {
  show: boolean;
  message: string;
  onDone: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-6"
          onAnimationComplete={() => {
            if (show) setTimeout(onDone, 1400);
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="relative w-full max-w-xs rounded-3xl bg-white p-8 text-center shadow-card"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-melon-100"
            >
              <CheckCircle2 className="h-12 w-12 text-melon-600" strokeWidth={2} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold text-ink"
            >
              {message}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-1 text-sm text-ink/50"
            >
              Saved successfully
            </motion.p>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: Math.cos((i / 5) * Math.PI * 2) * 60,
                  y: Math.sin((i / 5) * Math.PI * 2) * 60,
                }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.8 }}
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2"
              >
                <Sparkles className="h-4 w-4 text-melon-400" />
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
