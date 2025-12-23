// ============================================
// 虚数海筏 - 存档管理服务
// ============================================

import type { SaveSlot, SaveData, SaveManager, KarmaStats } from '@/types';

const STORAGE_KEY = 'imaginary-sea-raft-saves';
const MAX_SLOTS = 5;
const AUTO_SAVE_INTERVAL = 60000; // 1分钟自动存档

// 获取业力状态描述
function getKarmaStatus(karma: KarmaStats): string {
  const { gluttony, greed, mercy } = karma;
  const max = Math.max(gluttony, greed, mercy);
  const min = Math.min(gluttony, greed, mercy);
  
  if (max - min <= 15) return '平衡';
  if (max === gluttony) return '暴食倾向';
  if (max === greed) return '贪婪倾向';
  return '慈悲倾向';
}

// 生成唯一ID
function generateId(): string {
  return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 获取存档管理器
export function getSaveManager(): SaveManager {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取存档失败:', error);
  }
  
  return {
    slots: [],
    maxSlots: MAX_SLOTS,
    autoSaveEnabled: true,
    lastAutoSave: null,
  };
}

// 保存存档管理器
function saveSaveManager(manager: SaveManager): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manager));
  } catch (error) {
    console.error('保存存档失败:', error);
  }
}

// 获取所有存档槽位
export function getSaveSlots(): SaveSlot[] {
  const manager = getSaveManager();
  return manager.slots.sort((a, b) => b.updatedAt - a.updatedAt);
}

// 创建新存档
export function createSave(name: string, data: SaveData, playTime: number = 0): SaveSlot | null {
  const manager = getSaveManager();
  
  if (manager.slots.length >= MAX_SLOTS) {
    console.warn('存档槽位已满');
    return null;
  }
  
  const now = Date.now();
  const slot: SaveSlot = {
    id: generateId(),
    name: name || `存档 ${manager.slots.length + 1}`,
    createdAt: now,
    updatedAt: now,
    playTime,
    preview: {
      fishCaught: data.visibleStats.fishCaught,
      coins: data.visibleStats.coins,
      karmaStatus: getKarmaStatus(data.karmaStats),
      bestiaryCount: data.bestiary.length,
      achievementCount: data.unlockedAchievements.length,
    },
    data,
  };
  
  manager.slots.push(slot);
  saveSaveManager(manager);
  
  return slot;
}

// 更新存档
export function updateSave(slotId: string, data: SaveData, playTime: number): boolean {
  const manager = getSaveManager();
  const index = manager.slots.findIndex(s => s.id === slotId);
  
  if (index === -1) {
    console.warn('存档不存在:', slotId);
    return false;
  }
  
  manager.slots[index] = {
    ...manager.slots[index],
    updatedAt: Date.now(),
    playTime,
    preview: {
      fishCaught: data.visibleStats.fishCaught,
      coins: data.visibleStats.coins,
      karmaStatus: getKarmaStatus(data.karmaStats),
      bestiaryCount: data.bestiary.length,
      achievementCount: data.unlockedAchievements.length,
    },
    data,
  };
  
  saveSaveManager(manager);
  return true;
}

// 加载存档
export function loadSave(slotId: string): SaveData | null {
  const manager = getSaveManager();
  const slot = manager.slots.find(s => s.id === slotId);
  
  if (!slot) {
    console.warn('存档不存在:', slotId);
    return null;
  }
  
  return slot.data;
}

// 删除存档
export function deleteSave(slotId: string): boolean {
  const manager = getSaveManager();
  const index = manager.slots.findIndex(s => s.id === slotId);
  
  if (index === -1) {
    console.warn('存档不存在:', slotId);
    return false;
  }
  
  manager.slots.splice(index, 1);
  saveSaveManager(manager);
  return true;
}

// 获取自动存档设置
export function isAutoSaveEnabled(): boolean {
  return getSaveManager().autoSaveEnabled;
}

// 切换自动存档
export function toggleAutoSave(enabled: boolean): void {
  const manager = getSaveManager();
  manager.autoSaveEnabled = enabled;
  saveSaveManager(manager);
}

// 自动存档（覆盖最旧的自动存档或创建新的）
export function autoSave(data: SaveData, playTime: number): SaveSlot | null {
  const manager = getSaveManager();
  
  if (!manager.autoSaveEnabled) {
    return null;
  }
  
  // 查找现有的自动存档
  const autoSaveSlot = manager.slots.find(s => s.name.startsWith('[自动]'));
  
  if (autoSaveSlot) {
    updateSave(autoSaveSlot.id, data, playTime);
    manager.lastAutoSave = Date.now();
    saveSaveManager(manager);
    return autoSaveSlot;
  }
  
  // 如果槽位已满，删除最旧的存档
  if (manager.slots.length >= MAX_SLOTS) {
    const oldest = manager.slots.reduce((a, b) => a.updatedAt < b.updatedAt ? a : b);
    deleteSave(oldest.id);
  }
  
  const slot = createSave('[自动] 自动存档', data, playTime);
  if (slot) {
    manager.lastAutoSave = Date.now();
    saveSaveManager(manager);
  }
  
  return slot;
}

// 导出存档（用于备份）
export function exportSaves(): string {
  const manager = getSaveManager();
  return JSON.stringify(manager, null, 2);
}

// 导入存档（从备份恢复）
export function importSaves(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString) as SaveManager;
    
    if (!imported.slots || !Array.isArray(imported.slots)) {
      throw new Error('无效的存档格式');
    }
    
    saveSaveManager(imported);
    return true;
  } catch (error) {
    console.error('导入存档失败:', error);
    return false;
  }
}

// 格式化游戏时长
export function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

// 格式化日期
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${month}月${day}日 ${hours}:${minutes}`;
}

// 自动存档定时器
let autoSaveTimer: number | null = null;

export function startAutoSave(getGameData: () => { data: SaveData; playTime: number }): void {
  stopAutoSave();
  
  autoSaveTimer = window.setInterval(() => {
    const { data, playTime } = getGameData();
    autoSave(data, playTime);
    console.log('自动存档完成');
  }, AUTO_SAVE_INTERVAL);
}

export function stopAutoSave(): void {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

