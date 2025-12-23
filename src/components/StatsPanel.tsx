import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { WeatherType } from '@/types';

export function StatsPanel() {
  const visibleStats = useGameStore((state) => state.visibleStats);
  const karmaStats = useGameStore((state) => state.karmaStats);
  const weather = useGameStore((state) => state.weather);
  const phase = useGameStore((state) => state.phase);
  const stats = useGameStore((state) => state.stats);

  // 天气图标和名称映射 (7种)
  const weatherConfig: Record<WeatherType, { icon: string; name: string; color: string }> = {
    sunny: { icon: '☀️', name: '晴空', color: '#fef08a' },
    bloodRain: { icon: '🩸', name: '血雨', color: '#dc2626' },
    fog: { icon: '🌫️', name: '迷雾', color: '#9ca3af' },
    storm: { icon: '⛈️', name: '风暴', color: '#60a5fa' },
    aurora: { icon: '🌌', name: '极光', color: '#34d399' },
    eclipse: { icon: '🌑', name: '日蚀', color: '#8b5cf6' },
    starfall: { icon: '💫', name: '星陨', color: '#fbbf24' },
  };

  // 计算天气趋势（基于当前业力值）
  const weatherTrend = useMemo(() => {
    const { gluttony, greed, mercy } = karmaStats;
    const trends: { weather: WeatherType; strength: number }[] = [];

    if (gluttony > 20) {
      trends.push({ weather: 'bloodRain', strength: gluttony / 100 });
      if (gluttony > 50) {
        trends.push({ weather: 'eclipse', strength: gluttony / 150 });
      }
    }
    if (greed > 20) {
      trends.push({ weather: 'storm', strength: greed / 100 });
      if (greed > 50) {
        trends.push({ weather: 'fog', strength: greed / 150 });
      }
    }
    if (mercy > 20) {
      trends.push({ weather: 'aurora', strength: mercy / 100 });
      if (mercy > 40) {
        trends.push({ weather: 'starfall', strength: mercy / 120 });
      }
    }

    // 返回最强的趋势
    return trends.sort((a, b) => b.strength - a.strength)[0] || null;
  }, [karmaStats]);

  // 判断业力是否接近阈值
  const getKarmaWarning = (value: number) => {
    if (value >= 70) return 'critical';
    if (value >= 50) return 'warning';
    return 'normal';
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute top-4 left-4 z-20"
    >
      {/* 主面板 */}
      <div className="glass rounded-xl p-4 w-72 space-y-4">
        {/* 天气信息 */}
        <div className="pb-3 border-b border-abyss-600/30">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: weather.type === 'storm' ? [0, -5, 5, 0] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {weatherConfig[weather.type].icon}
            </motion.span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-title text-abyss-100">
                  {weatherConfig[weather.type].name}
                </span>
                {/* 天气趋势指示器 */}
                {weatherTrend && weatherTrend.weather !== weather.type && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span className="text-abyss-500">→</span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ color: weatherConfig[weatherTrend.weather].color }}
                    >
                      {weatherConfig[weatherTrend.weather].icon}
                    </motion.span>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-abyss-400">
                <span>强度</span>
                <div className="flex-1 h-1 bg-abyss-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: weatherConfig[weather.type].color }}
                    animate={{ width: `${weather.intensity * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span>{Math.round(weather.intensity * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* 天气效果描述 */}
          <motion.p
            key={weather.type}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-abyss-500 mt-2 italic"
          >
            {weather.mysticalEffect}
          </motion.p>
        </div>

        {/* 显性数值 */}
        <div className="space-y-3">
          {/* 体力条 */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-abyss-200 flex items-center gap-1">
                <span>⚡</span>
                <span>体力</span>
              </span>
              <span className={`font-bold ${
                visibleStats.stamina <= 20 ? 'text-red-400' : 
                visibleStats.stamina <= 50 ? 'text-amber-400' : 'text-abyss-100'
              }`}>
                {visibleStats.stamina}/100
              </span>
            </div>
            <div className="h-3 bg-abyss-900 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full ${
                  visibleStats.stamina <= 20 ? 'bg-gradient-to-r from-red-600 to-red-400' : 
                  visibleStats.stamina <= 50 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 
                  'bg-gradient-to-r from-abyss-600 to-abyss-400'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${visibleStats.stamina}%` }}
                transition={{ duration: 0.3 }}
              />
              {/* 低体力警告动画 */}
              {visibleStats.stamina <= 20 && (
                <motion.div
                  className="absolute inset-0 bg-red-400/30"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          </div>

          {/* 金币 */}
          <div className="flex justify-between items-center bg-abyss-900/30 rounded-lg px-3 py-2">
            <span className="text-abyss-200 flex items-center gap-2">
              <span className="text-xl">💰</span>
              <span>金币</span>
            </span>
            <motion.span
              key={visibleStats.coins}
              initial={{ scale: 1.3, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#b3e7ff' }}
              className="text-xl font-bold font-title"
            >
              {visibleStats.coins}
            </motion.span>
          </div>

          {/* 捕获数 */}
          <div className="flex justify-between items-center bg-abyss-900/30 rounded-lg px-3 py-2">
            <span className="text-abyss-200 flex items-center gap-2">
              <span className="text-xl">🐟</span>
              <span>捕获</span>
            </span>
            <span className="text-xl font-bold font-title text-abyss-100">
              {visibleStats.fishCaught}
            </span>
          </div>

          {/* 收集价值 */}
          <div className="flex justify-between items-center bg-gradient-to-r from-abyss-900/30 to-purple-900/20 rounded-lg px-3 py-2 border border-purple-500/20">
            <span className="text-abyss-200 flex items-center gap-2">
              <motion.span 
                className="text-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                📊
              </motion.span>
              <span>价值</span>
            </span>
            <div className="text-right">
              <motion.span
                key={stats.currentRunValue}
                initial={{ scale: 1.3, color: '#a855f7' }}
                animate={{ scale: 1, color: '#e9d5ff' }}
                className="text-xl font-bold font-title"
              >
                {stats.currentRunValue}
              </motion.span>
              {stats.highestCollectionValue > 0 && stats.highestCollectionValue > stats.currentRunValue && (
                <div className="text-xs text-abyss-500">
                  最高: {stats.highestCollectionValue}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 隐性业力值 */}
        <div className="pt-3 border-t border-abyss-600/30 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-abyss-400">业力指数</span>
            <span className="text-xs text-abyss-500">
              (影响天气和结局)
            </span>
          </div>
          
          {/* 暴食 */}
          <KarmaBar
            icon="🔥"
            label="暴食"
            value={karmaStats.gluttony}
            color="karma-gluttony"
            warning={getKarmaWarning(karmaStats.gluttony)}
            trendWeather="bloodRain"
          />

          {/* 贪婪 */}
          <KarmaBar
            icon="💎"
            label="贪婪"
            value={karmaStats.greed}
            color="karma-greed"
            warning={getKarmaWarning(karmaStats.greed)}
            trendWeather="storm"
          />

          {/* 慈悲 */}
          <KarmaBar
            icon="🕊️"
            label="慈悲"
            value={karmaStats.mercy}
            color="karma-mercy"
            warning={getKarmaWarning(karmaStats.mercy)}
            trendWeather="aurora"
          />
        </div>

        {/* 结局预警 */}
        {(karmaStats.gluttony >= 60 || karmaStats.greed >= 60 || karmaStats.mercy >= 60) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-2 border-t border-abyss-600/30"
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs text-center text-amber-400"
            >
              ⚠️ 命运的天平正在倾斜...
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* 操作提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'idle' ? 1 : 0.3 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-xs text-abyss-400">
          {phase === 'idle' ? '点击水面抛竿垂钓' : '垂钓中...'}
        </p>
        <p className="text-xs text-abyss-600 mt-1">
          不同位置可能遇到不同的生物
        </p>
      </motion.div>
    </motion.div>
  );
}

// 业力进度条组件
function KarmaBar({
  icon,
  label,
  value,
  color,
  warning,
  trendWeather,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  warning: 'normal' | 'warning' | 'critical';
  trendWeather: WeatherType;
}) {
  const weatherIcons: Record<WeatherType, string> = {
    sunny: '☀️',
    bloodRain: '🩸',
    fog: '🌫️',
    storm: '⛈️',
    aurora: '🌌',
    eclipse: '🌑',
    starfall: '💫',
  };

  return (
    <div className={`relative ${warning === 'critical' ? 'animate-pulse' : ''}`}>
      <div className="flex justify-between text-xs mb-1">
        <span className={`text-${color}/80 flex items-center gap-1`}>
          <span>{icon}</span>
          <span>{label}</span>
          {value >= 30 && (
            <span className="text-abyss-600 text-[10px]">
              → {weatherIcons[trendWeather]}
            </span>
          )}
        </span>
        <span className={`text-${color}/60 ${warning !== 'normal' ? 'font-bold' : ''}`}>
          {value}
          {warning === 'critical' && <span className="ml-1">⚠️</span>}
        </span>
      </div>
      <div className="h-2 bg-abyss-900 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full bg-${color}`}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.3 }}
        />
        {/* 阈值标记 */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white/30"
          style={{ left: '80%' }}
        />
        {/* 警告闪烁 */}
        {warning === 'critical' && (
          <motion.div
            className={`absolute inset-0 bg-${color}/30`}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}
