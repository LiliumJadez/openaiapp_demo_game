import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Fish } from '@/types';

interface ReleaseStoryPanelProps {
  fish: Fish | null;
  onClose: () => void;
}

export function ReleaseStoryPanel({ fish, onClose }: ReleaseStoryPanelProps) {
  if (!fish) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass-dark rounded-2xl p-8 max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 标题 */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl">🕊️</span>
              <h2 className="text-2xl font-title text-abyss-100">
                {fish.name}的故事
              </h2>
              <span className="text-3xl">🕊️</span>
            </div>
            <p className="text-sm text-abyss-400 italic">
              你放生了它，聆听了它的过往...
            </p>
          </motion.div>

          {/* 故事内容 */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* 故事背景 */}
            <div className="glass rounded-xl p-5 border border-abyss-600/30">
              <p className="text-base leading-relaxed text-abyss-100 font-mystical whitespace-pre-wrap">
                {fish.loreFragment}
              </p>
            </div>

            {/* 情报 */}
            {fish.attributes.intel && (
              <div className="glass rounded-xl p-4 border border-purple-500/20 bg-purple-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔮</span>
                  <span className="text-sm font-bold text-purple-300">获得情报</span>
                </div>
                <p className="text-sm text-purple-200/80 italic">
                  {fish.attributes.intel}
                </p>
              </div>
            )}
          </motion.div>

          {/* 关闭按钮 */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-800 
                      text-white font-bold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
          >
            愿你安息 🙏
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

