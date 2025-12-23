import { motion } from 'framer-motion';
import type { Fish, FishRarity } from '@/types';

interface FishCardProps {
  fish: Fish;
  showDetails?: boolean;
  onClick?: () => void;
}

// 稀有度配置
const RARITY_CONFIG: Record<FishRarity, {
  label: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
}> = {
  common: {
    label: '普通',
    gradient: 'from-gray-600 to-gray-800',
    borderColor: 'border-gray-500',
    glowColor: 'rgba(107, 114, 128, 0.3)',
  },
  uncommon: {
    label: '稀有',
    gradient: 'from-green-600 to-green-900',
    borderColor: 'border-green-500',
    glowColor: 'rgba(34, 197, 94, 0.3)',
  },
  rare: {
    label: '珍稀',
    gradient: 'from-blue-500 to-blue-800',
    borderColor: 'border-blue-400',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  epic: {
    label: '史诗',
    gradient: 'from-purple-500 to-purple-900',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  legendary: {
    label: '传说',
    gradient: 'from-amber-400 to-orange-700',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
  mythical: {
    label: '神话',
    gradient: 'from-rose-400 via-purple-500 to-cyan-400',
    borderColor: 'border-rose-400',
    glowColor: 'rgba(244, 63, 94, 0.7)',
  },
};

export function FishCard({ fish, showDetails = true, onClick }: FishCardProps) {
  const config = RARITY_CONFIG[fish.rarity];

  return (
    <motion.div
      initial={{ scale: 0, rotateY: -180 }}
      animate={{ scale: 1, rotateY: 0 }}
      exit={{ scale: 0, rotateY: 180 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className={`relative w-72 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div
        className={`relative rounded-2xl overflow-hidden ${config.borderColor} border-2`}
        style={{
          boxShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
        }}
      >
        {/* 背景渐变 */}
        <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient} opacity-90`} />
        
        {/* 装饰纹理 */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="card-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
              </pattern>
            </defs>
            <rect fill="url(#card-pattern)" width="100" height="100" />
          </svg>
        </div>

        {/* 内容 */}
        <div className="relative p-4 space-y-3">
          {/* 头部：名称和稀有度 */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-xl font-title font-bold text-white text-glow">
                {fish.name}
              </h3>
              {fish.originalName && (
                <p className="text-xs text-abyss-400 mt-1 italic">
                  原名：{fish.originalName}
                </p>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-bold bg-black/30`}>
              {config.label}
            </span>
          </div>

          {/* 图像区域 */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20 border border-white/10">
            {fish.imageUrl ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={fish.imageUrl}
                alt={fish.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-6xl"
                >
                  🐟
                </motion.div>
              </div>
            )}
            
            {/* 装饰边框 */}
            <div className="absolute inset-0 border-4 border-white/5 rounded-lg pointer-events-none" />
          </div>

          {showDetails && (
            <>
              {/* 属性标签 */}
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/80">
                  ⚡ +{fish.attributes.hunger} 体力
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/80">
                  💰 {fish.attributes.value} 金币
                </span>
              </div>

              {/* 身世碎片 */}
              <div className="text-xs text-white/60 italic border-t border-white/10 pt-2">
                "{fish.loreFragment}"
              </div>
            </>
          )}
        </div>

        {/* 角落装饰 */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/30" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/30" />

        {/* 闪烁效果 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </motion.div>
  );
}

