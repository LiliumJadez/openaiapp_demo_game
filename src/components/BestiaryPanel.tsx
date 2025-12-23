import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { BestiaryEntry, FishRarity, WeatherType } from '@/types';

export function BestiaryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BestiaryEntry | null>(null);
  const bestiary = useGameStore((state) => state.bestiary);

  return (
    <>
      {/* 图鉴按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="absolute top-20 right-4 z-20 w-14 h-14 rounded-full glass 
                   flex items-center justify-center text-2xl
                   border border-abyss-400/30 hover:border-abyss-400/50 transition-colors"
      >
        <span>📖</span>
        {bestiary.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full 
                          bg-karma-mercy text-xs font-bold flex items-center justify-center">
            {bestiary.length}
          </span>
        )}
      </motion.button>

      {/* 图鉴面板 */}
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 right-0 bottom-0 top-16 glass-dark rounded-t-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="p-4 border-b border-abyss-600/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <h2 className="text-lg font-title font-bold text-abyss-100">
                      虚数生物图鉴
                    </h2>
                    <p className="text-sm text-abyss-400">
                      已发现 {bestiary.length} 种生物
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

              {/* 图鉴网格 */}
              <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
                {bestiary.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-abyss-400">
                    <span className="text-6xl mb-4">🐟</span>
                    <p>尚未发现任何生物</p>
                    <p className="text-sm mt-2">开始垂钓来填充你的图鉴吧！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {bestiary.map((entry, index) => (
                      <motion.div
                        key={entry.fishName}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedEntry(entry)}
                        className="aspect-square rounded-xl glass cursor-pointer 
                                  hover:bg-abyss-700/30 transition-all border border-transparent 
                                  hover:border-abyss-500/30 relative overflow-hidden group"
                      >
                        {/* 图片 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {entry.imageUrl ? (
                            <img 
                              src={entry.imageUrl} 
                              alt={entry.fishName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl opacity-50 group-hover:opacity-100 transition-opacity">
                              🐟
                            </span>
                          )}
                        </div>
                        
                        {/* 信息覆盖层 */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <h3 className="font-title font-bold text-abyss-100 text-sm truncate">
                            {entry.fishName}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-abyss-400">
                              ×{entry.catchCount}
                            </span>
                            {entry.rarities.map((rarity) => (
                              <RarityDot key={rarity} rarity={rarity} />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm 
                      flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md glass-dark rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 图片区 */}
              <div className="h-48 bg-abyss-900 flex items-center justify-center relative">
                {selectedEntry.imageUrl ? (
                  <img 
                    src={selectedEntry.imageUrl} 
                    alt={selectedEntry.fishName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl opacity-30">🐟</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-abyss-900 via-transparent to-transparent" />
              </div>
              
              {/* 信息区 */}
              <div className="p-6 -mt-8 relative z-10">
                <h2 className="text-2xl font-title font-bold text-abyss-100 mb-2">
                  {selectedEntry.fishName}
                </h2>
                
                {/* 统计 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full glass text-sm text-abyss-200">
                    捕获 {selectedEntry.catchCount} 次
                  </span>
                  {selectedEntry.rarities.map((rarity) => (
                    <RarityBadge key={rarity} rarity={rarity} />
                  ))}
                </div>
                
                {/* 发现天气 */}
                <div className="mb-4">
                  <h3 className="text-sm text-abyss-400 mb-2">出现天气</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.weathers.map((weather) => (
                      <WeatherBadge key={weather} weather={weather} />
                    ))}
                  </div>
                </div>
                
                {/* 故事 */}
                <div className="mb-4">
                  <h3 className="text-sm text-abyss-400 mb-2">图鉴记录</h3>
                  <p className="text-abyss-200 text-sm leading-relaxed italic">
                    "{selectedEntry.bestStory}"
                  </p>
                </div>
                
                {/* 时间 */}
                <div className="text-xs text-abyss-500">
                  首次发现：{new Date(selectedEntry.firstCaughtAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full py-4 text-abyss-300 hover:text-abyss-100 
                          border-t border-abyss-700/50 transition-colors"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 稀有度小圆点
function RarityDot({ rarity }: { rarity: FishRarity }) {
  const colors: Record<FishRarity, string> = {
    common: 'bg-gray-400',
    uncommon: 'bg-green-400',
    rare: 'bg-blue-400',
    epic: 'bg-purple-400',
    legendary: 'bg-amber-400',
    mythical: 'bg-rose-400',
  };
  
  return (
    <span className={`w-2 h-2 rounded-full ${colors[rarity]}`} />
  );
}

// 稀有度徽章
function RarityBadge({ rarity }: { rarity: FishRarity }) {
  const config: Record<FishRarity, { label: string; color: string }> = {
    common: { label: '普通', color: 'bg-gray-600' },
    uncommon: { label: '稀有', color: 'bg-green-600' },
    rare: { label: '珍稀', color: 'bg-blue-600' },
    epic: { label: '史诗', color: 'bg-purple-600' },
    legendary: { label: '传说', color: 'bg-amber-600' },
    mythical: { label: '神话', color: 'bg-rose-600' },
  };

  const { label, color } = config[rarity];

  return (
    <span className={`px-2 py-1 rounded text-xs ${color} text-white`}>
      {label}
    </span>
  );
}

// 天气徽章
function WeatherBadge({ weather }: { weather: WeatherType }) {
  const config: Record<WeatherType, { icon: string; name: string }> = {
    sunny: { icon: '☀️', name: '晴空' },
    bloodRain: { icon: '🩸', name: '血雨' },
    fog: { icon: '🌫️', name: '迷雾' },
    storm: { icon: '⛈️', name: '风暴' },
    aurora: { icon: '🌌', name: '极光' },
    eclipse: { icon: '🌑', name: '日蚀' },
    starfall: { icon: '💫', name: '星陨' },
  };

  const { icon, name } = config[weather];

  return (
    <span className="px-2 py-1 rounded glass text-xs text-abyss-200 flex items-center gap-1">
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );
}

