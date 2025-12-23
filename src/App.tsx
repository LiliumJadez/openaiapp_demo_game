import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LakeScene,
  StatsPanel,
  DialoguePanel,
  EndingPanel,
  GameLog,
  CatchingOverlay,
  ResultOverlay,
  TitleScreen,
  CollectionPanel,
  BestiaryPanel,
  AchievementPanel,
  SaveLoadPanel,
  AchievementToast,
  InventoryPanel,
  ReleaseStoryPanel,
} from '@/components';
import { useGameStore } from '@/store/gameStore';
import { startAutoSave, stopAutoSave } from '@/services/saveManager';
import { audioManager } from '@/services/audioManager';
import type { SaveData } from '@/types';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [saveMode, setSaveMode] = useState<'save' | 'load' | null>(null);
  const [playTime, setPlayTime] = useState(0);

  // 获取游戏状态用于自动存档
  const visibleStats = useGameStore((s) => s.visibleStats);
  const karmaStats = useGameStore((s) => s.karmaStats);
  const collection = useGameStore((s) => s.collection);
  const bestiary = useGameStore((s) => s.bestiary);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const stats = useGameStore((s) => s.stats);
  const weather = useGameStore((s) => s.weather);
  const logs = useGameStore((s) => s.logs);
  const phase = useGameStore((s) => s.phase);
  
  // 放生故事面板
  const releaseStoryFish = useGameStore((s) => s.releaseStoryFish);
  const closeReleaseStory = useGameStore((s) => s.closeReleaseStory);
  
  // 结局状态（用于BGM）
  const ending = useGameStore((s) => s.ending);

  // 获取当前游戏数据
  const getGameData = useCallback((): { data: SaveData; playTime: number } => {
    return {
      data: {
        visibleStats,
        karmaStats,
        collection,
        bestiary,
        unlockedAchievements,
        stats,
        weather,
        logs,
      },
      playTime,
    };
  }, [visibleStats, karmaStats, collection, bestiary, unlockedAchievements, stats, weather, logs, playTime]);

  // 游戏时间计时器
  useEffect(() => {
    if (!gameStarted || phase === 'ending') return;

    const timer = setInterval(() => {
      setPlayTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, phase]);

  // 自动存档
  useEffect(() => {
    if (gameStarted && phase !== 'ending') {
      startAutoSave(getGameData);
    }
    return () => stopAutoSave();
  }, [gameStarted, phase, getGameData]);

  // BGM 管理 - 天气变化时切换音乐
  useEffect(() => {
    if (!gameStarted || phase === 'ending') return;
    
    audioManager.playWeatherMusic(weather.type);
  }, [gameStarted, weather.type, phase]);

  // BGM 管理 - 结局触发时切换音乐
  useEffect(() => {
    if (phase === 'ending' && ending) {
      audioManager.playEndingMusic(ending.type);
    }
  }, [phase, ending]);

  // 游戏退出时停止音乐
  useEffect(() => {
    return () => {
      audioManager.stopAll();
    };
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setSaveMode('save');
      }
      // Ctrl+L 加载
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setSaveMode('load');
      }
      // ESC 关闭
      if (e.key === 'Escape') {
        setSaveMode(null);
      }
      // M 键静音/取消静音
      if (e.key === 'm' || e.key === 'M') {
        const currentVolume = audioManager.getConfig().volume;
        audioManager.setVolume(currentVolume > 0 ? 0 : 0.5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 标题屏幕 */}
      <AnimatePresence>
        {!gameStarted && (
          <TitleScreen onStart={() => setGameStarted(true)} />
        )}
      </AnimatePresence>

      {/* 游戏主界面 */}
      {gameStarted && (
        <>
          {/* 背景湖面场景 */}
          <LakeScene />

          {/* 状态面板 */}
          <StatsPanel />

          {/* 右侧功能面板 */}
          <CollectionPanel />
          <BestiaryPanel />
          <AchievementPanel />

          {/* 游戏日志 */}
          <GameLog />

          {/* 捕获中覆盖层 */}
          <CatchingOverlay />

          {/* 对话面板 */}
          <DialoguePanel />

          {/* 结果覆盖层 */}
          <ResultOverlay />

          {/* 结局面板 */}
          <EndingPanel />

          {/* 存档按钮 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-4 right-4 z-40 flex gap-2"
          >
            <button
              onClick={() => setSaveMode('save')}
              className="px-4 py-2 bg-abyss-800/80 hover:bg-abyss-700 text-abyss-200 rounded-lg backdrop-blur-sm border border-abyss-600 transition-all hover:scale-105"
              title="保存游戏 (Ctrl+S)"
            >
              💾 存档
            </button>
            <button
              onClick={() => setSaveMode('load')}
              className="px-4 py-2 bg-abyss-800/80 hover:bg-abyss-700 text-abyss-200 rounded-lg backdrop-blur-sm border border-abyss-600 transition-all hover:scale-105"
              title="加载存档 (Ctrl+L)"
            >
              📂 读档
            </button>
          </motion.div>

          {/* 存档/读档面板 */}
          <SaveLoadPanel
            isOpen={saveMode !== null}
            onClose={() => setSaveMode(null)}
            mode={saveMode || 'save'}
          />

          {/* 成就获取提示 */}
          <AchievementToast />

          {/* 背包系统 */}
          <InventoryPanel />
          
          {/* 放生故事面板 */}
          <ReleaseStoryPanel 
            fish={releaseStoryFish}
            onClose={closeReleaseStory}
          />
        </>
      )}
    </div>
  );
}

export default App;

