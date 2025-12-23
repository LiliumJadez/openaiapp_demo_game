import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(onStart, 1000);
  };

  return (
    <AnimatePresence>
      {!isStarting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-abyss-950 via-abyss-900 to-abyss-800"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 波浪动画 */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-0 right-0 h-32 opacity-10"
                style={{
                  background: `linear-gradient(180deg, transparent, ${i % 2 ? '#00a0e6' : '#007db3'})`,
                }}
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}
            
            {/* 浮动粒子 */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-abyss-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* 主标题 */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center z-10 mb-12"
          >
            {/* 装饰线 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-32 h-0.5 mx-auto mb-6 bg-gradient-to-r from-transparent via-abyss-400 to-transparent"
            />
            
            {/* 游戏标题 */}
            <h1 className="text-6xl md:text-8xl font-title font-bold text-transparent bg-clip-text 
                          bg-gradient-to-b from-abyss-100 via-abyss-300 to-abyss-500 mb-4">
              虚数海筏
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-abyss-400 font-mystical tracking-widest"
            >
              Imaginary Sea Raft
            </motion.p>

            {/* 装饰线 */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="w-32 h-0.5 mx-auto mt-6 bg-gradient-to-r from-transparent via-abyss-400 to-transparent"
            />
          </motion.div>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-lg text-abyss-300 mb-8 text-center max-w-md px-4"
          >
            旧世界的灵魂沉睡于此
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-sm text-abyss-500 mb-16 text-center max-w-md px-4 italic"
          >
            每一条鱼，都曾是一个人
          </motion.p>

          {/* 开始按钮 */}
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 160, 230, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="relative px-12 py-4 rounded-full bg-gradient-to-r from-abyss-700 to-abyss-600 
                      border-2 border-abyss-400/50 text-xl font-title font-bold text-abyss-100
                      overflow-hidden group"
          >
            {/* 按钮光效 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            
            <span className="relative flex items-center gap-3">
              <span>开始垂钓</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🎣
              </motion.span>
            </span>
          </motion.button>

          {/* 底部信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 text-center text-sm text-abyss-600"
          >
            <p>每一次垂钓，都是命运的抉择</p>
            <p className="mt-1 text-abyss-700">© 虚数海筏</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

