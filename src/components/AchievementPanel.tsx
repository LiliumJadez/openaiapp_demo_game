import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Achievement, AchievementCategory } from '@/types';

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; icon: string; color: string }> = {
  collection: { label: '收集', icon: '🐟', color: 'text-blue-400' },
  karma: { label: '业力', icon: '⚖️', color: 'text-purple-400' },
  exploration: { label: '探索', icon: '🌊', color: 'text-teal-400' },
  special: { label: '特殊', icon: '✨', color: 'text-amber-400' },
};

export function AchievementPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const achievements = useGameStore((state) => state.achievements);
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <>
      {/* 成就按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="absolute top-36 right-4 z-20 w-14 h-14 rounded-full glass 
                   flex items-center justify-center text-2xl
                   border border-abyss-400/30 hover:border-abyss-400/50 transition-colors"
      >
        <span>🏆</span>
        {unlockedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full 
                          bg-karma-gluttony text-xs font-bold flex items-center justify-center">
            {unlockedCount}
          </span>
        )}
      </motion.button>

      {/* 成就面板 */}
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-full max-w-lg glass-dark"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="p-4 border-b border-abyss-600/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h2 className="text-lg font-title font-bold text-abyss-100">
                        成就
                      </h2>
                      <p className="text-sm text-abyss-400">
                        {unlockedCount} / {totalCount} 已解锁
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

                {/* 进度条 */}
                <div className="h-2 bg-abyss-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                    className="h-full bg-gradient-to-r from-karma-gluttony via-karma-greed to-karma-mercy"
                  />
                </div>

                {/* 分类筛选 */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  <CategoryButton
                    active={selectedCategory === 'all'}
                    onClick={() => setSelectedCategory('all')}
                    icon="🎯"
                    label="全部"
                  />
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <CategoryButton
                      key={key}
                      active={selectedCategory === key}
                      onClick={() => setSelectedCategory(key as AchievementCategory)}
                      icon={config.icon}
                      label={config.label}
                    />
                  ))}
                </div>
              </div>

              {/* 成就列表 */}
              <div className="p-4 overflow-y-auto h-[calc(100%-180px)]">
                <div className="space-y-3">
                  {filteredAchievements.map((achievement, index) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={unlockedAchievements.includes(achievement.id)}
                      delay={index * 0.03}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CategoryButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-2 transition-all
        ${active 
          ? 'bg-abyss-600 text-abyss-100 border-abyss-400' 
          : 'glass text-abyss-400 hover:text-abyss-200 border-transparent'
        } border`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function AchievementCard({
  achievement,
  isUnlocked,
  delay,
}: {
  achievement: Achievement;
  isUnlocked: boolean;
  delay: number;
}) {
  const categoryConfig = CATEGORY_CONFIG[achievement.category];

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className={`p-4 rounded-xl transition-all relative overflow-hidden
        ${isUnlocked 
          ? 'glass border border-abyss-500/30' 
          : 'bg-abyss-900/50 border border-abyss-800/30 opacity-60'
        }`}
    >
      {/* 解锁闪光效果 */}
      {isUnlocked && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      )}

      <div className="flex items-start gap-4 relative z-10">
        {/* 图标 */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
          ${isUnlocked ? 'bg-abyss-700/50' : 'bg-abyss-900/50'}`}
        >
          {isUnlocked ? achievement.icon : '🔒'}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-title font-bold truncate
              ${isUnlocked ? 'text-abyss-100' : 'text-abyss-500'}`}
            >
              {achievement.name}
            </h3>
            <span className={`text-xs ${categoryConfig.color}`}>
              {categoryConfig.icon}
            </span>
          </div>
          <p className={`text-sm ${isUnlocked ? 'text-abyss-300' : 'text-abyss-600'}`}>
            {achievement.description}
          </p>
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-abyss-500 mt-2">
              解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>

        {/* 状态 */}
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl"
          >
            ✅
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

