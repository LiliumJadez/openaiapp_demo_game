// ============================================
// BGM 音频管理器 - 支持丝滑的交叉淡入淡出
// ============================================

import type { WeatherType, EndingType } from '@/types';

// 音频配置接口
export interface AudioConfig {
  weather: Partial<Record<WeatherType, string>>;
  endings: Partial<Record<EndingType, string>>;
  volume: number;
  fadeTime: number; // 淡入淡出时间（毫秒）
}

// 默认配置
const DEFAULT_CONFIG: AudioConfig = {
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
  volume: 0.5,
  fadeTime: 2000, // 2秒交叉淡入淡出
};

class AudioManager {
  private primaryAudio: HTMLAudioElement | null = null;
  private secondaryAudio: HTMLAudioElement | null = null;
  private config: AudioConfig;
  private currentTrack: string | null = null;
  private fadeInterval: number | null = null;
  private isFading: boolean = false;

  constructor() {
    this.config = this.loadConfig();
  }

  // 加载配置
  private loadConfig(): AudioConfig {
    try {
      const saved = localStorage.getItem('imaginary-sea-audio-config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('加载音频配置失败:', error);
    }
    return DEFAULT_CONFIG;
  }

  // 保存配置
  saveConfig(config: Partial<AudioConfig>) {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem('imaginary-sea-audio-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('保存音频配置失败:', error);
    }
  }

  // 获取当前配置
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // 播放天气BGM
  playWeatherMusic(weather: WeatherType) {
    const url = this.config.weather[weather];
    if (url) {
      this.crossFadeTo(url);
    }
  }

  // 播放结局BGM
  playEndingMusic(ending: EndingType) {
    const url = this.config.endings[ending];
    if (url) {
      this.crossFadeTo(url);
    }
  }

  // 交叉淡入淡出切换音乐
  private crossFadeTo(url: string) {
    // 如果已经在播放这个音轨，不做任何事
    if (this.currentTrack === url && this.primaryAudio && !this.primaryAudio.paused) {
      return;
    }

    // 如果正在淡入淡出，取消之前的过渡
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    // 创建新的音频对象
    const newAudio = new Audio(url);
    newAudio.loop = true;
    newAudio.volume = 0; // 从0开始

    // 加载错误处理
    newAudio.addEventListener('error', (e) => {
      console.warn(`音频加载失败: ${url}`, e);
    });

    // 播放新音频
    const playPromise = newAudio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.warn('音频播放失败:', error);
      });
    }

    const oldAudio = this.primaryAudio;
    const targetVolume = this.config.volume;
    const fadeTime = this.config.fadeTime;
    const steps = 50; // 50步
    const interval = fadeTime / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    this.isFading = true;

    this.fadeInterval = window.setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // 淡入新音频
      if (newAudio) {
        newAudio.volume = Math.min(targetVolume, volumeStep * currentStep);
      }

      // 淡出旧音频
      if (oldAudio) {
        oldAudio.volume = Math.max(0, targetVolume * (1 - progress));
      }

      // 完成过渡
      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        
        // 停止并清理旧音频
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = '';
        }

        this.isFading = false;
      }
    }, interval);

    // 更新引用
    this.secondaryAudio = this.primaryAudio;
    this.primaryAudio = newAudio;
    this.currentTrack = url;
  }

  // 停止所有音乐
  stopAll() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    [this.primaryAudio, this.secondaryAudio].forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    });

    this.primaryAudio = null;
    this.secondaryAudio = null;
    this.currentTrack = null;
  }

  // 设置音量
  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
    
    if (this.primaryAudio && !this.isFading) {
      this.primaryAudio.volume = this.config.volume;
    }
    
    this.saveConfig({ volume: this.config.volume });
  }

  // 暂停/恢复
  pause() {
    if (this.primaryAudio) {
      this.primaryAudio.pause();
    }
  }

  resume() {
    if (this.primaryAudio && this.currentTrack) {
      const playPromise = this.primaryAudio.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.warn('音频恢复播放失败:', error);
        });
      }
    }
  }
}

// 单例
export const audioManager = new AudioManager();

// 导出默认配置供UI使用
export { DEFAULT_CONFIG };

