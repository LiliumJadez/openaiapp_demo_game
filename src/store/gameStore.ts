import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type { 
  GameState, 
  GamePhase, 
  WeatherState, 
  Fish, 
  PlayerChoice,
  Ending,
  EndingType,
  GameLog,
  WeatherType,
  Achievement,
  BestiaryEntry,
  GameStats,
  FishRarity
} from '@/types';

// 业力阈值 - 触发结局
const KARMA_THRESHOLD = 80;
const STAMINA_THRESHOLD = 0;

// 天气过渡时间（毫秒）
const WEATHER_TRANSITION_DURATION = 3000;

// 天气配置 (7种)
const WEATHER_CONFIG: Record<WeatherType, Omit<WeatherState, 'intensity' | 'transitionProgress' | 'previousType'>> = {
  sunny: {
    type: 'sunny',
    description: '晴空万里，湖面波光粼粼',
    mysticalEffect: '阳光穿透水面，照亮深处的秘密',
  },
  bloodRain: {
    type: 'bloodRain',
    description: '血色细雨飘落，染红了虚数之海',
    mysticalEffect: '血雨唤醒沉睡的远古存在',
  },
  fog: {
    type: 'fog',
    description: '迷雾笼罩，万物隐匿其中',
    mysticalEffect: '迷雾中传来未知的低语',
  },
  storm: {
    type: 'storm',
    description: '风暴肆虐，虚空震颤',
    mysticalEffect: '雷电撕裂现实与虚幻的边界',
  },
  aurora: {
    type: 'aurora',
    description: '极光流转，梦幻交织',
    mysticalEffect: '极光中映射着无数可能的命运',
  },
  eclipse: {
    type: 'eclipse',
    description: '日蚀降临，天地晦暗',
    mysticalEffect: '黑日之下，隐藏的真相浮现',
  },
  starfall: {
    type: 'starfall',
    description: '星陨如雨，光芒划破夜空',
    mysticalEffect: '每颗坠落的星辰都承载着一个愿望',
  },
};

// 成就定义 - 高级成就使用模糊描述，图标将通过图像生成
const ACHIEVEMENTS: Achievement[] = [
  // 收集类 - 基础成就（明确描述）
  { id: 'first_catch', name: '初入虚数海', description: '捕获第一条生物', icon: '🎣', category: 'collection', condition: { type: 'fish_count', count: 1 } },
  { id: 'catch_10', name: '小有收获', description: '捕获10条生物', icon: '🐟', category: 'collection', condition: { type: 'fish_count', count: 10 } },
  { id: 'catch_50', name: '海域猎手', description: '累积一定数量的捕获', icon: '🦈', category: 'collection', condition: { type: 'fish_count', count: 50 } },
  
  // 收集类 - 高级成就（模糊描述）
  { id: 'catch_rare', name: '珍稀邂逅', description: '邂逅不寻常的存在', icon: '💎', category: 'collection', condition: { type: 'rarity_catch', rarity: 'rare', count: 1 }, generatedIcon: true },
  { id: 'catch_epic', name: '史诗发现', description: '发现被遗忘的传说', icon: '👑', category: 'collection', condition: { type: 'rarity_catch', rarity: 'epic', count: 1 }, generatedIcon: true },
  { id: 'catch_legendary', name: '传说降临', description: '见证不可思议之物', icon: '🌟', category: 'collection', condition: { type: 'rarity_catch', rarity: 'legendary', count: 1 }, generatedIcon: true },
  { id: 'catch_mythical', name: '神话具现', description: '触碰虚数海的核心秘密', icon: '✨', category: 'collection', condition: { type: 'rarity_catch', rarity: 'mythical', count: 1 }, generatedIcon: true },
  { id: 'unique_10', name: '图鉴收集者', description: '记录多种生命形态', icon: '📖', category: 'collection', condition: { type: 'unique_fish', count: 10 } },
  { id: 'unique_25', name: '博物学家', description: '成为虚数海的记录者', icon: '📚', category: 'collection', condition: { type: 'unique_fish', count: 25 }, generatedIcon: true },
  
  // 业力类 - 基础成就
  { id: 'gluttony_30', name: '饥饿之始', description: '暴食值达到30', icon: '🍖', category: 'karma', condition: { type: 'karma_reach', karma: 'gluttony', value: 30 } },
  { id: 'greed_30', name: '贪欲萌芽', description: '贪婪值达到30', icon: '💰', category: 'karma', condition: { type: 'karma_reach', karma: 'greed', value: 30 } },
  { id: 'mercy_30', name: '慈悲初心', description: '慈悲值达到30', icon: '🕊️', category: 'karma', condition: { type: 'karma_reach', karma: 'mercy', value: 30 } },
  
  // 业力类 - 高级成就（模糊描述）
  { id: 'karma_balance', name: '平衡之道', description: '在三种力量间找到平衡', icon: '⚖️', category: 'karma', condition: { type: 'karma_balance', variance: 100 }, generatedIcon: true },
  { id: 'gluttony_master', name: '饕餮化身', description: '彻底拥抱饥饿的本能', icon: '👹', category: 'karma', condition: { type: 'karma_reach', karma: 'gluttony', value: 70 }, generatedIcon: true },
  { id: 'greed_master', name: '黄金之眼', description: '被无尽的欲望所填满', icon: '👁️', category: 'karma', condition: { type: 'karma_reach', karma: 'greed', value: 70 }, generatedIcon: true },
  { id: 'mercy_master', name: '慈悲圣者', description: '以仁慈之心俯瞰万物', icon: '😇', category: 'karma', condition: { type: 'karma_reach', karma: 'mercy', value: 70 }, generatedIcon: true },
  
  // 探索类
  { id: 'weather_bloodrain', name: '血色洗礼', description: '在血雨中捕获生物', icon: '🩸', category: 'exploration', condition: { type: 'weather_catch', weather: 'bloodRain', count: 1 } },
  { id: 'weather_eclipse', name: '日蚀见证者', description: '在特殊天象下捕获', icon: '🌑', category: 'exploration', condition: { type: 'weather_catch', weather: 'eclipse', count: 1 }, generatedIcon: true },
  { id: 'weather_starfall', name: '星陨拾遗', description: '在流星雨中有所收获', icon: '💫', category: 'exploration', condition: { type: 'weather_catch', weather: 'starfall', count: 1 }, generatedIcon: true },
  { id: 'rich', name: '虚数富翁', description: '积累可观的财富', icon: '🏆', category: 'exploration', condition: { type: 'coins_reach', amount: 1000 } },
  { id: 'all_weather', name: '气象学者', description: '在各种天气下都有所经历', icon: '🌈', category: 'exploration', condition: { type: 'special', trigger: 'all_weather' }, generatedIcon: true },
  
  // 特殊类 - 高级成就（模糊描述）
  { id: 'consume_streak_5', name: '饕餮之徒', description: '持续沉溺于某种选择', icon: '😈', category: 'special', condition: { type: 'choice_streak', choice: 'consume', count: 5 }, generatedIcon: true },
  { id: 'collect_streak_5', name: '收藏狂热', description: '对收藏产生执念', icon: '🤑', category: 'special', condition: { type: 'choice_streak', choice: 'collect', count: 5 }, generatedIcon: true },
  { id: 'release_streak_5', name: '慈悲为怀', description: '始终选择仁慈', icon: '🕊️', category: 'special', condition: { type: 'choice_streak', choice: 'release', count: 5 }, generatedIcon: true },
  { id: 'inventory_hoarder', name: '囤积者', description: '???', icon: '📦', category: 'special', condition: { type: 'special', trigger: 'inventory_full' }, generatedIcon: true },
  { id: 'special_fish', name: '命运之鱼', description: '捕获带有特殊标记的存在', icon: '🔮', category: 'special', condition: { type: 'special', trigger: 'special_tag_fish' }, generatedIcon: true },
  
  // 收集价值成就 - 玩家目标：在不触发结局的情况下达到最高收集价值
  { id: 'value_100', name: '初窥门径', description: '收集价值达到100', icon: '📊', category: 'collection', condition: { type: 'collection_value', value: 100 } },
  { id: 'value_500', name: '价值收藏家', description: '在虚数海中积累一定价值', icon: '📈', category: 'collection', condition: { type: 'collection_value', value: 500 } },
  { id: 'value_1000', name: '海域鉴定师', description: '成为价值的评判者', icon: '🏅', category: 'collection', condition: { type: 'collection_value', value: 1000 }, generatedIcon: true },
  { id: 'value_2500', name: '珍宝守护者', description: '守护着无价的收藏', icon: '🛡️', category: 'collection', condition: { type: 'collection_value', value: 2500 }, generatedIcon: true },
  { id: 'value_5000', name: '虚数海之主', description: '成为这片海域真正的主人', icon: '👑', category: 'collection', condition: { type: 'collection_value', value: 5000 }, generatedIcon: true },
  { id: 'value_10000', name: '超越命运', description: '打破了虚数海的法则', icon: '🌌', category: 'collection', condition: { type: 'collection_value', value: 10000 }, generatedIcon: true },
];

// 初始统计
const initialStats: GameStats = {
  totalCatches: 0,
  consumedCount: 0,
  collectedCount: 0,
  releasedCount: 0,
  rarityStats: {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythical: 0,
  },
  weatherStats: {
    sunny: 0,
    bloodRain: 0,
    fog: 0,
    storm: 0,
    aurora: 0,
    eclipse: 0,
    starfall: 0,
  },
  // 标签相关统计
  positiveTagsConsumed: 0,
  negativeTagsReleased: 0,
  positiveTagsReleased: 0,
  negativeTagsConsumed: 0,
  // 收集价值记录
  totalCollectionValue: 0,
  highestCollectionValue: 0,
  currentRunValue: 0,
  choiceStreak: { choice: null, count: 0 },
};

// 正面标签列表
const POSITIVE_TAGS = ['innocent', 'healer', 'guardian', 'artist', 'sage', 'martyr', 'lover', 'dreamer'];
// 负面标签列表
const NEGATIVE_TAGS = ['tyrant', 'betrayer', 'murderer', 'thief', 'deceiver', 'coward', 'glutton', 'wrathful'];

// 判断是否为正面标签
function isPositiveTag(tag: string): boolean {
  return POSITIVE_TAGS.includes(tag);
}

// 判断是否为负面标签
function isNegativeTag(tag: string): boolean {
  return NEGATIVE_TAGS.includes(tag);
}

// 初始状态
const initialState: Omit<GameState, 'fishingSpot' | 'fishingProgress' | 'currentRarityBonus'> & {
  fishingSpot: 'shallow' | 'deep' | 'mystic';
  fishingProgress: number;
  currentRarityBonus: number;
} = {
  phase: 'idle',
  weather: {
    ...WEATHER_CONFIG.sunny,
    intensity: 0.5,
    transitionProgress: 1,
  },
  currentFish: null,
  visibleStats: {
    stamina: 100,
    coins: 0,
    fishCaught: 0,
  },
  karmaStats: {
    gluttony: 0,
    greed: 0,
    mercy: 0,
  },
  inventory: {
    fish: [],
    maxCapacity: 5,
    overflowRounds: 0,
  },
  collection: [],
  bestiary: [],
  achievements: ACHIEVEMENTS,
  unlockedAchievements: [],
  stats: initialStats,
  logs: [],
  ending: null,
  streamingContent: '',
  isStreaming: false,
  releaseStoryFish: null,
  caughtMythicalFish: [],
  moonClickCount: 0,
  fishingSpot: 'shallow',
  fishingProgress: 0,
  currentRarityBonus: 0,
};

interface GameActions {
  // Game phase control
  setPhase: (phase: GamePhase) => void;
  
  // Weather system
  updateWeather: () => void;
  setWeather: (weather: WeatherState) => void;
  updateWeatherByKarma: () => void;
  startWeatherTransition: (newType: WeatherType) => void;
  
  // Fishing process
  castRod: (spot: 'shallow' | 'deep' | 'mystic') => void;
  catchFish: (fish: Fish) => void;
  makeChoice: (choice: PlayerChoice) => void;
  
  // Stat updates
  updateStamina: (delta: number) => void;
  updateCoins: (delta: number) => void;
  updateKarma: (type: keyof GameState['karmaStats'], delta: number) => void;
  
  // Collection & Bestiary
  addToCollection: (fish: Fish) => void;
  updateBestiary: (fish: Fish) => void;
  
  // Inventory system (背包)
  addToInventory: (fish: Fish) => boolean; // 返回是否成功添加
  removeFromInventory: (fishId: string) => void;
  consumeFromInventory: (fishId: string) => void;
  releaseFromInventory: (fishId: string) => void;
  replaceInInventory: (oldFishId: string, newFish: Fish) => void;
  checkInventoryOverflow: () => void;
  
  // Achievement system
  checkAchievements: () => void;
  unlockAchievement: (id: string) => void;
  
  // Log system
  addLog: (type: GameLog['type'], content: string) => void;
  
  // Ending system
  checkEnding: () => EndingType | null;
  triggerEnding: (ending: Ending) => void;
  
  // Streaming output
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (content: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  
  // Reset game
  resetGame: () => void;

  // Fishing progress
  setFishingProgress: (progress: number) => void;

  // Save/Load
  loadFromSave: (data: import('@/types').SaveData) => void;
  
  // Release story
  closeReleaseStory: () => void;
  
  // Moon easter egg
  incrementMoonClick: () => void;
}

// 天气过渡定时器
let weatherTransitionTimer: number | null = null;

export const useGameStore = create<GameState & GameActions & { 
  fishingSpot: 'shallow' | 'deep' | 'mystic';
  fishingProgress: number;
  currentRarityBonus: number;
}>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // Set game phase
        setPhase: (phase) => set({ phase }),

        // 随机更新天气
        updateWeather: () => {
          const types: WeatherType[] = ['sunny', 'bloodRain', 'fog', 'storm', 'aurora', 'eclipse', 'starfall'];
          const randomType = types[Math.floor(Math.random() * types.length)];
          get().startWeatherTransition(randomType);
        },

        // 开始天气过渡动画
        startWeatherTransition: (newType) => {
          const currentWeather = get().weather;
          
          if (currentWeather.type === newType) return;
          
          // 清除之前的过渡定时器
          if (weatherTransitionTimer) {
            clearInterval(weatherTransitionTimer);
          }
          
          // 设置过渡开始状态
          set({
            weather: {
              ...WEATHER_CONFIG[newType],
              intensity: currentWeather.intensity,
              transitionProgress: 0,
              previousType: currentWeather.type,
            },
          });
          
          // 渐进式过渡
          const startTime = Date.now();
          weatherTransitionTimer = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / WEATHER_TRANSITION_DURATION);
            
            set((state) => ({
              weather: {
                ...state.weather,
                transitionProgress: progress,
              },
            }));
            
            if (progress >= 1) {
              if (weatherTransitionTimer) {
                clearInterval(weatherTransitionTimer);
                weatherTransitionTimer = null;
              }
              // 过渡完成，清除previousType
              set((state) => ({
                weather: {
                  ...state.weather,
                  previousType: undefined,
                },
              }));
            }
          }, 50);
        },

        // 基于业力值动态调整天气（强度为0时才变化天气类型）
        updateWeatherByKarma: () => {
          const state = get();
          const { karmaStats, visibleStats, weather: currentWeather } = state;
          const { gluttony, greed, mercy } = karmaStats;
          const { coins, fishCaught } = visibleStats;
          
          // 每次抛竿降低天气强度
          const intensityDecay = 0.15 + Math.random() * 0.1;
          let newIntensity = Math.max(0, currentWeather.intensity - intensityDecay);
          
          // 只有当强度降至0或接近0时才切换天气类型
          const shouldChangeWeather = newIntensity <= 0.05;
          
          if (shouldChangeWeather) {
            // 基础权重 - 保持随机性
            const weatherWeights: Record<WeatherType, number> = {
              sunny: 18,
              bloodRain: 12,
              fog: 14,
              storm: 12,
              aurora: 14,
              eclipse: 8,
              starfall: 10,
            };
            
            // 随机波动因子
            Object.keys(weatherWeights).forEach((key) => {
              weatherWeights[key as WeatherType] += Math.random() * 10 - 5;
            });
            
            // 暴食值高 → 血雨和日蚀几率增加
            if (gluttony > 25) {
              weatherWeights.bloodRain += gluttony * 0.5;
              weatherWeights.eclipse += gluttony * 0.3;
              weatherWeights.sunny -= gluttony * 0.2;
            }
            
            // 贪婪值高 → 风暴和迷雾几率增加
            if (greed > 25) {
              weatherWeights.storm += greed * 0.4;
              weatherWeights.fog += greed * 0.3;
              weatherWeights.eclipse += greed * 0.2;
            }
            
            // 慈悲值高 → 极光和星陨几率增加
            if (mercy > 25) {
              weatherWeights.aurora += mercy * 0.5;
              weatherWeights.starfall += mercy * 0.4;
              weatherWeights.sunny += mercy * 0.3;
            }
            
            // 金币多 → 迷雾几率增加
            if (coins > 300) {
              weatherWeights.fog += Math.min(coins / 80, 20);
            }
            
            // 捕获数量多 → 稀有天气几率增加
            if (fishCaught > 5) {
              weatherWeights.eclipse += fishCaught * 0.5;
              weatherWeights.starfall += fishCaught * 0.3;
            }
            
            // 三者平衡时 → 星陨和极光几率增加
            const values = [gluttony, greed, mercy];
            const avg = values.reduce((a, b) => a + b, 0) / 3;
            const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 3;
            if (variance < 100 && avg > 15) {
              weatherWeights.starfall += 15;
              weatherWeights.aurora += 10;
            }
            
            // 确保所有权重为正
            Object.keys(weatherWeights).forEach((key) => {
              weatherWeights[key as WeatherType] = Math.max(3, weatherWeights[key as WeatherType]);
            });
            
            // 降低当前天气权重，鼓励变化
            weatherWeights[currentWeather.type] *= 0.4;
            
            // 根据权重随机选择天气
            const totalWeight = Object.values(weatherWeights).reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            let selectedWeather: WeatherType = 'sunny';
            
            for (const [weather, weight] of Object.entries(weatherWeights)) {
              random -= weight;
              if (random <= 0) {
                selectedWeather = weather as WeatherType;
                break;
              }
            }
            
            // 新天气的初始强度
            const totalKarma = gluttony + greed + mercy;
            newIntensity = Math.min(1, 0.6 + (totalKarma / 300) * 0.3 + Math.random() * 0.1);
            
            // 如果天气变化，开始平滑过渡
            if (selectedWeather !== currentWeather.type) {
              const weatherNames: Record<WeatherType, string> = {
                sunny: '晴空',
                bloodRain: '血雨',
                fog: '迷雾',
                storm: '风暴',
                aurora: '极光',
                eclipse: '日蚀',
                starfall: '星陨',
              };
              get().addLog('event', `天气渐变：${weatherNames[selectedWeather]}正在降临...`);
              get().startWeatherTransition(selectedWeather);
            }
          }
          
          // 更新强度
          set((state) => ({
            weather: {
              ...state.weather,
              intensity: newIntensity,
            },
          }));
        },
        
        // 特殊鱼触发天气变化（无视强度限制）
        forceWeatherChange: (weatherType: WeatherType) => {
          const weatherNames: Record<WeatherType, string> = {
            sunny: '晴空',
            bloodRain: '血雨',
            fog: '迷雾',
            storm: '风暴',
            aurora: '极光',
            eclipse: '日蚀',
            starfall: '星陨',
          };
          get().addLog('event', `神秘力量涌动，${weatherNames[weatherType]}突然降临！`);
          get().startWeatherTransition(weatherType);
          set((state) => ({
            weather: {
              ...state.weather,
              intensity: 0.8 + Math.random() * 0.2,
            },
          }));
        },

        setWeather: (weather) => set({ weather }),

        // Cast rod
        castRod: (spot) => {
          const state = get();
          if (state.visibleStats.stamina <= 0) {
            get().checkEnding();
            return;
          }
          
          let rarityBonus = 0;
          switch (spot) {
            case 'deep':
              rarityBonus = 20;
              break;
            case 'mystic':
              rarityBonus = 50;
              break;
            default:
              rarityBonus = 0;
          }

          set({ 
            phase: 'casting', 
            fishingSpot: spot, 
            currentRarityBonus: rarityBonus,
            fishingProgress: 0
          });
          get().updateStamina(-5);
          get().addLog('system', `在${spot === 'shallow' ? '浅水区' : spot === 'deep' ? '深水区' : '神秘区域'}抛竿，鱼线划破虚数之海的平静...`);
          
          // 更新天气
          get().updateWeatherByKarma();
          
          setTimeout(() => {
            set({ phase: 'waiting' });
          }, 1000);
        },

        // Catch fish
        catchFish: (fish) => {
          set({ 
            currentFish: fish,
            phase: 'dialogue',
          });
          get().addLog('catch', `捕获了 ${fish.name}！`);
          
          // 更新图鉴
          get().updateBestiary(fish);
          
          // 如果是神话稀有度，记录已捕获
          if (fish.rarity === 'mythical' && fish.templateId) {
            set((state) => ({
              caughtMythicalFish: [...state.caughtMythicalFish, fish.templateId!],
            }));
          }
          
          // 更新统计
          set((state) => ({
            stats: {
              ...state.stats,
              totalCatches: state.stats.totalCatches + 1,
              rarityStats: {
                ...state.stats.rarityStats,
                [fish.rarity]: state.stats.rarityStats[fish.rarity] + 1,
              },
              weatherStats: {
                ...state.stats.weatherStats,
                [fish.weather]: state.stats.weatherStats[fish.weather] + 1,
              },
            },
          }));
          
          // 检查成就
          get().checkAchievements();
        },

        // Make a choice - 精巧的业力平衡系统
        makeChoice: (choice) => {
          const state = get();
          const fish = state.currentFish;
          if (!fish) return;

          set({ phase: 'result' });

          // 更新选择连击
          const newStreak = state.stats.choiceStreak.choice === choice
            ? { choice, count: state.stats.choiceStreak.count + 1 }
            : { choice, count: 1 };

          // 判断标签类型
          const tag = fish.tag || 'wanderer';
          const isPositive = isPositiveTag(tag);
          const isNegative = isNegativeTag(tag);
          
          // 稀有度影响业力变化强度（稀有度越高，影响越大）
          const rarityMultiplier: Record<string, number> = {
            common: 1,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2,
            legendary: 2.5,
            mythical: 3,
          };
          const multiplier = rarityMultiplier[fish.rarity] || 1;

          switch (choice) {
            case 'consume': {
              // 消化效果 - 精巧的业力平衡系统
              const baseStamina = fish.attributes.hunger;
              
              if (isPositive) {
                // 消化善良灵魂：获得体力，但暴食和贪婪增加，慈悲减少
                const staminaGain = Math.floor(baseStamina * 1.1);
                const gluttonyGain = Math.floor((8 + Math.random() * 5) * multiplier);
                const mercyLoss = Math.floor((3 + Math.random() * 3) * multiplier);
                const greedGain = Math.floor((2 + Math.random() * 2) * multiplier); // 轻微贪婪增加
                
                get().updateStamina(staminaGain);
                get().updateKarma('gluttony', gluttonyGain);
                get().updateKarma('mercy', -mercyLoss);
                get().updateKarma('greed', greedGain);
                
                const messages = [
                  `它的记忆在你体内翻涌，你感到一阵说不清的不适...`,
                  `温暖的力量涌入，但随之而来的是空虚感...`,
                  `你仿佛听到了远处的叹息声...`,
                ];
                get().addLog('choice', `你吞噬了「${fish.name}」`);
                get().addLog('event', messages[Math.floor(Math.random() * messages.length)]);
                
                set((s) => ({
                  stats: { 
                    ...s.stats, 
                    consumedCount: s.stats.consumedCount + 1, 
                    positiveTagsConsumed: s.stats.positiveTagsConsumed + 1,
                    choiceStreak: newStreak 
                  },
                }));
              } else if (isNegative) {
                // 消化邪恶灵魂：获得更多体力，暴食增加少，但会轻微增加贪婪
                const staminaGain = Math.floor(baseStamina * 1.3);
                const gluttonyGain = Math.floor((4 + Math.random() * 3) * multiplier);
                const greedGain = Math.floor((3 + Math.random() * 4) * multiplier);
                const mercyGain = Math.floor((1 + Math.random() * 2) * multiplier); // 微小慈悲增加（净化）
                
                get().updateStamina(staminaGain);
                get().updateKarma('gluttony', gluttonyGain);
                get().updateKarma('greed', greedGain);
                get().updateKarma('mercy', mercyGain);
                
                const messages = [
                  `沉重的记忆被消化，化作纯粹的能量...`,
                  `你感到力量涌入，但似乎也带来了什么...`,
                  `它的痛苦在你体内平息了...`,
                ];
                get().addLog('choice', `你吞噬了「${fish.name}」`);
                get().addLog('event', messages[Math.floor(Math.random() * messages.length)]);
                
                set((s) => ({
                  stats: { 
                    ...s.stats, 
                    consumedCount: s.stats.consumedCount + 1, 
                    negativeTagsConsumed: s.stats.negativeTagsConsumed + 1,
                    choiceStreak: newStreak 
                  },
                }));
              } else {
                // 中性标签 = 平衡效果
                const staminaGain = Math.floor(baseStamina * 1.15);
                const gluttonyGain = Math.floor((6 + Math.random() * 4) * multiplier);
                
                get().updateStamina(staminaGain);
                get().updateKarma('gluttony', gluttonyGain);
                get().addLog('choice', `你吞噬了「${fish.name}」`);
                get().addLog('event', `体力恢复了，但你感到些许疲倦...`);
                
                set((s) => ({
                  stats: { ...s.stats, consumedCount: s.stats.consumedCount + 1, choiceStreak: newStreak },
                }));
              }
              break;
            }
              
            case 'collect': {
              // 收藏效果 - 贪婪值受稀有度和价值影响
              const addedToInventory = get().addToInventory(fish);
              
              if (addedToInventory) {
                // 基础贪婪值（5-12）+ 稀有度加成
                const baseGreed = 5 + Math.floor(Math.random() * 7);
                const greedGain = Math.floor(baseGreed * multiplier);
                
                // 收藏也会轻微增加暴食值（占有欲）
                const gluttonyGain = Math.floor((2 + Math.random() * 2) * multiplier);
                
                // 高价值鱼会增加更多贪婪
                const valueBonus = Math.floor(fish.attributes.value / 100);
                
                get().updateKarma('greed', greedGain + valueBonus);
                get().updateKarma('gluttony', gluttonyGain);
                get().addToCollection(fish);
                get().updateBestiary(fish);
                
                const messages = [
                  `你将「${fish.name}」小心翼翼地收入背包...`,
                  `看着它在背包中挣扎，你感到一丝满足...`,
                  `又一个珍贵的收藏品...`,
                ];
                get().addLog('choice', messages[Math.floor(Math.random() * messages.length)]);
                
                // 检查背包状态
                const inventory = get().inventory;
                if (inventory.fish.length > inventory.maxCapacity) {
                  get().addLog('system', `⚠️ 背包超载...它们在挣扎...`);
                }
              } else {
                get().addLog('system', `背包已满，无法收藏！`);
                return;
              }
              
              set((s) => ({
                stats: { ...s.stats, collectedCount: s.stats.collectedCount + 1, choiceStreak: newStreak },
              }));
              break;
            }
              
            case 'release': {
              // 放生效果 - 精巧的业力平衡系统
              if (isNegative) {
                // 放生邪恶灵魂：慈悲增加少，但贪婪和暴食会增加（纵容邪恶）
                const mercyGain = Math.floor((4 + Math.random() * 3) * multiplier);
                const greedGain = Math.floor((3 + Math.random() * 4) * multiplier);
                const gluttonyGain = Math.floor((2 + Math.random() * 2) * multiplier);
                
                get().updateKarma('mercy', mercyGain);
                get().updateKarma('greed', greedGain);
                get().updateKarma('gluttony', gluttonyGain);
                
                set((s) => ({
                  releaseStoryFish: fish,
                  stats: { 
                    ...s.stats, 
                    releasedCount: s.stats.releasedCount + 1, 
                    negativeTagsReleased: s.stats.negativeTagsReleased + 1,
                    choiceStreak: newStreak 
                  },
                }));
              } else if (isPositive) {
                // 放生善良灵魂：慈悲大幅增加，暴食减少，贪婪轻微减少
                const mercyGain = Math.floor((10 + Math.random() * 6) * multiplier);
                const gluttonyLoss = Math.floor((2 + Math.random() * 2) * multiplier);
                const greedLoss = Math.floor((1 + Math.random() * 2) * multiplier);
                
                get().updateKarma('mercy', mercyGain);
                get().updateKarma('gluttony', -gluttonyLoss);
                get().updateKarma('greed', -greedLoss);
                
                set((s) => ({
                  releaseStoryFish: fish,
                  stats: { 
                    ...s.stats, 
                    releasedCount: s.stats.releasedCount + 1, 
                    positiveTagsReleased: s.stats.positiveTagsReleased + 1,
                    choiceStreak: newStreak 
                  },
                }));
              } else {
                // 中性标签 = 平衡效果
                const mercyGain = Math.floor((7 + Math.random() * 5) * multiplier);
                
                get().updateKarma('mercy', mercyGain);
                
                set((s) => ({
                  releaseStoryFish: fish,
                  stats: { ...s.stats, releasedCount: s.stats.releasedCount + 1, choiceStreak: newStreak },
                }));
              }
              break;
            }
          }

          // Update fish caught count
          set((s) => ({
            visibleStats: {
              ...s.visibleStats,
              fishCaught: s.visibleStats.fishCaught + 1,
            },
          }));

          // Check achievements
          get().checkAchievements();

          // Check for ending - 如果有结局类型，立即切换到结局阶段
          const endingType = get().checkEnding();
          if (endingType) {
            // 触发结局
            set({ phase: 'ending', currentFish: null });
            // 结局叙事将由 EndingPanel 组件处理
          } else {
            // 没有结局，2秒后返回空闲状态
            setTimeout(() => {
              set({ phase: 'idle', currentFish: null });
            }, 2000);
          }
        },

        // Update stamina
        updateStamina: (delta) => {
          set((state) => ({
            visibleStats: {
              ...state.visibleStats,
              stamina: Math.max(0, Math.min(100, state.visibleStats.stamina + delta)),
            },
          }));
        },

        // Update coins
        updateCoins: (delta) => {
          set((state) => ({
            visibleStats: {
              ...state.visibleStats,
              coins: Math.max(0, state.visibleStats.coins + delta),
            },
          }));
          get().checkAchievements();
        },

        // Update karma values
        updateKarma: (type, delta) => {
          set((state) => ({
            karmaStats: {
              ...state.karmaStats,
              [type]: Math.min(100, state.karmaStats[type] + delta),
            },
          }));
          get().checkAchievements();
        },

        // Add to collection - 包含稀有度加成的收集价值计算
        addToCollection: (fish) => {
          set((state) => {
            // 稀有度加成系数
            const rarityMultiplier: Record<string, number> = {
              common: 1,
              uncommon: 1.5,
              rare: 2.5,
              epic: 4,
              legendary: 8,
              mythical: 15,
            };
            
            // 计算带稀有度加成的收集价值
            const baseValue = fish.attributes.value;
            const multiplier = rarityMultiplier[fish.rarity] || 1;
            const bonusValue = Math.floor(baseValue * multiplier);
            
            // 图鉴首次发现额外加成
            const isNewToCollection = !state.bestiary.some(b => b.fishName === fish.name);
            const discoveryBonus = isNewToCollection ? 50 : 0;
            
            const totalValueGain = bonusValue + discoveryBonus;
            const newTotalValue = state.stats.totalCollectionValue + totalValueGain;
            const newRunValue = state.stats.currentRunValue + totalValueGain;
            
            // 更新历史最高收集价值
            const newHighestValue = Math.max(state.stats.highestCollectionValue, newRunValue);
            
            return {
              collection: [...state.collection, fish],
              stats: {
                ...state.stats,
                totalCollectionValue: newTotalValue,
                currentRunValue: newRunValue,
                highestCollectionValue: newHighestValue,
              },
            };
          });
          get().checkAchievements();
        },

        // Update bestiary (图鉴)
        updateBestiary: (fish) => {
          set((state) => {
            const existingEntry = state.bestiary.find(e => e.fishName === fish.name);
            
            if (existingEntry) {
              // 更新已有条目
              return {
                bestiary: state.bestiary.map(e => 
                  e.fishName === fish.name
                    ? {
                        ...e,
                        catchCount: e.catchCount + 1,
                        lastCaughtAt: Date.now(),
                        rarities: e.rarities.includes(fish.rarity) 
                          ? e.rarities 
                          : [...e.rarities, fish.rarity],
                        weathers: e.weathers.includes(fish.weather)
                          ? e.weathers
                          : [...e.weathers, fish.weather],
                        bestStory: fish.loreFragment.length > e.bestStory.length 
                          ? fish.loreFragment 
                          : e.bestStory,
                        imageUrl: fish.imageUrl || e.imageUrl,
                      }
                    : e
                ),
              };
            } else {
              // 添加新条目
              const newEntry: BestiaryEntry = {
                fishName: fish.name,
                firstCaughtAt: Date.now(),
                catchCount: 1,
                lastCaughtAt: Date.now(),
                rarities: [fish.rarity],
                weathers: [fish.weather],
                bestStory: fish.loreFragment,
                imageUrl: fish.imageUrl,
              };
              return {
                bestiary: [...state.bestiary, newEntry],
              };
            }
          });
        },

        // ============================================
        // 背包系统 (Inventory)
        // ============================================

        // 添加到背包
        addToInventory: (fish) => {
          const state = get();
          const { inventory } = state;
          
          // 检查是否可以添加（允许超额1条，即最多6条）
          if (inventory.fish.length >= inventory.maxCapacity + 1) {
            get().addLog('system', '背包已满，无法收藏更多！');
            return false;
          }
          
          // 添加到背包
          set((prevState) => ({
            inventory: {
              ...prevState.inventory,
              fish: [...prevState.inventory.fish, fish],
            },
          }));
          
          // 检查超额状态
          get().checkInventoryOverflow();
          
          return true;
        },

        // 从背包移除
        removeFromInventory: (fishId) => {
          set((state) => ({
            inventory: {
              ...state.inventory,
              fish: state.inventory.fish.filter(f => f.id !== fishId),
            },
          }));
        },

        // 从背包中消化鱼
        consumeFromInventory: (fishId) => {
          const state = get();
          const fish = state.inventory.fish.find(f => f.id === fishId);
          
          if (!fish) return;
          
          // 恢复饥饿度，增加暴食值
          get().updateStamina(fish.attributes.hunger);
          get().updateKarma('gluttony', Math.ceil(fish.attributes.hunger / 3));
          
          // 从背包移除
          get().removeFromInventory(fishId);
          
          // 如果正好回到上限，重置超额计数
          if (get().inventory.fish.length <= get().inventory.maxCapacity) {
            set((prevState) => ({
              inventory: {
                ...prevState.inventory,
                overflowRounds: 0,
              },
            }));
          }
          
          get().addLog('choice', `从背包中消化了「${fish.name}」，恢复了${fish.attributes.hunger}点体力`);
        },

        // 从背包中放生鱼
        releaseFromInventory: (fishId) => {
          const state = get();
          const fish = state.inventory.fish.find(f => f.id === fishId);
          
          if (!fish) return;
          
          // 增加慈悲值
          get().updateKarma('mercy', 8);
          
          // 从背包移除
          get().removeFromInventory(fishId);
          
          // 如果正好回到上限，重置超额计数
          if (get().inventory.fish.length <= get().inventory.maxCapacity) {
            set((prevState) => ({
              inventory: {
                ...prevState.inventory,
                overflowRounds: 0,
              },
            }));
          }
          
          get().addLog('choice', `从背包中放生了「${fish.name}」，它游向了虚数海深处...`);
        },

        // 替换背包中的鱼
        replaceInInventory: (oldFishId, newFish) => {
          set((state) => ({
            inventory: {
              ...state.inventory,
              fish: state.inventory.fish.map(f => 
                f.id === oldFishId ? newFish : f
              ),
            },
          }));
          get().addLog('system', `背包中的鱼被替换了`);
        },

        // 检查背包超额状态
        checkInventoryOverflow: () => {
          const state = get();
          const { inventory } = state;
          
          if (inventory.fish.length > inventory.maxCapacity) {
            // 超额存储
            const newOverflowRounds = inventory.overflowRounds + 1;
            
            set((prevState) => ({
              inventory: {
                ...prevState.inventory,
                overflowRounds: newOverflowRounds,
              },
            }));
            
            get().addLog('system', `⚠️ 背包超额！(${newOverflowRounds}/3)`);
            
            // 连续3回合超额触发结局
            if (newOverflowRounds >= 3) {
              get().addLog('event', '囤积的执念吞噬了你的灵魂...');
              get().triggerEnding({
                type: 'hoarder',
                title: '囤积者的终末',
                narrative: '',
              });
            }
          } else {
            // 未超额，重置计数
            set((prevState) => ({
              inventory: {
                ...prevState.inventory,
                overflowRounds: 0,
              },
            }));
          }
        },

        // Check achievements
        checkAchievements: () => {
          const state = get();
          const { stats, karmaStats, visibleStats, bestiary, unlockedAchievements } = state;
          
          state.achievements.forEach((achievement) => {
            if (unlockedAchievements.includes(achievement.id)) return;
            
            let unlocked = false;
            const cond = achievement.condition;
            
            switch (cond.type) {
              case 'fish_count':
                unlocked = stats.totalCatches >= cond.count;
                break;
              case 'rarity_catch':
                unlocked = stats.rarityStats[cond.rarity] >= cond.count;
                break;
              case 'weather_catch':
                unlocked = stats.weatherStats[cond.weather] >= cond.count;
                break;
              case 'karma_reach':
                unlocked = karmaStats[cond.karma] >= cond.value;
                break;
              case 'karma_balance': {
                const values = [karmaStats.gluttony, karmaStats.greed, karmaStats.mercy];
                const avg = values.reduce((a, b) => a + b, 0) / 3;
                const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 3;
                unlocked = variance <= cond.variance && avg >= 20;
                break;
              }
              case 'coins_reach':
                unlocked = visibleStats.coins >= cond.amount;
                break;
              case 'unique_fish':
                unlocked = bestiary.length >= cond.count;
                break;
              case 'choice_streak':
                unlocked = stats.choiceStreak.choice === cond.choice && 
                          stats.choiceStreak.count >= cond.count;
                break;
              case 'collection_value':
                unlocked = stats.currentRunValue >= cond.value;
                break;
            }
            
            if (unlocked) {
              get().unlockAchievement(achievement.id);
            }
          });
        },

        // Unlock achievement
        unlockAchievement: (id) => {
          const achievement = get().achievements.find(a => a.id === id);
          if (!achievement || get().unlockedAchievements.includes(id)) return;
          
          set((state) => ({
            unlockedAchievements: [...state.unlockedAchievements, id],
            achievements: state.achievements.map(a => 
              a.id === id ? { ...a, unlockedAt: Date.now() } : a
            ),
          }));
          
          get().addLog('event', `🏆 成就解锁：${achievement.name}！`);
        },

        // Add log entry
        addLog: (type, content) => {
          const log: GameLog = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            type,
            content,
          };
          set((state) => ({
            logs: [...state.logs.slice(-50), log],
          }));
        },

        // Check ending conditions
        checkEnding: () => {
          const state = get();
          const { karmaStats, visibleStats, stats, inventory } = state;

          let endingType: EndingType | null = null;

          // 体力耗尽（优先级最高）
          if (visibleStats.stamina <= STAMINA_THRESHOLD) {
            endingType = 'void';
          }
          // 囤积者结局 - 连续超额存储3回合
          else if (inventory.overflowRounds >= 3) {
            endingType = 'hoarder';
          }
          // 新结局：吞噬者 - 消化太多正面标签鱼（>=10）
          else if (stats.positiveTagsConsumed >= 10) {
            endingType = 'devourer';
          }
          // 新结局：堕落者 - 放生太多负面标签鱼（>=10）
          else if (stats.negativeTagsReleased >= 10) {
            endingType = 'corruptor';
          }
          // 暴食结局
          else if (karmaStats.gluttony >= KARMA_THRESHOLD) {
            endingType = 'descent';
          }
          // 贪婪结局
          else if (karmaStats.greed >= KARMA_THRESHOLD) {
            endingType = 'avarice';
          }
          // 觉悟结局 - 慈悲高且放生了足够多的正面鱼
          else if (karmaStats.mercy >= KARMA_THRESHOLD && stats.positiveTagsReleased >= 5) {
            endingType = 'ascension';
          }
          // 平衡结局
          else {
            const values = [karmaStats.gluttony, karmaStats.greed, karmaStats.mercy];
            const avg = values.reduce((a, b) => a + b, 0) / 3;
            const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 3;
            
            if (avg >= 50 && variance <= 100) {
              endingType = 'balance';
            }
          }

          // 如果检测到结局，保存结局类型到状态中（供 EndingPanel 使用）
          if (endingType) {
            set({ 
              ending: { 
                type: endingType, 
                title: '', 
                narrative: '' 
              } 
            });
          }

          return endingType;
        },

        // Trigger ending
        triggerEnding: (ending) => {
          set({
            phase: 'ending',
            ending,
          });
          get().addLog('system', `触发结局：${ending.title}`);
        },

        // Streaming output control
        setStreamingContent: (content) => set({ streamingContent: content }),
        appendStreamingContent: (content) => set((state) => ({ 
          streamingContent: state.streamingContent + content 
        })),
        setIsStreaming: (isStreaming) => set({ isStreaming }),

        // Reset game - 完全重置所有状态
        resetGame: () => {
          if (weatherTransitionTimer) {
            clearInterval(weatherTransitionTimer);
            weatherTransitionTimer = null;
          }
          
          // 完全重置为初始状态
          set({
            ...initialState,
            // 确保这些状态也被重置
            phase: 'idle',
            currentFish: null,
            ending: null,
            streamingContent: '',
            isStreaming: false,
            releaseStoryFish: null,
            moonClickCount: 0, // 重置月亮点击计数
          });
        },
        
        // Close release story panel
        closeReleaseStory: () => {
          set({ releaseStoryFish: null, phase: 'idle' });
        },
        
        // Increment moon click count (彩蛋)
        incrementMoonClick: () => {
          const state = get();
          const newCount = state.moonClickCount + 1;
          
          if (newCount === 7) {
            // 触发隐藏结局
            get().addLog('event', `✨ 月亮的光芒突然变得耀眼...`);
            
            set({
              moonClickCount: newCount,
              phase: 'ending',
              currentFish: null, // 清除当前鱼
              ending: {
                type: 'moonSecret',
                title: '月之秘密',
                narrative: '',
              },
            });
          } else {
            // 提示进度
            get().addLog('event', `月亮似乎在注视着你... (${newCount}/7)`);
            set({ moonClickCount: newCount });
          }
        },

        // Set fishing progress
        setFishingProgress: (progress) => set({ fishingProgress: progress }),

        // Load from save
        loadFromSave: (data) => {
          if (weatherTransitionTimer) {
            clearInterval(weatherTransitionTimer);
            weatherTransitionTimer = null;
          }
          set({
            phase: 'idle',
            weather: data.weather,
            currentFish: null,
            visibleStats: data.visibleStats,
            karmaStats: data.karmaStats,
            collection: data.collection,
            bestiary: data.bestiary,
            unlockedAchievements: data.unlockedAchievements,
            stats: data.stats,
            logs: data.logs,
            ending: null,
            streamingContent: '',
            isStreaming: false,
            fishingSpot: 'shallow',
            fishingProgress: 0,
            currentRarityBonus: 0,
          });
        },
      }),
      {
        name: 'imaginary-sea-raft-storage',
        partialize: (state) => ({
          bestiary: state.bestiary,
          unlockedAchievements: state.unlockedAchievements,
          stats: state.stats,
        }),
      }
    )
  )
);

// Selectors
export const selectPhase = (state: GameState) => state.phase;
export const selectWeather = (state: GameState) => state.weather;
export const selectCurrentFish = (state: GameState) => state.currentFish;
export const selectVisibleStats = (state: GameState) => state.visibleStats;
export const selectKarmaStats = (state: GameState) => state.karmaStats;
export const selectCollection = (state: GameState) => state.collection;
export const selectBestiary = (state: GameState) => state.bestiary;
export const selectAchievements = (state: GameState) => state.achievements;
export const selectUnlockedAchievements = (state: GameState) => state.unlockedAchievements;
export const selectLogs = (state: GameState) => state.logs;
export const selectEnding = (state: GameState) => state.ending;
