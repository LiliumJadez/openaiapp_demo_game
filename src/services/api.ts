import type { 
  WeatherState, 
  KarmaStats, 
  Fish, 
  EndingType,
  VisibleStats 
} from '@/types';
import { requestQueue } from '@/utils/requestQueue';

const API_BASE = '/api';

// ============================================
// 鱼类生成服务
// ============================================

export interface GenerateFishParams {
  weather: WeatherState;
  karmaStats?: KarmaStats;
}

export async function generateFish(params: GenerateFishParams): Promise<Fish> {
  const response = await fetch(`${API_BASE}/generate-fish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('生成鱼类失败');
  }

  const data = await response.json();
  
  if (data.success) {
    return data.fish;
  } else if (data.fallback) {
    return data.fallback;
  }
  
  throw new Error(data.error || '未知错误');
}

// 为鱼生成独特的原名和故事
export interface PersonalizeFishParams {
  templateName: string;
  tag: string;
  rarity: string;
  personality: string;
}

export async function personalizeFish(params: PersonalizeFishParams): Promise<{
  originalName: string;
  dialogue: string;
  loreFragment: string;
} | null> {
  // 使用请求队列避免并发过多
  return requestQueue.enqueue(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(`${API_BASE}/personalize-fish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('个性化鱼类HTTP错误:', response.status);
        return null;
      }

      const data = await response.json();
      
      // 即使success为false，也返回默认数据（服务器会提供）
      return {
        originalName: data.originalName || '未知者',
        dialogue: data.dialogue || '...',
        loreFragment: data.loreFragment || '这是一个被遗忘的灵魂...',
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('个性化鱼类超时');
      } else {
        console.warn('个性化鱼类错误:', error.message);
      }
      return null;
    }
  });
}

// ============================================
// 图像生成服务（优化版 - 小尺寸低成本）
// ============================================

export interface GenerateImageParams {
  fishName: string;
  fishDescription: string;
  rarity: string;
  weather: string;
  visualKeywords?: string; // 用于更精确的图像生成
}

export async function generateFishImage(params: GenerateImageParams): Promise<string | null> {
  // 使用请求队列避免并发过多
  return requestQueue.enqueue(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时（图像生成较慢）
      
      const response = await fetch(`${API_BASE}/generate-fish-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('图像生成HTTP错误:', response.status);
        return null;
      }

      const data = await response.json();
      return data.success ? data.imageUrl : null;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('图像生成超时');
      } else {
        console.warn('图像生成错误:', error.message);
      }
      return null;
    }
  });
}

// ============================================
// 结局生成服务 (流式)
// ============================================

export interface GenerateEndingParams {
  endingType: EndingType;
  playerStats: {
    visible: VisibleStats;
    karma: KarmaStats;
  };
  fishCaught: number;
  significantFish: string[];
}

export async function* streamEnding(
  params: GenerateEndingParams
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${API_BASE}/generate-ending`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('结局生成失败');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取响应流');
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            yield parsed.content;
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }
}

// ============================================
// 健康检查
// ============================================

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

