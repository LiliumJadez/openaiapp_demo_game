import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function ResultOverlay() {
  const phase = useGameStore((state) => state.phase);
  const logs = useGameStore((state) => state.logs);
  const setPhase = useGameStore((state) => state.setPhase);

  // 获取最近的选择日志
  const recentChoiceLog = logs.filter(l => l.type === 'choice').slice(-1)[0];

  // 自动关闭结果面板
  useEffect(() => {
    if (phase === 'result') {
      const timer = setTimeout(() => {
        setPhase('idle');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  if (phase !== 'result') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: 'spring', damping: 15 }}
          className="glass-dark rounded-2xl p-8 max-w-md text-center"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-5xl mb-4"
          >
            ✨
          </motion.div>
          
          <p className="text-lg font-title text-abyss-100 mb-4">
            {recentChoiceLog?.content || '抉择已做出'}
          </p>
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 2 }}
            className="h-1 bg-gradient-to-r from-transparent via-abyss-400 to-transparent rounded-full"
          />
          
          <p className="text-sm text-abyss-500 mt-4">
            继续你的旅程...
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

