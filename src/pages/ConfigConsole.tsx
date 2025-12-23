import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '@/services/audioManager';

// 游戏配置接口
interface GameConfig {
  // 稀有度概率
  rarity: {
    mythical: number;
    legendary: number;
    epic: number;
    rare: number;
    uncommon: number;
    common: number;
  };
  
  // 业力阈值
  karma: {
    threshold: number;
    staminaThreshold: number;
  };
  
  // 钓鱼难度 - 按稀有度
  fishing: {
    common: FishingDifficulty;
    uncommon: FishingDifficulty;
    rare: FishingDifficulty;
    epic: FishingDifficulty;
    legendary: FishingDifficulty;
    mythical: FishingDifficulty;
  };
  
  // 业力影响强度
  karmaEffects: {
    consume: {
      positive: { gluttony: [number, number]; mercy: [number, number]; greed: [number, number] };
      negative: { gluttony: [number, number]; mercy: [number, number]; greed: [number, number] };
      neutral: { gluttony: [number, number] };
    };
    collect: {
      base: { greed: [number, number]; gluttony: [number, number] };
    };
    release: {
      positive: { mercy: [number, number]; gluttony: [number, number]; greed: [number, number] };
      negative: { mercy: [number, number]; greed: [number, number]; gluttony: [number, number] };
      neutral: { mercy: [number, number] };
    };
  };
  
  // 结局触发条件
  endings: {
    positiveTagsConsumed: number;
    negativeTagsReleased: number;
    hoarderRounds: number;
    moonClicks: number;
  };
  
  // AI 提示词
  prompts: {
    fishPersonalization: string;
    fishImageGeneration: string;
    endingNarrative: string;
  };
  
  // BGM 配置
  audio: {
    volume: number;
    fadeTime: number;
    weather: Partial<Record<string, string>>;
    endings: Partial<Record<string, string>>;
  };
}

interface FishingDifficulty {
  fishSpeed: number;
  fishAcceleration: number;
  fishErraticness: number;
  fishJumpChance: number;
  barSize: number;
  barGravity: number;
  barBounce: number;
  barLift: number;
  progressGain: number;
  progressLoss: number;
}

// 默认配置
const DEFAULT_CONFIG: GameConfig = {
  rarity: {
    mythical: 0.001,
    legendary: 0.01,
    epic: 0.05,
    rare: 0.15,
    uncommon: 0.40,
    common: 1.0,
  },
  karma: {
    threshold: 80,
    staminaThreshold: 0,
  },
  fishing: {
    common: {
      fishSpeed: 0.8,
      fishAcceleration: 0.3,
      fishErraticness: 0.03,
      fishJumpChance: 0.001,
      barSize: 45,
      barGravity: 0.08,
      barBounce: 0.4,
      barLift: 0.25,
      progressGain: 0.6,
      progressLoss: 0.12,
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
      progressGain: 0.5,
      progressLoss: 0.14,
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
      progressGain: 0.42,
      progressLoss: 0.16,
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
      progressGain: 0.35,
      progressLoss: 0.2,
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
      progressGain: 0.3,
      progressLoss: 0.22,
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
      progressGain: 0.25,
      progressLoss: 0.25,
    },
  },
  karmaEffects: {
    consume: {
      positive: { gluttony: [8, 5], mercy: [3, 3], greed: [2, 2] },
      negative: { gluttony: [4, 3], mercy: [1, 2], greed: [3, 4] },
      neutral: { gluttony: [6, 4] },
    },
    collect: {
      base: { greed: [5, 7], gluttony: [2, 2] },
    },
    release: {
      positive: { mercy: [10, 6], gluttony: [2, 2], greed: [1, 2] },
      negative: { mercy: [4, 3], greed: [3, 4], gluttony: [2, 2] },
      neutral: { mercy: [7, 5] },
    },
  },
  endings: {
    positiveTagsConsumed: 10,
    negativeTagsReleased: 10,
    hoarderRounds: 3,
    moonClicks: 7,
  },
  prompts: {
    fishPersonalization: '为鱼生成独特的原名和故事...',
    fishImageGeneration: '生成鱼的图像...',
    endingNarrative: '生成结局叙事...',
  },
  audio: {
    volume: 0.5,
    fadeTime: 2000,
    weather: {
      sunny: '/audio/weather/sunny.mp3',
      bloodRain: '/audio/weather/blood-rain.mp3',
      fog: '/audio/weather/fog.mp3',
      storm: '/audio/weather/storm.mp3',
      aurora: '/audio/weather/aurora.mp3',
      eclipse: '/audio/weather/eclipse.mp3',
      starfall: '/audio/weather/starfall.mp3',
    },
    endings: {
      descent: '/audio/endings/descent.mp3',
      avarice: '/audio/endings/avarice.mp3',
      ascension: '/audio/endings/ascension.mp3',
      balance: '/audio/endings/balance.mp3',
      void: '/audio/endings/void.mp3',
      hoarder: '/audio/endings/hoarder.mp3',
      devourer: '/audio/endings/devourer.mp3',
      corruptor: '/audio/endings/corruptor.mp3',
      moonSecret: '/audio/endings/moon-secret.mp3',
    },
  },
};

export function ConfigConsole() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'rarity' | 'karma' | 'fishing' | 'endings' | 'prompts' | 'audio'>('rarity');

  // 加载音频配置
  useEffect(() => {
    const audioConfig = audioManager.getConfig();
    setConfig((prev) => ({
      ...prev,
      audio: {
        volume: audioConfig.volume,
        fadeTime: audioConfig.fadeTime,
        weather: audioConfig.weather,
        endings: audioConfig.endings,
      },
    }));
  }, []);

  // 应用音频配置到audioManager
  const applyAudioConfig = () => {
    audioManager.saveConfig({
      volume: config.audio.volume,
      fadeTime: config.audio.fadeTime,
      weather: config.audio.weather as any,
      endings: config.audio.endings as any,
    });
    alert('音频配置已应用！');
  };

  const exportConfig = () => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setConfig(imported);
        alert('配置导入成功！');
      } catch (error) {
        alert('配置文件格式错误！');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-abyss-950 via-abyss-900 to-abyss-800 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto pb-16">
        {/* 头部 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-title font-bold text-abyss-100 mb-2">
            🎮 虚数海筏 - 游戏配置控制台
          </h1>
          <p className="text-abyss-400">
            调整所有游戏参数、概率分布和AI提示词
          </p>
          
          {/* 操作按钮 */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <button
              onClick={applyAudioConfig}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold"
            >
              🎵 应用音频配置
            </button>
            <button
              onClick={exportConfig}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              📥 导出配置
            </button>
            <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors">
              📤 导入配置
              <input
                type="file"
                accept=".json"
                onChange={importConfig}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setConfig(DEFAULT_CONFIG)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              🔄 重置为默认
            </button>
          </div>
        </motion.div>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'rarity', label: '📊 稀有度概率' },
            { key: 'karma', label: '⚖️ 业力系统' },
            { key: 'fishing', label: '🎣 钓鱼难度' },
            { key: 'endings', label: '🏁 结局触发' },
            { key: 'audio', label: '🎵 BGM音乐' },
            { key: 'prompts', label: '💬 AI提示词' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-abyss-600 text-white shadow-lg'
                  : 'bg-abyss-800/50 text-abyss-400 hover:bg-abyss-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 配置内容 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
          style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}
        >
          {activeTab === 'rarity' && <RarityConfig config={config} setConfig={setConfig} />}
          {activeTab === 'karma' && <KarmaConfig config={config} setConfig={setConfig} />}
          {activeTab === 'fishing' && <FishingConfig config={config} setConfig={setConfig} />}
          {activeTab === 'endings' && <EndingsConfig config={config} setConfig={setConfig} />}
          {activeTab === 'audio' && <AudioConfig config={config} setConfig={setConfig} />}
          {activeTab === 'prompts' && <PromptsConfig config={config} setConfig={setConfig} />}
        </motion.div>

        {/* 底部说明 */}
        <div className="mt-8 text-center text-sm text-abyss-500">
          <p>⚠️ 修改配置后需要重新加载游戏才能生效</p>
          <p className="mt-2">配置文件将保存在浏览器本地存储中</p>
        </div>
      </div>
    </div>
  );
}

// 稀有度配置组件
function RarityConfig({ config, setConfig }: { config: GameConfig; setConfig: (c: GameConfig) => void }) {
  const updateRarity = (key: keyof GameConfig['rarity'], value: number) => {
    setConfig({
      ...config,
      rarity: { ...config.rarity, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-abyss-100 mb-4">稀有度出现概率</h2>
      <p className="text-sm text-abyss-400 mb-6">
        调整不同稀有度鱼类的出现概率（0-1之间的小数）
      </p>
      
      {Object.entries(config.rarity).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <label className="w-32 text-abyss-200 capitalize">{key}</label>
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            value={value}
            onChange={(e) => updateRarity(key as any, parseFloat(e.target.value))}
            className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none"
          />
          <span className="w-24 text-abyss-400 text-sm">
            {(value * 100).toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// 业力配置组件
function KarmaConfig({ config, setConfig }: { config: GameConfig; setConfig: (c: GameConfig) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-abyss-100 mb-4">业力系统配置</h2>
      
      <div>
        <h3 className="text-lg font-bold text-abyss-200 mb-3">触发阈值</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="w-48 text-abyss-300">业力触发阈值</label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.karma.threshold}
              onChange={(e) => setConfig({
                ...config,
                karma: { ...config.karma, threshold: parseInt(e.target.value) },
              })}
              className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-48 text-abyss-300">体力耗尽阈值</label>
            <input
              type="number"
              min="0"
              max="100"
              value={config.karma.staminaThreshold}
              onChange={(e) => setConfig({
                ...config,
                karma: { ...config.karma, staminaThreshold: parseInt(e.target.value) },
              })}
              className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-abyss-200 mb-3">业力影响强度</h3>
        <div className="text-sm text-abyss-500 mb-4">
          格式：[最小值, 随机范围] - 实际值 = 最小值 + random(0, 随机范围) × 稀有度倍数
        </div>
        
        {/* 这里可以展开显示所有业力影响的详细配置 */}
        <div className="p-4 bg-abyss-900/50 rounded-lg">
          <p className="text-abyss-400 text-sm">
            业力影响配置需要在代码中手动调整。
            <br />
            参考 src/store/gameStore.ts 中的 makeChoice 函数。
          </p>
        </div>
      </div>
    </div>
  );
}

// 钓鱼难度配置组件
function FishingConfig({ config, setConfig }: { config: GameConfig; setConfig: (c: GameConfig) => void }) {
  const [selectedRarity, setSelectedRarity] = useState<keyof GameConfig['fishing']>('common');
  
  const updateFishingParam = (key: keyof FishingDifficulty, value: number) => {
    setConfig({
      ...config,
      fishing: {
        ...config.fishing,
        [selectedRarity]: {
          ...config.fishing[selectedRarity],
          [key]: value,
        },
      },
    });
  };

  const fishingParams = config.fishing[selectedRarity];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-abyss-100 mb-4">钓鱼小游戏难度</h2>
      
      {/* 稀有度选择 */}
      <div className="flex gap-2 mb-6">
        {Object.keys(config.fishing).map((rarity) => (
          <button
            key={rarity}
            onClick={() => setSelectedRarity(rarity as any)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              selectedRarity === rarity
                ? 'bg-blue-600 text-white'
                : 'bg-abyss-800 text-abyss-400 hover:bg-abyss-700'
            }`}
          >
            {rarity}
          </button>
        ))}
      </div>

      {/* 参数调整 */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(fishingParams).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-abyss-300 text-sm">{key}</label>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => updateFishingParam(key as any, parseFloat(e.target.value))}
              className="px-3 py-2 bg-abyss-900 text-white rounded border border-abyss-700 focus:border-abyss-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// 结局触发配置组件
function EndingsConfig({ config, setConfig }: { config: GameConfig; setConfig: (c: GameConfig) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-abyss-100 mb-4">结局触发条件</h2>
      
      <div className="space-y-3">
        {Object.entries(config.endings).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <label className="w-64 text-abyss-300">{key}</label>
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setConfig({
                ...config,
                endings: { ...config.endings, [key]: parseInt(e.target.value) },
              })}
              className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// 音频配置组件
function AudioConfig({ config, setConfig }: { config: GameConfig; setConfig: (c: GameConfig) => void }) {
  const updateAudioPath = (category: 'weather' | 'endings', key: string, value: string) => {
    setConfig({
      ...config,
      audio: {
        ...config.audio,
        [category]: {
          ...config.audio[category],
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-abyss-100 mb-4">🎵 BGM 音乐配置</h2>
      
      {/* 全局音频设置 */}
      <div className="glass rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-bold text-abyss-200">全局设置</h3>
        
        <div className="flex items-center gap-4">
          <label className="w-48 text-abyss-300">默认音量 (0-1)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={config.audio.volume}
            onChange={(e) => setConfig({
              ...config,
              audio: { ...config.audio, volume: parseFloat(e.target.value) },
            })}
            className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none"
          />
          <span className="w-16 text-abyss-400">{Math.round(config.audio.volume * 100)}%</span>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="w-48 text-abyss-300">淡入淡出时间 (ms)</label>
          <input
            type="number"
            step="100"
            min="500"
            max="5000"
            value={config.audio.fadeTime}
            onChange={(e) => setConfig({
              ...config,
              audio: { ...config.audio, fadeTime: parseInt(e.target.value) },
            })}
            className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none"
          />
          <span className="w-16 text-abyss-400">{config.audio.fadeTime / 1000}s</span>
        </div>
      </div>

      {/* 天气BGM */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-lg font-bold text-abyss-200 mb-4">天气BGM</h3>
        <div className="space-y-3">
          {Object.entries(config.audio.weather).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-32 text-abyss-300 capitalize">{key}</label>
              <input
                type="text"
                placeholder="本地路径或在线URL"
                value={value}
                onChange={(e) => updateAudioPath('weather', key, e.target.value)}
                className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 结局BGM */}
      <div className="glass rounded-lg p-4">
        <h3 className="text-lg font-bold text-abyss-200 mb-4">结局BGM</h3>
        <div className="space-y-3">
          {Object.entries(config.audio.endings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-32 text-abyss-300 capitalize">{key}</label>
              <input
                type="text"
                placeholder="本地路径或在线URL"
                value={value}
                onChange={(e) => updateAudioPath('endings', key, e.target.value)}
                className="flex-1 px-4 py-2 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none font-mono text-sm"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-sm mb-2">
          💡 提示：
        </p>
        <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
          <li>支持本地文件路径（如 /audio/weather/sunny.mp3）或在线URL</li>
          <li>音频切换时会自动进行{config.audio.fadeTime / 1000}秒的交叉淡入淡出</li>
          <li>按 M 键可以快速静音/取消静音</li>
          <li>如果音频文件不存在，将静默失败，不影响游戏进行</li>
        </ul>
      </div>
    </div>
  );
}

// AI提示词配置组件
function PromptsConfig({ config, setConfig }: { config: GameConfig; setConfig: (c: GameConfig) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-abyss-100 mb-4">AI 提示词配置</h2>
      
      {Object.entries(config.prompts).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <label className="block text-abyss-300 font-bold">{key}</label>
          <textarea
            value={value}
            onChange={(e) => setConfig({
              ...config,
              prompts: { ...config.prompts, [key]: e.target.value },
            })}
            rows={6}
            className="w-full px-4 py-3 bg-abyss-900 text-white rounded-lg border border-abyss-700 focus:border-abyss-500 focus:outline-none font-mono text-sm"
          />
        </div>
      ))}
      
      <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
        <p className="text-amber-200 text-sm">
          ⚠️ 提示词修改需要在服务器代码中手动更新。此处仅供参考和记录。
        </p>
      </div>
    </div>
  );
}

