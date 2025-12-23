import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getRandomFishByRarity, ALL_FISH } from '@/data';
import { generateFishImage, personalizeFish } from '@/services/api';
import { imageCache } from '@/services/imageCache';
import type { FishRarity, Fish, FishTag } from '@/types';

// ============================================
// 钓鱼小游戏配置 - 参考Stardew Valley风格
// ============================================

interface FishingConfig {
  // 鱼的行为
  fishSpeed: number;         // 鱼的移动速度
  fishAcceleration: number;  // 鱼的加速度
  fishErraticness: number;   // 鱼的不规则程度 (0-1)
  fishJumpChance: number;    // 鱼突然跳跃的概率
  
  // 绿色条（玩家控制）
  barSize: number;           // 绿色条大小 (0-100)
  barGravity: number;        // 下落速度
  barBounce: number;         // 边界弹性
  barLift: number;           // 点击上升力度
  
  // 进度
  progressGain: number;      // 在区域内的进度增加速度
  progressLoss: number;      // 在区域外的进度减少速度
  
  // 视觉
  color: string;
  glowColor: string;
  icon: string;
  title: string;
  catchPhrase: string;
}

// 平衡的钓鱼难度配置
const RARITY_CONFIG: Record<FishRarity, FishingConfig> = {
  common: {
    fishSpeed: 0.8,
    fishAcceleration: 0.3,
    fishErraticness: 0.03,
    fishJumpChance: 0.001,
    barSize: 45,
    barGravity: 0.08,
    barBounce: 0.4,
    barLift: 0.25,
    progressGain: 0.6,        // 降低：每秒约36%进度（需要3秒左右完成）
    progressLoss: 0.12,       // 降低：每秒约7%进度流失
    color: '#9ca3af',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    icon: '🐟',
    title: '普通生物',
    catchPhrase: '水面微微颤动...',
  },
  uncommon: {
    fishSpeed: 1.0,
    fishAcceleration: 0.4,
    fishErraticness: 0.05,
    fishJumpChance: 0.002,
    barSize: 42,
    barGravity: 0.1,
    barBounce: 0.35,
    barLift: 0.28,
    progressGain: 0.5,        // 每秒约30%
    progressLoss: 0.14,
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    icon: '🐠',
    title: '稀有生物',
    catchPhrase: '感觉到一股不寻常的力量...',
  },
  rare: {
    fishSpeed: 1.3,
    fishAcceleration: 0.5,
    fishErraticness: 0.08,
    fishJumpChance: 0.003,
    barSize: 38,
    barGravity: 0.12,
    barBounce: 0.3,
    barLift: 0.32,
    progressGain: 0.42,       // 每秒约25%
    progressLoss: 0.16,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    icon: '🐡',
    title: '珍稀生物',
    catchPhrase: '水下传来神秘的光芒...',
  },
  epic: {
    fishSpeed: 1.6,
    fishAcceleration: 0.6,
    fishErraticness: 0.12,
    fishJumpChance: 0.005,
    barSize: 34,
    barGravity: 0.14,
    barBounce: 0.25,
    barLift: 0.35,
    progressGain: 0.35,       // 每秒约21%
    progressLoss: 0.2,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    icon: '🦑',
    title: '史诗生物',
    catchPhrase: '虚数海深处的存在被惊扰了...',
  },
  legendary: {
    fishSpeed: 2.0,
    fishAcceleration: 0.7,
    fishErraticness: 0.18,
    fishJumpChance: 0.008,
    barSize: 30,
    barGravity: 0.16,
    barBounce: 0.2,
    barLift: 0.38,
    progressGain: 0.3,        // 每秒约18%
    progressLoss: 0.22,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    icon: '🐉',
    title: '传说生物',
    catchPhrase: '远古的力量正在苏醒...',
  },
  mythical: {
    fishSpeed: 2.5,
    fishAcceleration: 0.8,
    fishErraticness: 0.25,
    fishJumpChance: 0.01,
    barSize: 26,
    barGravity: 0.18,
    barBounce: 0.15,
    barLift: 0.4,
    progressGain: 0.25,       // 每秒约15%
    progressLoss: 0.25,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    icon: '🌟',
    title: '神话生物',
    catchPhrase: '现实与虚幻的边界开始模糊...',
  },
};

// 游戏状态
interface MinigameState {
  fishPosition: number;      // 鱼的位置 (0-100)
  fishVelocity: number;      // 鱼的速度
  fishDirection: number;     // 鱼的目标方向 (1 上, -1 下)
  
  barPosition: number;       // 绿色条位置 (条的中心)
  barVelocity: number;       // 绿色条速度
  
  progress: number;          // 捕获进度 (0-100)
  isHolding: boolean;        // 是否按住
  
  lastUpdate: number;
}

export function CatchingOverlay() {
  const phase = useGameStore((state) => state.phase);
  const weather = useGameStore((state) => state.weather);
  const karmaStats = useGameStore((state) => state.karmaStats);
  const currentRarityBonus = useGameStore((state) => state.currentRarityBonus);
  const caughtMythicalFish = useGameStore((state) => state.caughtMythicalFish);
  const setPhase = useGameStore((state) => state.setPhase);
  const catchFish = useGameStore((state) => state.catchFish);
  const addLog = useGameStore((state) => state.addLog);

  const [catchingRarity, setCatchingRarity] = useState<FishRarity>('common');
  const [catchPhrase, setCatchPhrase] = useState('');
  const [isMinigameActive, setIsMinigameActive] = useState(false);
  const [minigameState, setMinigameState] = useState<MinigameState | null>(null);
  const [showTip, setShowTip] = useState('');
  
  const minigameRef = useRef<MinigameState | null>(null);
  const animationFrameRef = useRef<number>(0);
  const generatedFishRef = useRef<Fish | null>(null);
  const configRef = useRef<FishingConfig>(RARITY_CONFIG.common);

  // 确定稀有度
  const determineRarity = useCallback((): FishRarity => {
    const random = Math.random();
    const totalKarma = karmaStats.gluttony + karmaStats.greed + karmaStats.mercy;
    const karmaBonus = totalKarma / 600; // 降低业力影响，使其更微妙
    const rarityBonus = currentRarityBonus / 200; // 降低区域影响
    
    // 天气影响也降低
    const weatherBonus = weather.type === 'aurora' ? 0.03 : 
                         weather.type === 'starfall' ? 0.025 :
                         weather.type === 'eclipse' ? 0.02 :
                         weather.type === 'bloodRain' ? 0.015 : 0;
    
    const adjustedRandom = random - karmaBonus - weatherBonus - rarityBonus;
    
    // 更符合游戏体验的概率分布
    // Mythical: 0.1%, Legendary: 0.9%, Epic: 4%, Rare: 10%, Uncommon: 25%, Common: 60%
    if (adjustedRandom < 0.001) return 'mythical';   // 0.1%
    if (adjustedRandom < 0.01) return 'legendary';   // 0.9%
    if (adjustedRandom < 0.05) return 'epic';        // 4%
    if (adjustedRandom < 0.15) return 'rare';        // 10%
    if (adjustedRandom < 0.40) return 'uncommon';    // 25%
    return 'common';                                  // 60%
  }, [karmaStats, weather, currentRarityBonus]);

  // 从预设数据库获取鱼
  const getFishFromDatabase = useCallback((rarity: FishRarity): Fish => {
    let template = getRandomFishByRarity(rarity);
    
    // 如果是神话稀有度，检查是否已经捕获过该鱼
    if (rarity === 'mythical' && template) {
      let attempts = 0;
      const maxAttempts = 50; // 最多尝试50次
      
      while (caughtMythicalFish.includes(template.id) && attempts < maxAttempts) {
        template = getRandomFishByRarity(rarity);
        attempts++;
      }
      
      // 如果所有神话鱼都捕获过了，降级到传说稀有度
      if (caughtMythicalFish.includes(template.id)) {
        console.log('所有神话稀有度鱼类已捕获，降级为传说稀有度');
        template = getRandomFishByRarity('legendary');
      }
    }
    
    if (template) {
      return {
        id: `${template.id}-${Date.now()}`,
        templateId: template.id,
        name: template.name,
        rarity: template.rarity,
        personality: template.personality,
        tag: template.tag as FishTag,
        dialogue: template.dialogue,
        loreFragment: template.loreFragment,
        visualKeywords: template.visualKeywords,
        attributes: {
          hunger: template.attributes.baseHunger + Math.floor(Math.random() * 10),
          value: template.attributes.baseValue + Math.floor(Math.random() * 20),
          intel: generateIntel(template.tag),
        },
        weather: weather.type,
        timestamp: Date.now(),
      };
    }
    
    // 如果数据库中没有该稀有度的鱼，使用备用
    return generateFallbackFish(rarity);
  }, [weather, caughtMythicalFish]);

  // 生成情报
  const generateIntel = (tag: string): string => {
    const intels: Record<string, string[]> = {
      innocent: [
        '无辜者的泪水会在月光下化为珍珠...',
        '孩童的笑声是虚数海中最稀有的声音...',
        '有些灵魂从未学会仇恨...',
      ],
      healer: [
        '治愈者的血液能修复裂痕...',
        '在虚数海深处，有一座由治愈者骨骼建成的神殿...',
        '真正的治愈需要代价...',
      ],
      murderer: [
        '每一个杀人者都在某个夜晚被自己的影子追杀...',
        '血腥的气味会吸引更古老的存在...',
        '死亡不是结束，只是另一种形式的开始...',
      ],
      betrayer: [
        '背叛者永远在寻找下一个可以出卖的人...',
        '虚数海最深处住着第一个背叛者...',
        '信任一旦破碎，就会变成锋利的武器...',
      ],
      // 默认情报
      default: [
        '虚数海的深处隐藏着旧世界的秘密...',
        '每一个灵魂都曾是某个人的全世界...',
        '时间在这里失去了意义...',
        '有些真相不应该被知晓...',
      ],
    };
    
    const pool = intels[tag] || intels.default;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // 备用鱼生成
  const generateFallbackFish = (rarity: FishRarity): Fish => {
    return {
      id: `fallback-${Date.now()}`,
      name: '迷失灵魂',
      rarity,
      personality: 'mysterious',
      tag: 'forgotten',
      dialogue: '我已经忘记了自己是谁...',
      loreFragment: '这个灵魂的记忆已经完全消散，只剩下空洞的眼神和模糊的轮廓。',
      visualKeywords: 'ghostly transparent fish, fading form, empty eyes, forgotten soul',
      attributes: {
        hunger: 15 + Math.floor(Math.random() * 10),
        value: 30 + Math.floor(Math.random() * 20),
        intel: '有些灵魂选择遗忘，有些被遗忘选择...',
      },
      weather: weather.type,
      timestamp: Date.now(),
    };
  };

  // 初始化小游戏
  const initMinigame = useCallback((rarity: FishRarity) => {
    const baseConfig = RARITY_CONFIG[rarity];
    
    // 业力值影响钓鱼难度
    const totalKarma = karmaStats.gluttony + karmaStats.greed + karmaStats.mercy;
    const karmaDifficultyMultiplier = 1 + (totalKarma / 300) * 0.5; // 最多增加50%难度
    
    // 应用业力难度加成
    const adjustedConfig: FishingConfig = {
      ...baseConfig,
      fishSpeed: baseConfig.fishSpeed * karmaDifficultyMultiplier,
      fishErraticness: Math.min(0.4, baseConfig.fishErraticness * karmaDifficultyMultiplier),
      barSize: Math.max(15, baseConfig.barSize * (1 / karmaDifficultyMultiplier)), // 绿色条变小
      progressGain: baseConfig.progressGain * (1 / karmaDifficultyMultiplier), // 进度增加变慢
      progressLoss: baseConfig.progressLoss * karmaDifficultyMultiplier, // 进度流失变快
    };
    
    configRef.current = adjustedConfig;
    
    const initialState: MinigameState = {
      fishPosition: 50,
      fishVelocity: 0,
      fishDirection: Math.random() > 0.5 ? 1 : -1,
      barPosition: 50,
      barVelocity: 0,
      progress: 0,
      isHolding: false,
      lastUpdate: Date.now(),
    };
    
    minigameRef.current = initialState;
    setMinigameState(initialState);
    setIsMinigameActive(true);
    
    // 根据业力难度显示不同提示
    if (totalKarma > 150) {
      setShowTip('⚠️ 虚数海的波涛变得狂暴...');
    } else if (totalKarma > 80) {
      setShowTip('业力扰动了海域的平静...');
    } else {
      setShowTip('按住屏幕让绿色条跟随鱼移动！');
    }
  }, [karmaStats]);

  // 更新游戏状态 - Stardew Valley风格
  const updateMinigame = useCallback(() => {
    if (!minigameRef.current || !isMinigameActive) return;
    
    const state = minigameRef.current;
    const config = configRef.current;
    const now = Date.now();
    const delta = Math.min((now - state.lastUpdate) / 1000, 0.05); // 限制最大delta避免卡顿
    state.lastUpdate = now;
    
    // ========== 鱼的移动 (更平滑的正弦波 + 随机扰动) ==========
    // 使用正弦波作为基础移动模式，更加可预测
    const time = now / 1000;
    const sineBase = Math.sin(time * config.fishSpeed * 0.5) * 30; // 平滑的正弦波
    const sineSecondary = Math.sin(time * config.fishSpeed * 0.3 + 2) * 15; // 次级波
    
    // 计算目标位置 (50为中心)
    let targetPosition = 50 + sineBase + sineSecondary;
    
    // 偶尔的随机扰动（但很轻微）
    if (Math.random() < config.fishErraticness * delta) {
      state.fishDirection = -state.fishDirection;
    }
    targetPosition += state.fishDirection * config.fishErraticness * 10;
    
    // 随机小跳跃（非常罕见且幅度小）
    if (Math.random() < config.fishJumpChance) {
      targetPosition += (Math.random() - 0.5) * 15;
    }
    
    // 限制在安全范围内
    targetPosition = Math.max(10, Math.min(90, targetPosition));
    
    // 平滑过渡到目标位置（使用lerp）
    const lerpFactor = config.fishAcceleration * delta * 3;
    state.fishPosition += (targetPosition - state.fishPosition) * lerpFactor;
    state.fishPosition = Math.max(5, Math.min(95, state.fishPosition));
    
    // ========== 绿色条移动 (玩家控制) ==========
    // 重力
    if (!state.isHolding) {
      state.barVelocity -= config.barGravity;
    } else {
      state.barVelocity += config.barLift;
    }
    
    // 阻尼
    state.barVelocity *= 0.95;
    
    // 速度限制
    state.barVelocity = Math.max(-3, Math.min(3, state.barVelocity));
    
    // 应用速度
    state.barPosition += state.barVelocity;
    
    // 边界碰撞 + 弹性
    const halfBar = config.barSize / 2;
    if (state.barPosition - halfBar <= 0) {
      state.barPosition = halfBar;
      state.barVelocity = Math.abs(state.barVelocity) * config.barBounce;
    } else if (state.barPosition + halfBar >= 100) {
      state.barPosition = 100 - halfBar;
      state.barVelocity = -Math.abs(state.barVelocity) * config.barBounce;
    }
    
    // ========== 进度计算 ==========
    const barTop = state.barPosition - halfBar;
    const barBottom = state.barPosition + halfBar;
    const fishInBar = state.fishPosition >= barTop && state.fishPosition <= barBottom;
    
    // 使用 delta 来平滑进度变化，避免帧率影响导致突然拉满
    if (fishInBar) {
      state.progress += config.progressGain * delta * 60; // 转换为每秒的变化率
      setShowTip('🎣 保持住！');
    } else {
      state.progress -= config.progressLoss * delta * 60; // 转换为每秒的变化率
      const distance = state.fishPosition < barTop 
        ? '👆 向上！' 
        : '👇 向下！';
      setShowTip(distance);
    }
    
    state.progress = Math.max(0, Math.min(100, state.progress));
    
    setMinigameState({ ...state });
    
    // ========== 胜负判定 ==========
    if (state.progress >= 100) {
      setIsMinigameActive(false);
      handleMinigameSuccess();
      return;
    }
    
    if (state.progress <= 0) {
      setIsMinigameActive(false);
      handleMinigameFailure();
      return;
    }
    
    animationFrameRef.current = requestAnimationFrame(updateMinigame);
  }, [isMinigameActive]);

  // 成功捕获
  const handleMinigameSuccess = useCallback(async () => {
    addLog('system', '🎉 成功捕获！');
    
    if (generatedFishRef.current) {
      const fish = generatedFishRef.current;
      
      // 为鱼生成独特的原名和个性化故事（异步）
      personalizeFish({
        templateName: fish.name,
        tag: fish.tag,
        rarity: fish.rarity,
        personality: fish.personality,
      }).then((personalData) => {
        if (personalData && generatedFishRef.current) {
          // 即使success为false，也使用返回的默认数据
          generatedFishRef.current.originalName = personalData.originalName;
          generatedFishRef.current.dialogue = personalData.dialogue;
          generatedFishRef.current.loreFragment = personalData.loreFragment;
        }
      }).catch(err => {
        console.warn('个性化失败，使用模板默认数据:', err);
        // 保持使用模板的原始数据
      });
      
      // 后台生成图片（先检查缓存）
      const loadFishImage = async () => {
        if (!fish.templateId) return;
        
        // 先尝试从缓存获取
        const cachedUrl = await imageCache.get(fish.templateId, fish.rarity, weather.type);
        
        if (cachedUrl) {
          console.log('使用缓存图片:', fish.templateId);
          if (generatedFishRef.current) {
            generatedFishRef.current.imageUrl = cachedUrl;
          }
          return;
        }
        
        // 缓存未命中，生成新图片
        try {
          const imageUrl = await generateFishImage({
            fishName: fish.name,
            fishDescription: fish.loreFragment,
            rarity: fish.rarity,
            weather: weather.type,
            visualKeywords: fish.visualKeywords,
          });
          
          if (imageUrl) {
            // 保存到缓存
            await imageCache.set(fish.templateId, fish.rarity, weather.type, imageUrl);
            
            if (generatedFishRef.current) {
              generatedFishRef.current.imageUrl = imageUrl;
            }
          }
        } catch (err) {
          console.warn('图像生成失败:', err);
        }
      };
      
      loadFishImage();
      
      catchFish(generatedFishRef.current);
      generatedFishRef.current = null;
    }
  }, [addLog, catchFish, weather]);

  // 捕获失败
  const handleMinigameFailure = useCallback(() => {
    addLog('system', '💨 鱼逃走了...');
    generatedFishRef.current = null;
    setPhase('idle');
  }, [addLog, setPhase]);

  // 按下
  const handlePress = useCallback(() => {
    if (minigameRef.current) {
      minigameRef.current.isHolding = true;
    }
  }, []);

  // 松开
  const handleRelease = useCallback(() => {
    if (minigameRef.current) {
      minigameRef.current.isHolding = false;
    }
  }, []);

  // 开始钓鱼
  const startFishing = useCallback(async () => {
    try {
      const rarity = determineRarity();
      setCatchingRarity(rarity);
      setCatchPhrase(RARITY_CONFIG[rarity].catchPhrase);
      addLog('system', RARITY_CONFIG[rarity].catchPhrase);
      
      setPhase('catching');
      
      // 从预设数据库获取鱼
      const fish = getFishFromDatabase(rarity);
      generatedFishRef.current = fish;
      
      // 等待一小段时间后开始小游戏
      const config = RARITY_CONFIG[rarity];
      const waitTime = 800 + Math.random() * 500;
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      addLog('system', '🎣 有东西上钩了！');
      initMinigame(rarity);
      
    } catch (error) {
      console.error('钓鱼失败:', error);
      addLog('system', '似乎什么都没有...');
      setPhase('idle');
    }
  }, [determineRarity, getFishFromDatabase, setPhase, addLog, initMinigame]);

  // 等待阶段触发
  useEffect(() => {
    if (phase === 'waiting') {
      const delay = 500 + Math.random() * 1000;
      const timer = setTimeout(startFishing, delay);
      return () => clearTimeout(timer);
    }
  }, [phase, startFishing]);

  // 游戏循环
  useEffect(() => {
    if (isMinigameActive) {
      animationFrameRef.current = requestAnimationFrame(updateMinigame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMinigameActive, updateMinigame]);

  // 清理
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const config = RARITY_CONFIG[catchingRarity];

  return (
    <AnimatePresence>
      {(phase === 'waiting' || phase === 'catching') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 pointer-events-none"
        >
          {/* 等待提示 */}
          {phase === 'waiting' && !isMinigameActive && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2"
            >
              <div className="glass px-6 py-3 rounded-full">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-abyss-200 font-title"
                >
                  等待鱼儿上钩...
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* 捕获提示 */}
          {phase === 'catching' && !isMinigameActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    `0 0 20px ${config.glowColor}`,
                    `0 0 40px ${config.glowColor}`,
                    `0 0 20px ${config.glowColor}`,
                  ]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="glass-dark px-8 py-4 rounded-2xl text-center"
                style={{ borderColor: config.color }}
              >
                <div className="text-4xl mb-2">{config.icon}</div>
                <div className="text-lg font-title" style={{ color: config.color }}>
                  {config.title}
                </div>
                <div className="text-sm text-abyss-300 mt-1">
                  {catchPhrase}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Stardew Valley风格钓鱼小游戏 */}
          {isMinigameActive && minigameState && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              onMouseDown={handlePress}
              onMouseUp={handleRelease}
              onMouseLeave={handleRelease}
              onTouchStart={handlePress}
              onTouchEnd={handleRelease}
            >
              <div className="glass-dark rounded-3xl p-6 w-72 max-w-[85vw]">
                {/* 标题 */}
                <div className="text-center mb-4">
                  <span className="text-3xl mr-2">{config.icon}</span>
                  <span className="font-title text-xl" style={{ color: config.color }}>
                    {config.title}
                  </span>
                </div>

                {/* 钓鱼条 - 垂直版 */}
                <div className="flex justify-center mb-4">
                  <div 
                    className="relative w-16 h-64 bg-abyss-800 rounded-2xl overflow-hidden border-2"
                    style={{ borderColor: config.color }}
                  >
                    {/* 绿色条（玩家控制） */}
                    <motion.div
                      className="absolute left-1 right-1 rounded-lg"
                      style={{
                        height: `${configRef.current.barSize}%`,
                        bottom: `${minigameState.barPosition - configRef.current.barSize / 2}%`,
                        backgroundColor: 'rgba(34, 197, 94, 0.6)',
                        boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)',
                      }}
                    />
                    
                    {/* 鱼的位置 */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center text-2xl"
                      style={{
                        bottom: `${minigameState.fishPosition - 5}%`,
                        filter: `drop-shadow(0 0 8px ${config.glowColor})`,
                      }}
                      animate={{
                        rotate: minigameState.fishVelocity > 0 ? -15 : 15,
                      }}
                    >
                      {config.icon}
                    </motion.div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-abyss-400 mb-1">
                    <span>捕获进度</span>
                    <span>{Math.floor(minigameState.progress)}%</span>
                  </div>
                  <div className="h-4 bg-abyss-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full transition-all duration-75"
                      style={{ 
                        width: `${minigameState.progress}%`,
                        backgroundColor: minigameState.progress > 70 ? '#22c55e' : 
                                        minigameState.progress > 30 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>

                {/* 提示 */}
                <motion.div
                  key={showTip}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-abyss-300 mb-3"
                >
                  {showTip}
                </motion.div>

                {/* 操作提示 */}
                <motion.div
                  animate={{ 
                    scale: minigameState.isHolding ? 0.95 : 1,
                    backgroundColor: minigameState.isHolding ? 'rgba(34, 197, 94, 0.3)' : 'transparent',
                  }}
                  className="text-center py-3 rounded-xl border-2 border-green-500/50 transition-all"
                >
                  <span className={minigameState.isHolding ? 'text-green-400' : 'text-abyss-300'}>
                    {minigameState.isHolding ? '▲ 上升中...' : '按住屏幕上升'}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* 稀有度粒子效果 */}
          {(catchingRarity === 'legendary' || catchingRarity === 'mythical') && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight + 20,
                    opacity: 0,
                  }}
                  animate={{
                    y: -20,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
