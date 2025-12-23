import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { FishCard } from './FishCard';
import { TAG_INFO } from '@/data';
import type { PlayerChoice, FishTag } from '@/types';

export function DialoguePanel() {
  const phase = useGameStore((state) => state.phase);
  const currentFish = useGameStore((state) => state.currentFish);
  const makeChoice = useGameStore((state) => state.makeChoice);
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 打字机效果
  useEffect(() => {
    if (!currentFish?.dialogue) return;
    
    setIsTyping(true);
    setDisplayedText('');
    
    const text = currentFish.dialogue;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [currentFish?.dialogue]);

  const handleChoice = (choice: PlayerChoice) => {
    if (isTyping) return;
    makeChoice(choice);
  };

  if (phase !== 'dialogue' && phase !== 'choice') {
    return null;
  }

  if (!currentFish) return null;

  // 获取标签信息 - 但不显示正负属性
  const tag = (currentFish.tag || 'forgotten') as FishTag;
  const tagInfo = TAG_INFO[tag];

  // 抉择按钮配置 - 移除明显的善恶提示，让玩家自行判断
  const choices = [
    {
      type: 'consume' as PlayerChoice,
      label: '消化',
      icon: '🔥',
      description: `恢复 ${currentFish.attributes.hunger} 体力`,
      warning: '？？？',
      warningColor: 'text-abyss-500',
      color: 'from-red-600 to-red-900',
      hoverColor: 'hover:border-red-400',
    },
    {
      type: 'collect' as PlayerChoice,
      label: '收藏',
      icon: '💎',
      description: `价值 ${currentFish.attributes.value} 金币`,
      warning: '？？？',
      warningColor: 'text-abyss-500',
      color: 'from-amber-500 to-amber-800',
      hoverColor: 'hover:border-amber-400',
    },
    {
      type: 'release' as PlayerChoice,
      label: '放生',
      icon: '🕊️',
      description: '聆听它的故事',
      warning: '？？？',
      warningColor: 'text-abyss-500',
      color: 'from-emerald-500 to-emerald-800',
      hoverColor: 'hover:border-emerald-400',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row items-center gap-8 p-8 max-w-5xl"
        >
          {/* 鱼卡牌 */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FishCard fish={currentFish} showDetails={false} />
          </motion.div>

          {/* 对话和抉择区域 */}
          <div className="flex-1 max-w-lg space-y-6">
            {/* 对话框 */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-dark rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💬</span>
                <span className="text-lg font-title text-abyss-100">
                  {currentFish.name}
                </span>
              </div>
              
              <p className="text-lg leading-relaxed text-abyss-50 font-mystical">
                "{displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    |
                  </motion.span>
                )}
                "
              </p>
            </motion.div>

            {/* 抉择按钮 */}
            {phase === 'dialogue' && !isTyping && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <div className="text-center text-sm text-abyss-400 mb-4">
                  做出你的抉择（不可逆）
                </div>
                
                <div className="grid gap-3">
                  {choices.map((choice, index) => (
                    <motion.button
                      key={choice.type}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(choice.type)}
                      className={`
                        w-full p-4 rounded-xl border-2 border-white/10 
                        bg-gradient-to-r ${choice.color} 
                        ${choice.hoverColor}
                        transition-all duration-300
                        text-left group
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {choice.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-title font-bold text-lg text-white">
                              {choice.label}
                            </span>
                            <span className="text-xs text-white/60">
                              {choice.warning}
                            </span>
                          </div>
                          <span className="text-sm text-white/80">
                            {choice.description}
                          </span>
                        </div>
                        <motion.span
                          className="text-white/50 text-xl"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

