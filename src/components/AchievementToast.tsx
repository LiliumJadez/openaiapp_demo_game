import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Achievement } from '@/types';

interface ToastItem {
  id: string;
  achievement: Achievement;
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const achievements = useGameStore((s) => s.achievements);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const [prevUnlocked, setPrevUnlocked] = useState<string[]>([]);

  // 监听新解锁的成就
  useEffect(() => {
    const newlyUnlocked = unlockedAchievements.filter(
      (id) => !prevUnlocked.includes(id)
    );

    if (newlyUnlocked.length > 0) {
      const newToasts = newlyUnlocked.map((id) => {
        const achievement = achievements.find((a) => a.id === id);
        return achievement
          ? { id: `${id}-${Date.now()}`, achievement }
          : null;
      }).filter(Boolean) as ToastItem[];

      setToasts((prev) => [...prev, ...newToasts]);
    }

    setPrevUnlocked(unlockedAchievements);
  }, [unlockedAchievements, achievements, prevUnlocked]);

  // 自动移除toast - 5秒后开始渐隐
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 5000); // 5秒显示时间

    return () => clearTimeout(timer);
  }, [toasts]);

  // 成就类别颜色
  const categoryColors: Record<string, string> = {
    collection: 'from-blue-500 to-cyan-500',
    karma: 'from-purple-500 to-pink-500',
    exploration: 'from-green-500 to-emerald-500',
    special: 'from-yellow-500 to-orange-500',
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.5 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 300,
              delay: index * 0.1,
              exit: { duration: 0.5 } // 更慢的退出动画
            }}
            className="pointer-events-auto"
          >
            <div className={`
              relative overflow-hidden rounded-xl shadow-2xl
              bg-gradient-to-r ${categoryColors[toast.achievement.category] || categoryColors.special}
              p-[2px]
            `}>
              <div className="bg-abyss-900/95 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 relative">
                {/* 图标 */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="text-4xl"
                >
                  {toast.achievement.generatedIconUrl ? (
                    <img 
                      src={toast.achievement.generatedIconUrl} 
                      alt={toast.achievement.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  ) : (
                    toast.achievement.icon
                  )}
                </motion.div>

                {/* 文字内容 */}
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-abyss-400 uppercase tracking-wider"
                  >
                    🏆 成就解锁
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-bold text-white"
                  >
                    {toast.achievement.name}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-abyss-300"
                  >
                    {toast.achievement.description}
                  </motion.div>
                </div>

                {/* 闪光效果 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                
                {/* 消失倒计时进度条 */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

