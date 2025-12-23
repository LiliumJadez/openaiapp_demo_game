import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { GameLog as GameLogType } from '@/types';

// 日志类型配置
const LOG_CONFIG: Record<GameLogType['type'], {
  icon: string;
  color: string;
}> = {
  catch: { icon: '🎣', color: 'text-blue-400' },
  choice: { icon: '⚖️', color: 'text-purple-400' },
  event: { icon: '✨', color: 'text-amber-400' },
  system: { icon: '📜', color: 'text-gray-400' },
};

export function GameLog() {
  const logs = useGameStore((state) => state.logs);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-4 right-4 z-20 w-80"
    >
      <div className="glass rounded-xl overflow-hidden">
        {/* 标题栏 */}
        <div className="px-4 py-2 border-b border-abyss-600/30 flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="text-sm font-title text-abyss-200">航海日志</span>
          <span className="text-xs text-abyss-500 ml-auto">{logs.length} 条记录</span>
        </div>

        {/* 日志列表 */}
        <div
          ref={containerRef}
          className="max-h-48 overflow-y-auto p-3 space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {logs.slice(-10).map((log) => {
              const config = LOG_CONFIG[log.type];
              return (
                <motion.div
                  key={log.id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  layout
                  className="flex gap-2 text-sm"
                >
                  <span>{config.icon}</span>
                  <span className={`flex-1 ${config.color}`}>{log.content}</span>
                  <span className="text-xs text-abyss-600">
                    {formatTime(log.timestamp)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

