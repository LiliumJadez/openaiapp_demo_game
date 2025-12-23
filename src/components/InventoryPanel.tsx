import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Fish, FishRarity } from '@/types';

// 稀有度颜色
const RARITY_COLORS: Record<FishRarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
  mythical: '#ec4899',
};

const RARITY_NAMES: Record<FishRarity, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '珍稀',
  epic: '史诗',
  legendary: '传说',
  mythical: '神话',
};

export function InventoryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [showConfirm, setShowConfirm] = useState<'consume' | 'release' | null>(null);
  
  const inventory = useGameStore((s) => s.inventory);
  const consumeFromInventory = useGameStore((s) => s.consumeFromInventory);
  const releaseFromInventory = useGameStore((s) => s.releaseFromInventory);

  const handleAction = (action: 'consume' | 'release') => {
    if (!selectedFish) return;
    
    if (action === 'consume') {
      consumeFromInventory(selectedFish.id);
    } else {
      releaseFromInventory(selectedFish.id);
    }
    
    setSelectedFish(null);
    setShowConfirm(null);
  };

  const isOverflow = inventory.fish.length > inventory.maxCapacity;

  return (
    <>
      {/* 背包按钮 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-40 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all hover:scale-105 ${
          isOverflow 
            ? 'bg-red-500/30 border-red-400 animate-pulse' 
            : 'bg-abyss-800/80 border-abyss-600 hover:bg-abyss-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎒</span>
          <div className="text-left">
            <div className="text-sm font-bold text-abyss-100">
              背包
            </div>
            <div className={`text-xs ${isOverflow ? 'text-red-400' : 'text-abyss-400'}`}>
              {inventory.fish.length}/{inventory.maxCapacity}
              {isOverflow && ` (+${inventory.fish.length - inventory.maxCapacity})`}
            </div>
          </div>
        </div>
        
        {/* 超额警告 */}
        {isOverflow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
          >
            {inventory.overflowRounds}/3
          </motion.div>
        )}
      </motion.button>

      {/* 背包面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl max-h-[80vh] overflow-hidden rounded-xl bg-gradient-to-br from-abyss-800 to-abyss-900 shadow-2xl border border-abyss-600"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-abyss-600">
                <div>
                  <h2 className="text-2xl font-title font-bold text-abyss-100">
                    🎒 收藏背包
                  </h2>
                  <p className="text-sm text-abyss-400">
                    容量: {inventory.fish.length}/{inventory.maxCapacity}
                    {isOverflow && (
                      <span className="text-red-400 ml-2">
                        ⚠️ 超额 {inventory.overflowRounds}/3 回合
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-abyss-400 hover:text-abyss-200 transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 背包内容 */}
              <div className="p-6 overflow-y-auto max-h-[55vh]">
                {inventory.fish.length === 0 ? (
                  <div className="text-center py-12 text-abyss-400">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p>背包空空如也</p>
                    <p className="text-sm mt-2">选择「收藏」来保存捕获的生物</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {inventory.fish.map((fish, index) => (
                      <motion.div
                        key={fish.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedFish(fish)}
                        className={`relative p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          selectedFish?.id === fish.id
                            ? 'border-blue-400 bg-abyss-600'
                            : 'border-abyss-600 bg-abyss-700/50 hover:bg-abyss-700'
                        }`}
                        style={{
                          boxShadow: selectedFish?.id === fish.id 
                            ? `0 0 15px ${RARITY_COLORS[fish.rarity]}40`
                            : undefined,
                        }}
                      >
                        {/* 超额标记 */}
                        {index >= inventory.maxCapacity && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            超额
                          </div>
                        )}

                        {/* 鱼图片或图标 */}
                        <div className="aspect-square mb-2 rounded-lg bg-abyss-800 flex items-center justify-center overflow-hidden">
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

                        {/* 鱼名和稀有度 */}
                        <div className="text-center">
                          <div className="font-bold text-abyss-100 text-sm truncate">
                            {fish.name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: RARITY_COLORS[fish.rarity] }}
                          >
                            {RARITY_NAMES[fish.rarity]}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* 选中鱼的操作 */}
              <AnimatePresence>
                {selectedFish && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="border-t border-abyss-600 p-4 bg-abyss-800/90"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${RARITY_COLORS[selectedFish.rarity]}20` }}
                      >
                        {selectedFish.imageUrl ? (
                          <img
                            src={selectedFish.imageUrl}
                            alt={selectedFish.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          '🐟'
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-abyss-100">{selectedFish.name}</div>
                        <div className="text-sm text-abyss-300 line-clamp-2">
                          {selectedFish.dialogue}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirm('consume')}
                        className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                      >
                        🍖 消化 (+{selectedFish.attributes.hunger}体力)
                      </button>
                      <button
                        onClick={() => setShowConfirm('release')}
                        className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors"
                      >
                        🕊️ 放生
                      </button>
                      <button
                        onClick={() => setSelectedFish(null)}
                        className="px-4 py-2 bg-abyss-700 hover:bg-abyss-600 text-abyss-300 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 确认对话框 */}
            <AnimatePresence>
              {showConfirm && selectedFish && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
                  onClick={() => setShowConfirm(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="p-6 bg-abyss-800 rounded-xl shadow-2xl border border-abyss-600 max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-abyss-100 mb-4">
                      {showConfirm === 'consume' ? '确认消化？' : '确认放生？'}
                    </h3>
                    <p className="text-abyss-300 mb-6">
                      {showConfirm === 'consume' 
                        ? `将「${selectedFish.name}」消化，恢复${selectedFish.attributes.hunger}点体力。此操作不可撤销。`
                        : `将「${selectedFish.name}」放生，它将回归虚数海。此操作不可撤销。`
                      }
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirm(null)}
                        className="flex-1 px-4 py-2 bg-abyss-700 hover:bg-abyss-600 text-abyss-300 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleAction(showConfirm)}
                        className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                          showConfirm === 'consume'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        确认
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

