import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  getSaveSlots,
  createSave,
  updateSave,
  loadSave,
  deleteSave,
  formatPlayTime,
  formatDate,
  exportSaves,
  importSaves,
  isAutoSaveEnabled,
  toggleAutoSave,
} from '@/services/saveManager';
import type { SaveSlot, SaveData } from '@/types';

interface SaveLoadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

export function SaveLoadPanel({ isOpen, onClose, mode }: SaveLoadPanelProps) {
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [showConfirm, setShowConfirm] = useState<'delete' | 'overwrite' | 'load' | null>(null);
  const [autoSaveOn, setAutoSaveOn] = useState(true);
  const [showExportImport, setShowExportImport] = useState(false);
  const [importText, setImportText] = useState('');

  // 从store获取游戏状态
  const visibleStats = useGameStore((s) => s.visibleStats);
  const karmaStats = useGameStore((s) => s.karmaStats);
  const collection = useGameStore((s) => s.collection);
  const bestiary = useGameStore((s) => s.bestiary);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const stats = useGameStore((s) => s.stats);
  const weather = useGameStore((s) => s.weather);
  const logs = useGameStore((s) => s.logs);
  const phase = useGameStore((s) => s.phase);

  // 加载存档的action
  const loadGameFromSave = useGameStore((s) => s.loadFromSave);
  const addLog = useGameStore((s) => s.addLog);

  // 刷新存档列表
  const refreshSlots = useCallback(() => {
    setSlots(getSaveSlots());
    setAutoSaveOn(isAutoSaveEnabled());
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshSlots();
    }
  }, [isOpen, refreshSlots]);

  // 获取当前游戏数据
  const getCurrentSaveData = useCallback((): SaveData => {
    return {
      visibleStats,
      karmaStats,
      collection,
      bestiary,
      unlockedAchievements,
      stats,
      weather,
      logs,
    };
  }, [visibleStats, karmaStats, collection, bestiary, unlockedAchievements, stats, weather, logs]);

  // 创建新存档
  const handleCreateSave = useCallback(() => {
    if (phase === 'ending') {
      addLog('system', '游戏已结束，无法存档');
      return;
    }

    const name = saveName.trim() || `存档 ${slots.length + 1}`;
    const slot = createSave(name, getCurrentSaveData(), 0);
    
    if (slot) {
      addLog('system', `存档"${name}"已保存`);
      setSaveName('');
      refreshSlots();
    } else {
      addLog('system', '存档槽位已满，请删除旧存档');
    }
  }, [saveName, slots.length, getCurrentSaveData, phase, addLog, refreshSlots]);

  // 覆盖存档
  const handleOverwriteSave = useCallback(() => {
    if (!selectedSlot) return;
    
    const success = updateSave(selectedSlot, getCurrentSaveData(), 0);
    if (success) {
      addLog('system', '存档已更新');
      setShowConfirm(null);
      refreshSlots();
    }
  }, [selectedSlot, getCurrentSaveData, addLog, refreshSlots]);

  // 加载存档
  const handleLoadSave = useCallback(() => {
    if (!selectedSlot) return;
    
    const data = loadSave(selectedSlot);
    if (data) {
      loadGameFromSave(data);
      addLog('system', '存档已加载');
      setShowConfirm(null);
      onClose();
    }
  }, [selectedSlot, loadGameFromSave, addLog, onClose]);

  // 删除存档
  const handleDeleteSave = useCallback(() => {
    if (!selectedSlot) return;
    
    const success = deleteSave(selectedSlot);
    if (success) {
      addLog('system', '存档已删除');
      setSelectedSlot(null);
      setShowConfirm(null);
      refreshSlots();
    }
  }, [selectedSlot, addLog, refreshSlots]);

  // 切换自动存档
  const handleToggleAutoSave = useCallback(() => {
    const newValue = !autoSaveOn;
    toggleAutoSave(newValue);
    setAutoSaveOn(newValue);
  }, [autoSaveOn]);

  // 导出存档
  const handleExport = useCallback(() => {
    const data = exportSaves();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `虚数海筏存档_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // 导入存档
  const handleImport = useCallback(() => {
    if (!importText.trim()) return;
    
    const success = importSaves(importText);
    if (success) {
      addLog('system', '存档导入成功');
      setImportText('');
      setShowExportImport(false);
      refreshSlots();
    } else {
      addLog('system', '存档导入失败：格式无效');
    }
  }, [importText, addLog, refreshSlots]);

  // 稀有度颜色
  const karmaColors: Record<string, string> = {
    '暴食倾向': 'text-red-400',
    '贪婪倾向': 'text-yellow-400',
    '慈悲倾向': 'text-blue-400',
    '平衡': 'text-green-400',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl bg-gradient-to-br from-abyss-800 to-abyss-900 shadow-2xl border border-abyss-600"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-abyss-600">
            <h2 className="text-2xl font-title font-bold text-abyss-100">
              {mode === 'save' ? '💾 保存游戏' : '📂 加载存档'}
            </h2>
            <button
              onClick={onClose}
              className="text-abyss-400 hover:text-abyss-200 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* 存档列表 */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {slots.length === 0 ? (
              <div className="text-center py-12 text-abyss-400">
                <span className="text-4xl mb-4 block">📭</span>
                <p>暂无存档</p>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedSlot === slot.id
                        ? 'bg-abyss-600 border-2 border-blue-400'
                        : 'bg-abyss-700/50 border border-abyss-600 hover:bg-abyss-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-abyss-100">{slot.name}</h3>
                        <p className="text-sm text-abyss-400">
                          {formatDate(slot.updatedAt)} · {formatPlayTime(slot.playTime)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className={karmaColors[slot.preview.karmaStatus] || 'text-abyss-300'}>
                          {slot.preview.karmaStatus}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-4 text-sm text-abyss-300">
                      <span>🐟 {slot.preview.fishCaught} 次捕获</span>
                      <span>💰 {slot.preview.coins} 金币</span>
                      <span>📖 {slot.preview.bestiaryCount} 图鉴</span>
                      <span>🏆 {slot.preview.achievementCount} 成就</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 操作区域 */}
          <div className="px-6 py-4 border-t border-abyss-600 bg-abyss-800/50">
            {mode === 'save' ? (
              <div className="space-y-3">
                {/* 新建存档 */}
                {slots.length < 5 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="输入存档名称..."
                      className="flex-1 px-4 py-2 rounded-lg bg-abyss-700 border border-abyss-600 text-abyss-100 placeholder-abyss-500 focus:outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={handleCreateSave}
                      disabled={phase === 'ending'}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-abyss-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                    >
                      新建存档
                    </button>
                  </div>
                )}
                
                {/* 覆盖存档 */}
                {selectedSlot && (
                  <button
                    onClick={() => setShowConfirm('overwrite')}
                    disabled={phase === 'ending'}
                    className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-abyss-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                  >
                    覆盖选中存档
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedSlot && (
                  <button
                    onClick={() => setShowConfirm('load')}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
                  >
                    加载选中存档
                  </button>
                )}
              </div>
            )}

            {/* 删除和设置按钮 */}
            <div className="flex gap-2 mt-3">
              {selectedSlot && (
                <button
                  onClick={() => setShowConfirm('delete')}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                >
                  🗑️ 删除
                </button>
              )}
              <button
                onClick={handleToggleAutoSave}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  autoSaveOn
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-abyss-700 text-abyss-400'
                }`}
              >
                {autoSaveOn ? '🔄 自动存档：开' : '⏸️ 自动存档：关'}
              </button>
              <button
                onClick={() => setShowExportImport(!showExportImport)}
                className="px-4 py-2 bg-abyss-700 hover:bg-abyss-600 text-abyss-300 rounded-lg transition-colors"
              >
                📤 导入/导出
              </button>
            </div>

            {/* 导入导出区域 */}
            {showExportImport && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 p-3 bg-abyss-700 rounded-lg"
              >
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-colors"
                  >
                    导出存档
                  </button>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="粘贴存档JSON数据..."
                  className="w-full h-24 px-3 py-2 rounded-lg bg-abyss-800 border border-abyss-600 text-abyss-200 placeholder-abyss-500 focus:outline-none focus:border-blue-400 resize-none text-sm"
                />
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="mt-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/40 disabled:bg-abyss-600 disabled:cursor-not-allowed text-green-400 rounded-lg transition-colors"
                >
                  导入存档
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 确认对话框 */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
              onClick={() => setShowConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="p-6 bg-abyss-800 rounded-xl shadow-2xl border border-abyss-600 max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-abyss-100 mb-4">
                  {showConfirm === 'delete' && '确认删除？'}
                  {showConfirm === 'overwrite' && '确认覆盖？'}
                  {showConfirm === 'load' && '确认加载？'}
                </h3>
                <p className="text-abyss-300 mb-6">
                  {showConfirm === 'delete' && '此操作不可撤销，存档将永久删除。'}
                  {showConfirm === 'overwrite' && '当前存档将被覆盖，此操作不可撤销。'}
                  {showConfirm === 'load' && '当前未保存的进度将丢失。'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="flex-1 px-4 py-2 bg-abyss-700 hover:bg-abyss-600 text-abyss-300 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      if (showConfirm === 'delete') handleDeleteSave();
                      if (showConfirm === 'overwrite') handleOverwriteSave();
                      if (showConfirm === 'load') handleLoadSave();
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                      showConfirm === 'delete'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    确认
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

