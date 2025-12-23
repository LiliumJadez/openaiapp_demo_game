// ============================================
// 虚数海筏 - 核心类型定义
// ============================================

// 天气类型 (7种)
export type WeatherType = 'sunny' | 'bloodRain' | 'fog' | 'storm' | 'aurora' | 'eclipse' | 'starfall';

export interface WeatherState {
  type: WeatherType;
  intensity: number; // 0-1
  description: string;
  mysticalEffect: string; // 神秘效果描述
  transitionProgress?: number; // 天气过渡进度 0-1
  previousType?: WeatherType; // 上一个天气（用于过渡）
}

// ============================================
// 成就系统
// ============================================

export type AchievementCategory = 'collection' | 'karma' | 'exploration' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // 默认emoji图标
  generatedIcon?: boolean; // 是否使用生成的图像图标
  generatedIconUrl?: string; // 生成的图像URL
  category: AchievementCategory;
  condition: AchievementCondition;
  reward?: string;
  unlockedAt?: number; // 解锁时间戳
}

export type AchievementCondition = 
  | { type: 'fish_count'; count: number }
  | { type: 'rarity_catch'; rarity: FishRarity; count: number }
  | { type: 'weather_catch'; weather: WeatherType; count: number }
  | { type: 'karma_reach'; karma: keyof KarmaStats; value: number }
  | { type: 'karma_balance'; variance: number }
  | { type: 'coins_reach'; amount: number }
  | { type: 'unique_fish'; count: number }
  | { type: 'choice_streak'; choice: PlayerChoice; count: number }
  | { type: 'collection_value'; value: number }  // 收集价值成就
  | { type: 'special'; trigger: string };

// ============================================
// 图鉴系统
// ============================================

export interface BestiaryEntry {
  fishName: string;
  firstCaughtAt: number;
  catchCount: number;
  lastCaughtAt: number;
  rarities: FishRarity[]; // 捕获过的稀有度变体
  weathers: WeatherType[]; // 在哪些天气下捕获过
  bestStory: string; // 最佳故事（最长/最有趣的）
  imageUrl?: string;
}

// 鱼类稀有度
export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical';

// 鱼类性格
export type FishPersonality = 'pleading' | 'tempting' | 'mysterious' | 'aggressive' | 'wise' | 'innocent';

// 鱼类标签（反映生前品性）
export type FishTag = 
  | 'innocent' | 'healer' | 'guardian' | 'artist' | 'sage' | 'martyr' | 'lover' | 'dreamer'  // 正面
  | 'tyrant' | 'betrayer' | 'murderer' | 'thief' | 'deceiver' | 'coward' | 'glutton' | 'wrathful'  // 负面
  | 'wanderer' | 'forgotten' | 'seeker' | 'regretful';  // 中性

// 鱼类对象
export interface Fish {
  id: string;
  templateId?: string;  // 预设鱼类模板ID
  originalName?: string; // 原名（旧世界的人类姓名）
  name: string;  // 鱼的形态名称
  rarity: FishRarity;
  personality: FishPersonality;
  tag: FishTag;  // 标签（决定效果）
  dialogue: string; // 求饶或诱惑台词
  loreFragment: string; // 身世碎片（100-200字）
  visualKeywords?: string; // 视觉关键词
  imageUrl?: string; // 生物卡牌图像
  attributes: {
    hunger: number; // 可恢复的饥饿度
    value: number;  // 金币价值
    intel: string;  // 情报内容
  };
  weather: WeatherType; // 捕获时的天气
  timestamp: number;
}

// 玩家抉择
export type PlayerChoice = 'consume' | 'collect' | 'release';

// 显性数值
export interface VisibleStats {
  stamina: number;     // 体力 0-100
  coins: number;       // 金币
  fishCaught: number;  // 总捕获数
}

// 隐性业力值
export interface KarmaStats {
  gluttony: number;  // 暴食值 0-100
  greed: number;     // 贪婪值 0-100
  mercy: number;     // 慈悲值 0-100
}

// 结局类型
export type EndingType = 
  | 'descent'      // 沉沦结局 - 暴食过高
  | 'avarice'      // 贪婪结局 - 贪婪过高
  | 'ascension'    // 觉悟结局 - 慈悲过高
  | 'balance'      // 平衡结局 - 三者均衡
  | 'void'         // 虚无结局 - 体力耗尽
  | 'hoarder'      // 囤积者结局 - 连续3回合超额存储
  | 'corruptor'    // 堕落结局 - 放生太多负面标签鱼（纵容邪恶）
  | 'devourer'     // 吞噬者结局 - 消化太多正面标签鱼（吞噬善良）
  | 'moonSecret';  // 月之秘密结局 - 点击月亮7次（隐藏彩蛋）

export interface Ending {
  type: EndingType;
  title: string;
  narrative: string; // 结局叙事
  imageUrl?: string;
}

// 游戏阶段
export type GamePhase = 
  | 'idle'         // 空闲状态，等待抛竿
  | 'casting'      // 抛竿中
  | 'waiting'      // 等待上钩
  | 'catching'     // 捕获中（拉扯博弈）
  | 'dialogue'     // 对话阶段（展示鱼的台词）
  | 'choice'       // 抉择阶段
  | 'result'       // 展示结果
  | 'ending';      // 游戏结局

// 背包系统
export interface Inventory {
  fish: Fish[];       // 背包中的鱼，上限5条
  maxCapacity: number; // 最大容量（5）
  overflowRounds: number; // 连续超额存储的回合数
}

// 游戏全局状态
export interface GameState {
  // 游戏阶段
  phase: GamePhase;
  
  // 天气
  weather: WeatherState;
  
  // 当前捕获的鱼
  currentFish: Fish | null;
  
  // 玩家数值
  visibleStats: VisibleStats;
  karmaStats: KarmaStats;
  
  // 背包（收藏的鱼，上限5条+1超额）
  inventory: Inventory;
  
  // 收藏的鱼（历史记录）
  collection: Fish[];
  
  // 图鉴（去重后的鱼类记录）
  bestiary: BestiaryEntry[];
  
  // 成就
  achievements: Achievement[];
  unlockedAchievements: string[]; // 已解锁的成就ID
  
  // 统计数据
  stats: GameStats;
  
  // 游戏日志
  logs: GameLog[];
  
  // 结局（如果已触发）
  ending: Ending | null;
  
  // 流式输出内容
  streamingContent: string;
  isStreaming: boolean;
  
  // 放生故事显示
  releaseStoryFish: Fish | null;
  
  // 神话稀有度鱼类追踪（每种只能出现一次）
  caughtMythicalFish: string[]; // 已捕获的神话稀有度鱼的ID列表
  
  // 月亮彩蛋
  moonClickCount: number; // 月亮点击次数
}

// 游戏统计
export interface GameStats {
  totalCatches: number;
  consumedCount: number;
  collectedCount: number;
  releasedCount: number;
  rarityStats: Record<FishRarity, number>;
  weatherStats: Record<WeatherType, number>;
  choiceStreak: { choice: PlayerChoice | null; count: number };
  // 标签相关统计 - 用于判定结局
  positiveTagsConsumed: number;  // 消化的正面标签鱼数量
  negativeTagsReleased: number; // 放生的负面标签鱼数量
  positiveTagsReleased: number; // 放生的正面标签鱼数量（好结局加成）
  negativeTagsConsumed: number; // 消化的负面标签鱼数量（净化）
  // 收集价值记录
  totalCollectionValue: number;   // 当前总收集价值
  highestCollectionValue: number; // 历史最高收集价值（不触发结局情况下）
  currentRunValue: number;        // 当前回合收集价值
}

// 游戏日志条目
export interface GameLog {
  id: string;
  timestamp: number;
  type: 'catch' | 'choice' | 'event' | 'system';
  content: string;
}

// API 请求/响应类型
export interface GenerateFishRequest {
  weather: WeatherState;
  playerStats: {
    visible: VisibleStats;
    karma: KarmaStats;
  };
}

export interface GenerateFishResponse {
  fish: Fish;
  imageUrl?: string;
}

export interface GenerateEndingRequest {
  endingType: EndingType;
  playerStats: {
    visible: VisibleStats;
    karma: KarmaStats;
  };
  collection: Fish[];
}

// MCP 工具定义
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// ChatGPT Widget 消息
export interface WidgetMessage {
  type: 'tool_call' | 'tool_result' | 'user_message' | 'assistant_message';
  content: unknown;
}

// ============================================
// 存档系统
// ============================================

export interface SaveSlot {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  playTime: number; // 游戏时长（秒）
  preview: {
    fishCaught: number;
    coins: number;
    karmaStatus: string; // '暴食倾向' | '贪婪倾向' | '慈悲倾向' | '平衡'
    bestiaryCount: number;
    achievementCount: number;
  };
  data: SaveData;
}

export interface SaveData {
  visibleStats: VisibleStats;
  karmaStats: KarmaStats;
  collection: Fish[];
  bestiary: BestiaryEntry[];
  unlockedAchievements: string[];
  stats: GameStats;
  weather: WeatherState;
  logs: GameLog[];
}

export interface SaveManager {
  slots: SaveSlot[];
  maxSlots: number;
  autoSaveEnabled: boolean;
  lastAutoSave: number | null;
}

