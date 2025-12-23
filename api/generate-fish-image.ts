import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fishName, fishDescription, rarity, weather, visualKeywords } = req.body;

    const imagePrompt = buildOptimizedImagePrompt(fishName, fishDescription, rarity, weather, visualKeywords);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024', // DALL-E 3 最小尺寸
      quality: 'standard', // 标准质量降低成本
      style: 'vivid',
    });

    const imageUrl = response.data[0]?.url;

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('生成图像失败:', error);
    res.status(500).json({
      success: false,
      error: '图像生成失败',
    });
  }
}

// 优化的图像生成提示词（简洁风格化，降低成本）
function buildOptimizedImagePrompt(
  fishName: string,
  description: string,
  rarity: string,
  weather: string,
  visualKeywords?: string
): string {
  // 稀有度对应的艺术风格
  const rarityStyle: Record<string, string> = {
    common: 'simple ink wash style, minimalist',
    uncommon: 'soft watercolor, gentle glow',
    rare: 'digital art, luminescent',
    epic: 'fantasy art, magical aura',
    legendary: 'epic fantasy, golden radiance',
    mythical: 'surreal cosmic art, ethereal',
  };

  // 天气对应的色调
  const weatherTone: Record<string, string> = {
    sunny: 'warm golden light',
    bloodRain: 'dark crimson tones',
    fog: 'misty grey atmosphere',
    storm: 'electric blue accents',
    aurora: 'iridescent green purple',
    eclipse: 'deep purple shadows',
    starfall: 'golden starlight sparkles',
  };

  // 使用视觉关键词如果提供
  const keywords = visualKeywords || description || 'mysterious aquatic creature';

  // 生成简洁的提示词
  return `Fantasy fish creature icon for trading card game. ${rarityStyle[rarity] || 'watercolor style'}. ${weatherTone[weather] || 'mystical atmosphere'}. ${keywords}. Simple centered composition, clean white background, stylized art, no text, no frame. High quality icon design.`;
}
