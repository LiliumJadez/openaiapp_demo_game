import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { FishCard } from './FishCard';
import type { Fish } from '@/types';

export function CollectionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const collection = useGameStore((state) => state.collection);

  if (collection.length === 0) return null;

  return (
    <>
      {/* 收藏按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-20 w-14 h-14 rounded-full glass 
                   flex items-center justify-center text-2xl
                   border border-abyss-400/30 hover:border-abyss-400/50 transition-colors"
      >
        <span>📚</span>
        {/* 数量徽章 */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full 
                        bg-karma-greed text-xs font-bold flex items-center justify-center">
          {collection.length}
        </span>
      </motion.button>

      {/* 收藏面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md glass-dark"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="p-4 border-b border-abyss-600/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h2 className="text-lg font-title font-bold text-abyss-100">
                      我的收藏
                    </h2>
                    <p className="text-sm text-abyss-400">
                      {collection.length} 条生物
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-abyss-700/50 
                            flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 列表 */}
              <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
                <div className="space-y-3">
                  {collection.map((fish, index) => (
                    <motion.div
                      key={fish.id}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedFish(fish)}
                      className="p-4 rounded-xl glass cursor-pointer hover:bg-abyss-700/30 
                                transition-colors border border-transparent hover:border-abyss-500/30"
                    >
                      <div className="flex items-center gap-4">
                        {/* 缩略图 */}
                        <div className="w-16 h-16 rounded-lg bg-abyss-800 flex items-center justify-center overflow-hidden">
                          {fish.imageUrl ? (
                            <img 
                              src={fish.imageUrl} 
                              alt={fish.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🐟</span>
                          )}
                        </div>
                        
                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-title font-bold text-abyss-100 truncate">
                            {fish.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <RarityBadge rarity={fish.rarity} />
                            <span className="text-xs text-abyss-400">
                              💰 {fish.attributes.value}
                            </span>
                          </div>
                        </div>
                        
                        <span className="text-abyss-500">→</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedFish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm 
                      flex items-center justify-center p-8"
            onClick={() => setSelectedFish(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FishCard fish={selectedFish} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFish(null)}
                className="mt-4 w-full py-3 rounded-xl glass text-abyss-200 hover:text-abyss-100"
              >
                关闭
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 稀有度徽章
function RarityBadge({ rarity }: { rarity: string }) {
  const config: Record<string, { label: string; color: string }> = {
    common: { label: '普通', color: 'bg-gray-600' },
    uncommon: { label: '稀有', color: 'bg-green-600' },
    rare: { label: '珍稀', color: 'bg-blue-600' },
    epic: { label: '史诗', color: 'bg-purple-600' },
    legendary: { label: '传说', color: 'bg-amber-600' },
    mythical: { label: '神话', color: 'bg-rose-600' },
  };

  const { label, color } = config[rarity] || config.common;

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${color} text-white`}>
      {label}
    </span>
  );
}

