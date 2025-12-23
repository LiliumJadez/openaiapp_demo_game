import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { streamEnding } from '@/services/api';
import type { EndingType } from '@/types';

// 结局配置
const ENDING_CONFIG: Record<EndingType, {
  title: string;
  icon: string;
  color: string;
  bgGradient: string;
}> = {
  descent: {
    title: '沉沦',
    icon: '🔥',
    color: 'text-red-400',
    bgGradient: 'from-red-950 via-red-900 to-black',
  },
  avarice: {
    title: '贪婪',
    icon: '💎',
    color: 'text-amber-400',
    bgGradient: 'from-amber-950 via-amber-900 to-black',
  },
  ascension: {
    title: '觉悟',
    icon: '🕊️',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-950 via-emerald-900 to-black',
  },
  balance: {
    title: '平衡',
    icon: '☯️',
    color: 'text-purple-400',
    bgGradient: 'from-purple-950 via-purple-900 to-black',
  },
  void: {
    title: '虚无',
    icon: '💀',
    color: 'text-gray-400',
    bgGradient: 'from-gray-950 via-gray-900 to-black',
  },
  hoarder: {
    title: '囤积者',
    icon: '📦',
    color: 'text-orange-400',
    bgGradient: 'from-orange-950 via-orange-900 to-black',
  },
  devourer: {
    title: '吞噬者',
    icon: '👹',
    color: 'text-red-500',
    bgGradient: 'from-red-950 via-black to-red-900',
  },
  corruptor: {
    title: '堕落者',
    icon: '😈',
    color: 'text-purple-500',
    bgGradient: 'from-purple-950 via-black to-purple-900',
  },
  moonSecret: {
    title: '月之秘密',
    icon: '🌙',
    color: 'text-cyan-300',
    bgGradient: 'from-cyan-950 via-indigo-950 to-black',
  },
};

export function EndingPanel() {
  const phase = useGameStore((state) => state.phase);
  const visibleStats = useGameStore((state) => state.visibleStats);
  const karmaStats = useGameStore((state) => state.karmaStats);
  const collection = useGameStore((state) => state.collection);
  const stats = useGameStore((state) => state.stats);
  const bestiary = useGameStore((state) => state.bestiary);
  const storeEnding = useGameStore((state) => state.ending); // 直接从store读取
  const checkEnding = useGameStore((state) => state.checkEnding);
  const setPhase = useGameStore((state) => state.setPhase);
  const resetGame = useGameStore((state) => state.resetGame);

  const [endingType, setEndingType] = useState<EndingType | null>(null);
  const [narrative, setNarrative] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [playerSummary, setPlayerSummary] = useState<string>('');

  // 检测结局触发（两种方式：1. 从checkEnding检测 2. 从store.ending直接读取）
  useEffect(() => {
    // 方式1：从store.ending直接读取（用于月亮彩蛋等直接设置ending的情况）
    if (phase === 'ending' && storeEnding && !endingType) {
      setEndingType(storeEnding.type);
      return;
    }
    
    // 方式2：通过checkEnding检测（用于正常游戏流程）
    if (phase === 'result' || phase === 'idle') {
      const type = checkEnding();
      if (type && !endingType) {
        setEndingType(type);
        setPhase('ending');
      }
    }
  }, [phase, checkEnding, setPhase, endingType, storeEnding]);

  // 生成玩家行为总结
  useEffect(() => {
    if (phase !== 'ending' || !endingType || playerSummary) return;
    
    const summary = generatePlayerSummary(stats, visibleStats, karmaStats, bestiary, endingType);
    setPlayerSummary(summary);
  }, [phase, endingType, stats, visibleStats, karmaStats, bestiary, playerSummary]);

  // 生成结局叙事
  useEffect(() => {
    if (phase !== 'ending' || !endingType || isStreaming || narrative || !playerSummary) return;

    const generateNarrative = async () => {
      setIsStreaming(true);
      
      try {
        const significantFish = collection
          .filter(f => f.rarity === 'legendary' || f.rarity === 'mythical')
          .map(f => f.name);

        const stream = streamEnding({
          endingType,
          playerStats: {
            visible: visibleStats,
            karma: karmaStats,
          },
          fishCaught: visibleStats.fishCaught,
          significantFish,
        });

        for await (const chunk of stream) {
          setNarrative(prev => prev + chunk);
        }
      } catch (error) {
        console.error('结局生成失败:', error);
        // 使用备用叙事
        setNarrative(getFallbackNarrative(endingType));
      } finally {
        setIsStreaming(false);
        setTimeout(() => setShowRestart(true), 2000);
      }
    };

    generateNarrative();
  }, [phase, endingType, isStreaming, narrative, collection, visibleStats, karmaStats, playerSummary]);

  if (phase !== 'ending' || !endingType) return null;

  const config = ENDING_CONFIG[endingType];
  
  // 如果配置不存在（可能是新的结局类型），使用默认配置
  if (!config) {
    console.error('未找到结局配置:', endingType);
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 z-50 bg-gradient-to-b ${config.bgGradient} overflow-y-auto`}
      >
        {/* 背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
              }}
              animate={{
                y: -50,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        {/* 主内容 - 改为可滚动的flexbox布局 */}
        <div className="relative min-h-full flex flex-col items-center justify-start py-16 px-4 md:px-8">
          {/* 滚动提示 */}
          {!showRestart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm flex items-center gap-2"
            >
              <span>↓</span>
              <span>向下滚动查看更多</span>
              <span>↓</span>
            </motion.div>
          )}
          
          {/* 结局标题 */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.span
              className="text-6xl block mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {config.icon}
            </motion.span>
            <h1 className={`text-5xl font-title font-bold ${config.color} text-glow`}>
              {config.title}结局
            </h1>
            <div className="mt-2 text-xl text-white/60 font-mystical">
              The End
            </div>
          </motion.div>

          {/* 玩家行为总结 */}
          {playerSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl glass-dark rounded-2xl p-6 mb-6"
            >
              <pre className="text-sm text-abyss-200 font-mono whitespace-pre-wrap">
                {playerSummary}
              </pre>
            </motion.div>
          )}

          {/* 叙事文本 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-2xl glass-dark rounded-2xl p-8"
          >
            <p className="text-lg leading-relaxed text-white/90 font-body whitespace-pre-wrap">
              {narrative}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={config.color}
                >
                  ▌
                </motion.span>
              )}
            </p>
          </motion.div>

          {/* 统计信息 */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center w-full max-w-2xl"
          >
            <div className="glass rounded-lg p-4">
              <div className="text-3xl font-bold text-abyss-100">
                {visibleStats.fishCaught}
              </div>
              <div className="text-sm text-abyss-400">捕获鱼类</div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-3xl font-bold text-amber-400">
                {visibleStats.coins}
              </div>
              <div className="text-sm text-abyss-400">累计金币</div>
            </div>
            <div className="glass rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400">
                {collection.length}
              </div>
              <div className="text-sm text-abyss-400">收藏数量</div>
            </div>
          </motion.div>

          {/* 重新开始按钮 */}
          {showRestart && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEndingType(null);
                setNarrative('');
                setShowRestart(false);
                setPlayerSummary('');
                resetGame();
              }}
              className="mt-8 mb-8 px-8 py-4 rounded-full bg-gradient-to-r from-abyss-600 to-abyss-700 
                         border border-abyss-400/30 text-lg font-title font-bold
                         hover:from-abyss-500 hover:to-abyss-600 transition-all shadow-lg"
            >
              重返虚数海 🌊
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// 备用叙事
// 生成玩家行为总结和评语
function generatePlayerSummary(
  stats: any,
  visibleStats: any,
  karmaStats: any,
  bestiary: any[],
  endingType: EndingType
): string {
  const consumeRate = stats.totalCatches > 0 ? (stats.consumedCount / stats.totalCatches * 100).toFixed(0) : '0';
  const collectRate = stats.totalCatches > 0 ? (stats.collectedCount / stats.totalCatches * 100).toFixed(0) : '0';
  const releaseRate = stats.totalCatches > 0 ? (stats.releasedCount / stats.totalCatches * 100).toFixed(0) : '0';
  
  const dominantKarma = karmaStats.gluttony > karmaStats.greed && karmaStats.gluttony > karmaStats.mercy ? '暴食' :
                        karmaStats.greed > karmaStats.mercy ? '贪婪' : '慈悲';
  
  // 根据行为生成评语
  let judgment = '';
  if (stats.consumedCount > stats.releasedCount + stats.collectedCount) {
    judgment = '饥饿的猎食者';
  } else if (stats.collectedCount > stats.consumedCount + stats.releasedCount) {
    judgment = '贪婪的收藏家';
  } else if (stats.releasedCount > stats.consumedCount + stats.collectedCount) {
    judgment = '慈悲的放生者';
  } else {
    judgment = '摇摆的决策者';
  }
  
  // 特殊评语
  if (stats.positiveTagsConsumed >= 8) judgment += '・灵魂吞噬者';
  if (stats.negativeTagsReleased >= 8) judgment += '・邪念纵容者';
  if (stats.currentRunValue >= 5000) judgment += '・价值追求者';
  if (bestiary.length >= 30) judgment += '・博物学家';
  
  return `
═══════════════════════════════════
              旅程记录
═══════════════════════════════════

捕获总数：${stats.totalCatches} 条生灵
图鉴收集：${bestiary.length} 种独特存在
收集价值：${stats.currentRunValue}

行为倾向：
  消化：${stats.consumedCount} (${consumeRate}%)
  收藏：${stats.collectedCount} (${collectRate}%)
  放生：${stats.releasedCount} (${releaseRate}%)

业力指数：
  暴食 ${karmaStats.gluttony} | 贪婪 ${karmaStats.greed} | 慈悲 ${karmaStats.mercy}
  主导业力：${dominantKarma}

最终评价：「${judgment}」

═══════════════════════════════════
`.trim();
}

function getFallbackNarrative(type: EndingType): string {
  const narratives: Record<EndingType, string> = {
    descent: `
饥饿吞噬了你的理智，每一条被你消化的生灵都在你体内留下了印记。
虚数海的深处传来低沉的呼唤，那是无数被吞噬者的合唱。
你感到自己的身体开始融化，成为虚数海永恒的一部分。
或许这就是贪食者的宿命——成为下一个饥饿的猎物。
    `.trim(),
    
    avarice: `
金币堆积成山，每一枚都刻着被你收藏之物的悲鸣。
你成为了最富有的垂钓者，却再也无法离开这片海域。
你的收藏室成为了你的牢笼，而那些生灵的目光穿透玻璃，日夜注视着你。
贪婪的代价，是永恒的孤独与富足。
    `.trim(),
    
    ascension: `
你放生的每一条生灵都带走了你的一部分，也留下了它们的馈赠。
慈悲积累成光，将你从虚数海的束缚中解放。
你看见了更高维度的真相：这片海域不过是无数轮回中的一滴涟漪。
你觉醒了，成为了新的引导者，在虚与实之间架起桥梁。
    `.trim(),
    
    balance: `
你在贪婪与慈悲之间找到了微妙的平衡。
虚数海认可了你的选择，赐予你观察者的身份。
你既是垂钓者，也是被垂钓者；既是猎手，也是猎物。
在这永恒的循环中，你将见证无数故事的开始与终结。
    `.trim(),
    
    void: `
体力耗尽的那一刻，虚数海张开了它温柔的怀抱。
你沉入深渊，意识渐渐模糊。
在最后一刻，你看见了所有你曾遇见的生灵，它们在虚无中微笑。
或许，成为虚无本身，就是最终的归宿。
    `.trim(),
    
    hoarder: `
你的背包早已超载，那些被囚禁的生灵在黑暗中挣扎、低语、哀嚎。
它们的声音编织成网，紧紧缠绕着你的灵魂。
你成为了囤积者，永远无法满足，永远无法放手。
在无尽的占有欲中，你与它们一同沉入了虚数海的最深处。
    `.trim(),
    
    devourer: `
善良的灵魂在你的胃中化作虚无，它们的美好成为了你的养分。
你感到前所未有的充实，却也前所未有的空虚。
镜子中的倒影已不再是你——那是一个由千百个善良灵魂拼凑而成的怪物。
你成为了吞噬者，永远饥渴，永远不满足。
    `.trim(),
    
    corruptor: `
你放生的每一个邪恶灵魂都在虚数海中留下了黑暗的种子。
它们在深渊中繁衍、扭曲、成长，编织出一张腐败的巨网。
而你，作为纵容者，将永远背负它们的罪孽。
虚数海在你的慈悲中腐烂，而你也随之堕入永恒的黑暗。
    `.trim(),
    
    moonSecret: `
七次凝视，七次触碰，月亮终于向你揭示了虚数海的终极秘密。

这片海域并非真实存在，它是所有垂钓者集体意识的投影。
每一条鱼，每一个灵魂，都是你自己的碎片。
你钓起的，是你遗忘的记忆；你放生的，是你无法接受的真相。

月亮轻声低语："欢迎回家，迷途的守望者。"

你意识到，你从未离开过这里，也永远无法离开。
但这一次，你终于知道了——为什么。
    `.trim(),
  };
  
  return narratives[type];
}

