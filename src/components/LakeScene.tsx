import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { WeatherType } from '@/types';

// ============================================
// 类型定义
// ============================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'rain' | 'fog' | 'spark' | 'aurora' | 'blood';
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface Wave {
  offset: number;
  amplitude: number;
  frequency: number;
  speed: number;
}

interface FishingState {
  bobberX: number;
  bobberY: number;
  lineStartX: number;
  lineStartY: number;
  isCasting: boolean;
  castProgress: number;
  bobberBob: number;
  fishPull: number;
  targetX: number;
  targetY: number;
}

interface ClickZone {
  x: number;
  y: number;
  radius: number;
  type: 'shallow' | 'deep' | 'mysterious' | 'normal';
  rarityBonus: number;
}

// ============================================
// 配置常量
// ============================================

// 天气颜色配置 (7种)
const WEATHER_COLORS: Record<WeatherType, {
  sky: string[];
  water: string[];
  particles: string;
  ambient: string;
}> = {
  sunny: {
    sky: ['#1a1a2e', '#16213e', '#0f3460'],
    water: ['#0a192f', '#172a45', '#1e3a5f'],
    particles: '#fef08a',
    ambient: 'rgba(254, 240, 138, 0.1)',
  },
  bloodRain: {
    sky: ['#1a0000', '#2d0000', '#450000'],
    water: ['#1a0a0a', '#2d1414', '#451f1f'],
    particles: '#dc2626',
    ambient: 'rgba(220, 38, 38, 0.15)',
  },
  fog: {
    sky: ['#1f2937', '#374151', '#4b5563'],
    water: ['#111827', '#1f2937', '#374151'],
    particles: '#9ca3af',
    ambient: 'rgba(156, 163, 175, 0.2)',
  },
  storm: {
    sky: ['#0f172a', '#1e293b', '#334155'],
    water: ['#020617', '#0f172a', '#1e293b'],
    particles: '#60a5fa',
    ambient: 'rgba(96, 165, 250, 0.1)',
  },
  aurora: {
    sky: ['#0f172a', '#1e1b4b', '#312e81'],
    water: ['#020617', '#1e1b4b', '#312e81'],
    particles: '#34d399',
    ambient: 'rgba(52, 211, 153, 0.15)',
  },
  eclipse: {
    sky: ['#0a0a0a', '#1a1a1a', '#2a2a2a'],
    water: ['#050505', '#101010', '#1a1a1a'],
    particles: '#8b5cf6',
    ambient: 'rgba(139, 92, 246, 0.1)',
  },
  starfall: {
    sky: ['#0f0f23', '#1a1a3e', '#252550'],
    water: ['#080818', '#101028', '#181840'],
    particles: '#fbbf24',
    ambient: 'rgba(251, 191, 36, 0.1)',
  },
};

// 像素小人精灵配置
const PIXEL_FISHER = {
  width: 24,
  height: 32,
  boatWidth: 48,
  boatHeight: 16,
};

export function LakeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const timeRef = useRef(0);
  const clickZonesRef = useRef<ClickZone[]>([]);
  const fishingStateRef = useRef<FishingState>({
    bobberX: 0,
    bobberY: 0,
    lineStartX: 0,
    lineStartY: 0,
    isCasting: false,
    castProgress: 0,
    bobberBob: 0,
    fishPull: 0,
    targetX: 0,
    targetY: 0,
  });
  
  const [hoverZone, setHoverZone] = useState<ClickZone | null>(null);
  
  const weather = useGameStore((state) => state.weather);
  const phase = useGameStore((state) => state.phase);
  const currentFish = useGameStore((state) => state.currentFish);
  const castRod = useGameStore((state) => state.castRod);
  const updateWeatherByKarma = useGameStore((state) => state.updateWeatherByKarma);
  const incrementMoonClick = useGameStore((state) => state.incrementMoonClick);
  const moonClickCount = useGameStore((state) => state.moonClickCount);

  // 初始化波浪
  const initWaves = useCallback(() => {
    wavesRef.current = Array.from({ length: 5 }, () => ({
      offset: Math.random() * Math.PI * 2,
      amplitude: 3 + Math.random() * 4,
      frequency: 0.01 + Math.random() * 0.01,
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  // 初始化粒子
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const isStormWeather = weather.type === 'storm';
    const count = weather.type === 'bloodRain' ? 120 : 
                  isStormWeather ? 100 :
                  weather.type === 'fog' ? 60 : 
                  weather.type === 'eclipse' ? 80 :
                  weather.type === 'starfall' ? 70 : 40;
    
    const particleType = weather.type === 'bloodRain' ? 'blood' :
                         weather.type === 'fog' ? 'fog' :
                         weather.type === 'aurora' ? 'aurora' :
                         isStormWeather ? 'spark' : 'rain';
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: isStormWeather ? (Math.random() - 0.3) * 2 : (Math.random() - 0.5) * 0.5,
        vy: particleType === 'blood' || particleType === 'rain' ? 2 + Math.random() * 4 : 
            particleType === 'fog' ? (Math.random() - 0.5) * 0.3 :
            (Math.random() - 0.5) * 0.5,
        size: particleType === 'fog' ? 20 + Math.random() * 30 : Math.random() * 3 + 1,
        opacity: particleType === 'fog' ? 0.1 + Math.random() * 0.1 : Math.random() * 0.5 + 0.3,
        color: WEATHER_COLORS[weather.type].particles,
        type: particleType,
      });
    }
    
    particlesRef.current = particles;
  }, [weather.type]);

  // 初始化点击区域
  const initClickZones = useCallback((width: number, height: number) => {
    const waterLine = height * 0.45;
    const zones: ClickZone[] = [];
    
    // 浅水区（靠近船）
    zones.push({
      x: width * 0.5,
      y: waterLine + 50,
      radius: 80,
      type: 'shallow',
      rarityBonus: 0,
    });
    
    // 深水区（远离船）
    zones.push({
      x: width * 0.3,
      y: height * 0.7,
      radius: 100,
      type: 'deep',
      rarityBonus: 0.2,
    });
    
    zones.push({
      x: width * 0.7,
      y: height * 0.75,
      radius: 90,
      type: 'deep',
      rarityBonus: 0.2,
    });
    
    // 神秘区域
    zones.push({
      x: width * 0.15,
      y: height * 0.85,
      radius: 60,
      type: 'mysterious',
      rarityBonus: 0.5,
    });
    
    zones.push({
      x: width * 0.85,
      y: height * 0.9,
      radius: 50,
      type: 'mysterious',
      rarityBonus: 0.5,
    });
    
    clickZonesRef.current = zones;
  }, []);

  // 添加涟漪
  const addRipple = useCallback((x: number, y: number, size: number = 1) => {
    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: (80 + Math.random() * 40) * size,
      opacity: 0.6 * size,
    });
  }, []);

  // 获取点击区域
  const getClickZone = useCallback((x: number, y: number): ClickZone | null => {
    for (const zone of clickZonesRef.current) {
      const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
      if (dist <= zone.radius) {
        return zone;
      }
    }
    return null;
  }, []);

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const waterLine = canvas.height * 0.45;
    
    if (y > waterLine) {
      const zone = getClickZone(x, y);
      setHoverZone(zone);
    } else {
      setHoverZone(null);
    }
  }, [getClickZone]);

  // 处理点击
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const waterLine = canvas.height * 0.45;
    
    // 检查是否点击了月亮（彩蛋）- 任何时候都可以点击（除了已经触发结局）
    if (phase !== 'ending' && (weather.type === 'sunny' || weather.type === 'aurora')) {
      const moonX = canvas.width * 0.8;
      const moonY = canvas.height * 0.15;
      const moonRadius = 60; // 增大点击范围
      const distToMoon = Math.sqrt(Math.pow(x - moonX, 2) + Math.pow(y - moonY, 2));
      
      if (distToMoon < moonRadius) {
        incrementMoonClick();
        return; // 点击了月亮，不执行钓鱼逻辑
      }
    }
    
    // 游戏进行中时只能钓鱼
    if (phase !== 'idle') return;
    
    // 只能在水面点击
    if (y < waterLine) return;
    
    const zone = getClickZone(x, y);
    
    // 设置钓鱼目标位置
    fishingStateRef.current.targetX = x;
    fishingStateRef.current.targetY = y;
    fishingStateRef.current.isCasting = true;
    fishingStateRef.current.castProgress = 0;
    
    // 添加涟漪效果
    const rippleSize = zone?.type === 'mysterious' ? 1.5 : 
                       zone?.type === 'deep' ? 1.2 : 1;
    addRipple(x, y, rippleSize);
    
    // 根据区域类型显示不同反馈
    if (zone) {
      // 可以在这里传递区域信息给状态管理
      console.log(`Clicked ${zone.type} zone with rarity bonus: ${zone.rarityBonus}`);
    }
    
    // 触发抛竿 - 映射区域类型到castRod参数
    const spot = zone?.type === 'mysterious' ? 'mystic' : 
                 zone?.type === 'deep' ? 'deep' : 
                 zone?.type === 'shallow' ? 'shallow' : 'shallow';
    castRod(spot);
    
    // 更新天气（基于业力）
    updateWeatherByKarma();
  }, [phase, addRipple, castRod, getClickZone, updateWeatherByKarma]);

  // 绘制像素小人和船
  const drawPixelFisher = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
    isFishing: boolean,
    fishPull: number
  ) => {
    const bobOffset = Math.sin(time * 2) * 3;
    const baseY = y + bobOffset;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    // 绘制小船
    const boatX = x - PIXEL_FISHER.boatWidth / 2;
    const boatY = baseY;
    
    // 船身
    ctx.fillStyle = '#5c4033';
    ctx.beginPath();
    ctx.moveTo(boatX, boatY);
    ctx.lineTo(boatX + 8, boatY + PIXEL_FISHER.boatHeight);
    ctx.lineTo(boatX + PIXEL_FISHER.boatWidth - 8, boatY + PIXEL_FISHER.boatHeight);
    ctx.lineTo(boatX + PIXEL_FISHER.boatWidth, boatY);
    ctx.closePath();
    ctx.fill();
    
    // 船边装饰
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(boatX + 4, boatY, PIXEL_FISHER.boatWidth - 8, 3);
    
    // 船内阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(boatX + 10, boatY + 4, PIXEL_FISHER.boatWidth - 20, 6);
    
    // 绘制像素小人
    const personX = x - PIXEL_FISHER.width / 2 + 4;
    const personY = baseY - PIXEL_FISHER.height + 4;
    
    // 身体摇晃（钓鱼时）
    const swayAngle = isFishing ? Math.sin(time * 4 + fishPull * 2) * 0.05 : 0;
    ctx.translate(x, baseY);
    ctx.rotate(swayAngle);
    ctx.translate(-x, -baseY);
    
    // 头部
    ctx.fillStyle = '#ffd5b4';
    ctx.fillRect(personX + 8, personY, 8, 8);
    
    // 头发
    ctx.fillStyle = '#2d1f1a';
    ctx.fillRect(personX + 8, personY, 8, 3);
    ctx.fillRect(personX + 7, personY + 1, 2, 4);
    
    // 斗笠
    ctx.fillStyle = '#c4a35a';
    ctx.beginPath();
    ctx.moveTo(personX + 4, personY + 2);
    ctx.lineTo(personX + 12, personY - 4);
    ctx.lineTo(personX + 20, personY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a08040';
    ctx.fillRect(personX + 8, personY - 2, 8, 2);
    
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(personX + 10, personY + 4, 2, 2);
    ctx.fillRect(personX + 14, personY + 4, 2, 2);
    
    // 身体（袍子）
    ctx.fillStyle = '#4a6fa5';
    ctx.fillRect(personX + 6, personY + 8, 12, 14);
    
    // 袍子装饰
    ctx.fillStyle = '#2d4a6f';
    ctx.fillRect(personX + 11, personY + 8, 2, 14);
    
    // 腰带
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(personX + 6, personY + 14, 12, 2);
    
    // 手臂和钓竿
    const armAngle = isFishing ? -0.3 + Math.sin(time * 3) * 0.1 + fishPull * 0.2 : -0.2;
    
    ctx.save();
    ctx.translate(personX + 18, personY + 10);
    ctx.rotate(armAngle);
    
    // 手臂
    ctx.fillStyle = '#ffd5b4';
    ctx.fillRect(0, 0, 3, 8);
    
    // 钓竿
    ctx.fillStyle = '#654321';
    ctx.fillRect(1, -2, 2, 30);
    
    // 钓竿尖端
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(1, -2, 2, 4);
    
    ctx.restore();
    
    // 腿部
    ctx.fillStyle = '#2d4a6f';
    ctx.fillRect(personX + 8, personY + 22, 4, 6);
    ctx.fillRect(personX + 12, personY + 22, 4, 6);
    
    // 鞋子
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(personX + 7, personY + 28, 5, 3);
    ctx.fillRect(personX + 12, personY + 28, 5, 3);
    
    ctx.restore();
    
    // 绘制水面倒影（简化）
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.scale(1, -0.3);
    ctx.translate(0, -(baseY + PIXEL_FISHER.boatHeight) * 2 - 30);
    
    ctx.fillStyle = '#4a6fa5';
    ctx.fillRect(personX + 6, personY + 8, 12, 14);
    
    ctx.restore();
  }, []);

  // 绘制钓鱼线和浮标
  const drawFishingLine = useCallback((
    ctx: CanvasRenderingContext2D,
    fisherX: number,
    fisherY: number,
    time: number
  ) => {
    const fishing = fishingStateRef.current;
    
    if (phase === 'idle' && !fishing.isCasting) return;
    
    const rodTipX = fisherX + 20;
    const rodTipY = fisherY - 20;
    
    let bobberX: number;
    let bobberY: number;
    
    if (fishing.isCasting && fishing.castProgress < 1) {
      // 抛竿动画
      fishing.castProgress += 0.03;
      const progress = Math.min(fishing.castProgress, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      bobberX = rodTipX + (fishing.targetX - rodTipX) * easeProgress;
      bobberY = rodTipY + (fishing.targetY - rodTipY) * easeProgress - 
                Math.sin(easeProgress * Math.PI) * 100;
      
      if (progress >= 1) {
        fishing.isCasting = false;
        fishing.bobberX = fishing.targetX;
        fishing.bobberY = fishing.targetY;
        // 落水涟漪
        addRipple(fishing.targetX, fishing.targetY, 0.8);
      }
    } else {
      bobberX = fishing.bobberX || rodTipX + 100;
      bobberY = fishing.bobberY || fisherY + 80;
      
      // 浮标漂浮动画
      fishing.bobberBob = Math.sin(time * 3) * 3;
      bobberY += fishing.bobberBob;
      
      // 如果有鱼上钩
      if (phase === 'waiting') {
        fishing.fishPull = Math.sin(time * 8) * (0.5 + Math.random() * 0.5);
        bobberY += fishing.fishPull * 8;
        
        // 偶尔添加涟漪
        if (Math.random() > 0.97) {
          addRipple(bobberX + (Math.random() - 0.5) * 20, bobberY, 0.4);
        }
      }
      
      if (phase === 'catching' && currentFish) {
        // 根据稀有度决定拉扯强度
        const rarityPull: Record<string, number> = {
          common: 1,
          uncommon: 1.5,
          rare: 2,
          epic: 3,
          legendary: 4,
          mythical: 5,
        };
        const pullStrength = rarityPull[currentFish.rarity] || 1;
        fishing.fishPull = Math.sin(time * 10) * pullStrength;
        bobberY += fishing.fishPull * 10;
        bobberX += Math.cos(time * 8) * pullStrength * 5;
        
        // 更多涟漪
        if (Math.random() > 0.9) {
          addRipple(bobberX + (Math.random() - 0.5) * 30, bobberY, 0.6);
        }
      }
    }
    
    // 绘制钓鱼线
    ctx.beginPath();
    ctx.moveTo(rodTipX, rodTipY);
    
    // 使用贝塞尔曲线绘制自然的钓鱼线
    const controlX = (rodTipX + bobberX) / 2;
    const controlY = Math.min(rodTipY, bobberY) + 30 + Math.sin(time * 2) * 5;
    
    ctx.quadraticCurveTo(controlX, controlY, bobberX, bobberY);
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 绘制浮标
    if (!fishing.isCasting || fishing.castProgress >= 0.5) {
      const bobberSize = phase === 'catching' ? 8 + Math.abs(fishing.fishPull) * 2 : 6;
      
      // 浮标身体
      ctx.beginPath();
      ctx.ellipse(bobberX, bobberY, bobberSize / 2, bobberSize, 0, 0, Math.PI * 2);
      ctx.fillStyle = phase === 'waiting' || phase === 'catching' ? '#ef4444' : '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 浮标顶部
      ctx.beginPath();
      ctx.moveTo(bobberX, bobberY - bobberSize);
      ctx.lineTo(bobberX, bobberY - bobberSize - 8);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 等待/捕获时的脉动效果
      if (phase === 'waiting' || phase === 'catching') {
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, bobberSize * 2 + Math.sin(time * 6) * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + Math.sin(time * 4) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [phase, currentFish, addRipple]);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles(width, height);
      initClickZones(width, height);
      initWaves();
    };

    resize();
    window.addEventListener('resize', resize);

    // 颜色混合辅助函数
    const lerpColor = (color1: string, color2: string, t: number): string => {
      const hex = (c: string) => parseInt(c.slice(1), 16);
      const r1 = (hex(color1) >> 16) & 255;
      const g1 = (hex(color1) >> 8) & 255;
      const b1 = hex(color1) & 255;
      const r2 = (hex(color2) >> 16) & 255;
      const g2 = (hex(color2) >> 8) & 255;
      const b2 = hex(color2) & 255;
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      return `rgb(${r},${g},${b})`;
    };

    const render = () => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const { width, height } = canvas;
      
      // 天气过渡：混合颜色
      const transitionProgress = weather.transitionProgress ?? 1;
      const currentColors = WEATHER_COLORS[weather.type];
      const previousColors = weather.previousType 
        ? WEATHER_COLORS[weather.previousType] 
        : currentColors;
      
      // 平滑过渡的颜色
      const blendColors = (prev: string[], curr: string[], t: number) => 
        curr.map((c, i) => lerpColor(prev[i] || c, c, t));
      
      const colors = {
        sky: transitionProgress < 1 
          ? blendColors(previousColors.sky, currentColors.sky, transitionProgress)
          : currentColors.sky,
        water: transitionProgress < 1
          ? blendColors(previousColors.water, currentColors.water, transitionProgress)
          : currentColors.water,
        particles: transitionProgress < 1
          ? lerpColor(previousColors.particles, currentColors.particles, transitionProgress)
          : currentColors.particles,
        ambient: currentColors.ambient,
      };
      
      const waterLine = height * 0.45;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 绘制天空渐变
      const skyGradient = ctx.createLinearGradient(0, 0, 0, waterLine);
      colors.sky.forEach((color, i) => {
        skyGradient.addColorStop(i / (colors.sky.length - 1), color);
      });
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, waterLine);

      // 绘制星星（夜间效果）
      if (weather.type !== 'fog') {
        ctx.save();
        for (let i = 0; i < 50; i++) {
          const starX = (i * 137.5) % width;
          const starY = (i * 73.3) % (waterLine * 0.8);
          const twinkle = 0.3 + Math.sin(time * 2 + i) * 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
          ctx.fillRect(starX, starY, 2, 2);
        }
        ctx.restore();
      }

      // 绘制月亮（可点击彩蛋）
      if (weather.type === 'sunny' || weather.type === 'aurora') {
        const moonX = width * 0.8;
        const moonY = height * 0.15;
        const moonRadius = 40;
        
        ctx.save();
        
        // 月亮点击进度视觉效果
        if (moonClickCount > 0) {
          const pulseIntensity = moonClickCount / 7;
          ctx.shadowBlur = 20 + pulseIntensity * 40;
          ctx.shadowColor = weather.type === 'aurora' ? 
            `rgba(200, 200, 255, ${pulseIntensity})` : 
            `rgba(255, 250, 200, ${pulseIntensity})`;
        }
        
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fillStyle = weather.type === 'aurora' ? 
          'rgba(200, 200, 255, 0.8)' : 'rgba(255, 250, 230, 0.9)';
        ctx.fill();
        
        // 绘制神秘符文（点击进度指示）
        if (moonClickCount > 0) {
          ctx.font = '12px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = 'center';
          ctx.fillText(`${moonClickCount}/7`, moonX, moonY + 5);
        }
        
        ctx.restore();
      }

      // 绘制极光效果
      if (weather.type === 'aurora') {
        ctx.save();
        ctx.globalAlpha = 0.3 * weather.intensity;
        
        for (let i = 0; i < 4; i++) {
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.2, '#34d399');
          gradient.addColorStop(0.4, '#8b5cf6');
          gradient.addColorStop(0.6, '#ec4899');
          gradient.addColorStop(0.8, '#34d399');
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          
          const baseY = 50 + i * 40;
          ctx.moveTo(0, baseY);
          
          for (let x = 0; x <= width; x += 10) {
            const y = baseY + 
                      Math.sin(x * 0.003 + time + i * 0.5) * 40 +
                      Math.sin(x * 0.007 + time * 0.7) * 20;
            ctx.lineTo(x, y);
          }
          
          ctx.lineTo(width, baseY + 80);
          ctx.lineTo(0, baseY + 80);
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.restore();
      }

      // 绘制水面渐变
      const waterGradient = ctx.createLinearGradient(0, waterLine, 0, height);
      colors.water.forEach((color, i) => {
        waterGradient.addColorStop(i / (colors.water.length - 1), color);
      });
      ctx.fillStyle = waterGradient;
      ctx.fillRect(0, waterLine, width, height - waterLine);

      // 绘制水面波浪
      ctx.save();
      wavesRef.current.forEach((wave, i) => {
        ctx.beginPath();
        ctx.moveTo(0, waterLine);
        
        for (let x = 0; x <= width; x += 5) {
          const y = waterLine + 
                    Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = `rgba(${weather.type === 'bloodRain' ? '220, 38, 38' : '0, 160, 230'}, ${0.15 - i * 0.02})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();

      // 绘制动态区域效果（始终可见，不仅仅是悬停时）
      clickZonesRef.current.forEach((zone) => {
        const isHovered = hoverZone === zone;
        
        // 区域基础颜色和动态效果
        const zoneConfigs: Record<string, { 
          baseColor: string; 
          pulseColor: string; 
          glowIntensity: number;
          particleColor: string;
        }> = {
          shallow: { 
            baseColor: 'rgba(100, 200, 255, 0.08)', 
            pulseColor: 'rgba(150, 220, 255, 0.3)',
            glowIntensity: 0.15,
            particleColor: '#64d2ff'
          },
          deep: { 
            baseColor: 'rgba(20, 60, 120, 0.12)', 
            pulseColor: 'rgba(40, 100, 180, 0.4)',
            glowIntensity: 0.25,
            particleColor: '#3b82f6'
          },
          mysterious: { 
            baseColor: 'rgba(120, 40, 180, 0.15)', 
            pulseColor: 'rgba(180, 80, 255, 0.5)',
            glowIntensity: 0.35,
            particleColor: '#a855f7'
          },
          normal: { 
            baseColor: 'rgba(80, 140, 200, 0.06)', 
            pulseColor: 'rgba(100, 160, 220, 0.2)',
            glowIntensity: 0.1,
            particleColor: '#60a5fa'
          },
        };
        
        const config = zoneConfigs[zone.type];
        const pulsePhase = time * 2 + zone.x * 0.01;
        const pulse = Math.sin(pulsePhase) * 0.5 + 0.5;
        
        // 绘制区域底色（始终可见）
        const gradient = ctx.createRadialGradient(
          zone.x, zone.y, 0,
          zone.x, zone.y, zone.radius * 1.2
        );
        gradient.addColorStop(0, config.baseColor);
        // 正确替换 alpha 值：将最后的透明度值替换为 0.5
        const fadedColor = config.baseColor.replace(/[\d.]+\)$/, '0.02)');
        gradient.addColorStop(0.7, fadedColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制脉动光环
        const pulseRadius = zone.radius * (0.3 + pulse * 0.3);
        const pulseGradient = ctx.createRadialGradient(
          zone.x, zone.y, pulseRadius * 0.5,
          zone.x, zone.y, pulseRadius
        );
        // 正确替换 alpha 值
        const pulsedColor = config.pulseColor.replace(/[\d.]+\)$/, `${0.1 + pulse * 0.1})`);
        pulseGradient.addColorStop(0, pulsedColor);
        pulseGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = pulseGradient;
        ctx.fill();
        
        // 绘制浮动粒子效果
        for (let i = 0; i < 5; i++) {
          const angle = (time * 0.5 + i * Math.PI * 0.4) + zone.x * 0.01;
          const distance = zone.radius * (0.3 + Math.sin(time * 2 + i) * 0.2);
          const px = zone.x + Math.cos(angle) * distance;
          const py = zone.y + Math.sin(angle) * distance;
          const pSize = 2 + Math.sin(time * 3 + i * 2) * 1;
          
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = config.particleColor;
          ctx.globalAlpha = 0.3 + pulse * 0.3;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        
        if (isHovered) {
          // 悬停时的强化效果
          const hoverGradient = ctx.createRadialGradient(
            zone.x, zone.y, 0,
            zone.x, zone.y, zone.radius
          );
          hoverGradient.addColorStop(0, config.pulseColor);
          // 正确替换 alpha 值
          const fadedHoverColor = config.pulseColor.replace(/[\d.]+\)$/, '0.15)');
          hoverGradient.addColorStop(0.5, fadedHoverColor);
          hoverGradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
          ctx.fillStyle = hoverGradient;
          ctx.fill();
          
          // 悬停时的脉动边框
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, zone.radius + Math.sin(time * 4) * 5, 0, Math.PI * 2);
          // 正确替换 alpha 值
          const brightStrokeColor = config.pulseColor.replace(/[\d.]+\)$/, '0.6)');
          ctx.strokeStyle = brightStrokeColor;
          ctx.lineWidth = 2;
          ctx.stroke();
          }
        });

      // 绘制粒子
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        if (particle.type === 'fog') {
          // 雾气效果
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          gradient.addColorStop(0, `rgba(156, 163, 175, ${particle.opacity})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2
          );
        } else {
          ctx.beginPath();
          if (particle.type === 'blood' || particle.type === 'rain') {
            // 雨滴形状
            ctx.moveTo(particle.x, particle.y - particle.size * 2);
            ctx.lineTo(particle.x + particle.size, particle.y);
            ctx.lineTo(particle.x - particle.size, particle.y);
            ctx.closePath();
          } else {
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          }
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity * weather.intensity;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      // 绘制涟漪
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 1.5;
        ripple.opacity -= 0.008;

        if (ripple.opacity <= 0) return false;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${weather.type === 'bloodRain' ? '220, 100, 100' : '100, 200, 255'}, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        return true;
      });

      // 绘制闪电效果
      if (weather.type === 'storm' && Math.random() > 0.995) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#60a5fa';
        
        const startX = Math.random() * width;
        let x = startX;
        let y = 0;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        while (y < waterLine) {
          x += (Math.random() - 0.5) * 60;
          y += 15 + Math.random() * 25;
          ctx.lineTo(x, y);
          
          // 分叉
          if (Math.random() > 0.7) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 40, y + 20 + Math.random() * 20);
            ctx.moveTo(x, y);
          }
        }
        
        ctx.stroke();
        ctx.restore();
        
        // 闪电照亮效果
        ctx.fillStyle = 'rgba(100, 150, 255, 0.1)';
        ctx.fillRect(0, 0, width, height);
      }

      // 绘制像素小人和船
      const fisherX = width * 0.5;
      const fisherY = waterLine - 5;
      drawPixelFisher(
        ctx,
        fisherX,
        fisherY,
        time,
        phase !== 'idle',
        fishingStateRef.current.fishPull
      );

      // 绘制钓鱼线和浮标
      drawFishingLine(ctx, fisherX, fisherY, time);

      // 环境光效果
      ctx.fillStyle = colors.ambient;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [weather.type, weather.transitionProgress, weather.previousType, phase, currentFish, hoverZone]);

  // 获取光标样式
  const getCursor = (): string => {
    if (phase !== 'idle') return 'default';
    if (hoverZone) {
      switch (hoverZone.type) {
        case 'mysterious':
          return 'pointer';
        case 'deep':
          return 'pointer';
        case 'shallow':
          return 'pointer';
        default:
          return 'crosshair';
      }
    }
    return 'crosshair';
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 w-full h-full bg-abyss-950"
      style={{ cursor: getCursor() }}
    />
  );
}

