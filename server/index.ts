import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// OpenAI 客户端（用于文本生成）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// ============================================
// 火山引擎即梦 API 配置
// ============================================
const JIMENG_API_KEY = process.env.JIMENG_API_KEY || '';
const JIMENG_API_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
// 高级模型：seadream-4.5
const JIMENG_MODEL_ADVANCED = 'ep-20251223173306-m5tjd';
// 普通模型：seadream-4.0
const JIMENG_MODEL_STANDARD = 'ep-m-20251015114211-vstns';

// 即梦API调用函数（使用OpenAI SDK兼容接口）
async function generateImageWithJimeng(prompt: string, useAdvanced: boolean = false): Promise<string | null> {
  const model = useAdvanced ? JIMENG_MODEL_ADVANCED : JIMENG_MODEL_STANDARD;
  
  if (!JIMENG_API_KEY) {
    console.warn('⚠️ JIMENG_API_KEY 未设置，图像生成将失败');
    return null;
  }
  
  try {
    console.log(`即梦API调用开始 - 模型: ${model}, 提示词长度: ${prompt.length}`);
    
    // 使用 OpenAI SDK 兼容的方式调用火山引擎即梦API
    const jimengClient = new OpenAI({
      apiKey: JIMENG_API_KEY,
      baseURL: JIMENG_API_BASE,
    });
    
    const response = await jimengClient.images.generate({
      model: model,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error('即梦API未返回图像URL');
      return null;
    }
    
    console.log('即梦API调用成功，图像URL:', imageUrl.substring(0, 50) + '...');
    return imageUrl;
  } catch (error: any) {
    console.error('即梦API调用失败:', error.message || error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// ============================================
// MCP 工具定义 - 用于 ChatGPT Apps SDK
// ============================================

const mcpTools = {
  // 生成鱼类工具
  generate_fish: {
    name: 'generate_fish',
    description: '根据当前天气和玩家状态生成一条具有独特属性的虚数鱼类',
    inputSchema: {
      type: 'object',
      properties: {
        weather: {
          type: 'object',
          description: '当前天气状态',
          properties: {
            type: { type: 'string', enum: ['sunny', 'bloodRain', 'fog', 'storm', 'aurora', 'eclipse', 'starfall'] },
            intensity: { type: 'number', minimum: 0, maximum: 1 },
            description: { type: 'string' },
            mysticalEffect: { type: 'string' },
          },
          required: ['type', 'intensity'],
        },
        karmaStats: {
          type: 'object',
          description: '玩家当前业力值',
          properties: {
            gluttony: { type: 'number' },
            greed: { type: 'number' },
            mercy: { type: 'number' },
          },
        },
      },
      required: ['weather'],
    },
  },
  
  // 生成鱼类图像工具
  generate_fish_image: {
    name: 'generate_fish_image',
    description: '使用 DALL-E 3 为鱼类生成风格化卡牌图像（小尺寸低成本）',
    inputSchema: {
      type: 'object',
      properties: {
        fishName: { type: 'string', description: '鱼的名称' },
        fishDescription: { type: 'string', description: '鱼的描述' },
        rarity: { type: 'string', enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'] },
        weather: { type: 'string', description: '当前天气类型' },
      },
      required: ['fishName', 'fishDescription', 'rarity'],
    },
  },
  
  // 生成结局叙事工具
  generate_ending: {
    name: 'generate_ending',
    description: '根据结局类型和玩家历程生成最终结局叙事',
    inputSchema: {
      type: 'object',
      properties: {
        endingType: {
          type: 'string',
          enum: ['descent', 'avarice', 'ascension', 'balance', 'void'],
          description: '结局类型',
        },
        playerStats: {
          type: 'object',
          description: '玩家最终状态',
        },
        fishCaught: { type: 'number', description: '捕获鱼的数量' },
        significantFish: {
          type: 'array',
          items: { type: 'string' },
          description: '重要的鱼类名称列表',
        },
      },
      required: ['endingType'],
    },
  },
  
  // 处理玩家抉择工具
  process_choice: {
    name: 'process_choice',
    description: '处理玩家对鱼类的抉择并返回结果',
    inputSchema: {
      type: 'object',
      properties: {
        choice: {
          type: 'string',
          enum: ['consume', 'collect', 'release'],
          description: '玩家的选择：消化、收藏或放生',
        },
        fishId: { type: 'string', description: '鱼的唯一标识符' },
      },
      required: ['choice', 'fishId'],
    },
  },
};

// ============================================
// API 端点
// ============================================

// 获取 MCP 工具列表
app.get('/api/mcp/tools', (_req, res) => {
  res.json({
    tools: Object.values(mcpTools),
  });
});

// 生成鱼类 - 不再使用，改为从预设数据库获取
app.post('/api/generate-fish', async (req, res) => {
  res.status(404).json({ error: 'This endpoint is deprecated. Use client-side fish generation.' });
});

// 为预设鱼类生成独特的原名和个性化故事
app.post('/api/personalize-fish', async (req, res) => {
  try {
    const { templateName, tag, rarity, personality } = req.body;
    
    // 检查OpenAI API密钥
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY未设置');
    }
    
    const prompt = `你是虚数海的记录者。现在需要为一个灵魂生成独特的身份：

已知信息：
- 鱼形态名称：${templateName}
- 灵魂性质：${tag}
- 稀有程度：${rarity}
- 性格：${personality}

请生成：
1. originalName: 旧世界的人类姓名（中文，2-4字，有时代感）
2. dialogue: 这个灵魂的一句话（30-50字，体现其性格和处境，第一人称）
3. loreFragment: 它在旧世界的故事片段（100-200字，描述其过去的执念、美好记忆、以及对现在和未来的感知）

记住：所有虚数海中的鱼都曾是旧世界的人类。它们的故事应该真实、感人、有细节。

以JSON格式返回，字段: originalName, dialogue, loreFragment`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini', // 改用更稳定的模型
      messages: [
        {
          role: 'system',
          content: `你是虚数海的记录者，负责为每个灵魂书写独特的过往。
你的叙事风格富有诗意和哲理，能够在简短的文字中传达深刻的情感。
每个灵魂都是独一无二的，请为它们创造真实感人的故事。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.88,
      max_tokens: 600,
      timeout: 15000, // 15秒超时
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 未返回内容');
    }

    const personalData = JSON.parse(content);
    
    res.json({
      success: true,
      ...personalData,
    });
  } catch (error: any) {
    console.error('个性化鱼类失败:', error);
    
    // 返回默认数据而不是错误，避免影响游戏体验
    res.json({ 
      success: false,
      error: error.message || '个性化失败',
      // 提供默认值
      originalName: '未知者',
      dialogue: '...',
      loreFragment: '这是一个被遗忘的灵魂，它的过往已经模糊不清...',
    });
  }
});

// ============================================
// 图像生成配置 - GPT Image 系列
// ============================================
// 根据使用场景选择模型:
// - gpt-image-1: 高品质，用于传说/神话生物
// - gpt-image-1-mini: 标准品质，用于普通/稀有生物（成本更低）

type ImageQuality = 'high' | 'medium' | 'low';

function getImageModelByRarity(rarity: string): { model: string; size: string; quality: ImageQuality } {
  // GPT Image 支持的尺寸: '1024x1024', '1024x1536', '1536x1024', 'auto'
  switch (rarity) {
    case 'mythical':
    case 'legendary':
      return { model: 'gpt-image-1', size: '1024x1024', quality: 'high' };
    case 'epic':
    case 'rare':
      return { model: 'gpt-image-1', size: '1024x1024', quality: 'medium' };
    default:
      return { model: 'gpt-image-1', size: '1024x1024', quality: 'low' };
  }
}

// 生成鱼类图像 - 使用火山引擎即梦API
app.post('/api/generate-fish-image', async (req, res) => {
  try {
    const { fishName, fishDescription, rarity, weather, visualKeywords } = req.body;
    
    const imagePrompt = buildOptimizedImagePrompt(fishName, fishDescription, rarity, weather, visualKeywords);
    
    // 高稀有度使用高级模型
    const useAdvanced = rarity === 'legendary' || rarity === 'mythical' || rarity === 'epic';
    
    // 使用即梦API生成图像
    const imageUrl = await generateImageWithJimeng(imagePrompt, useAdvanced);
    
    if (!imageUrl) {
      throw new Error('图像生成未返回URL');
    }
    
    res.json({
      success: true,
      imageUrl,
      model: useAdvanced ? 'seadream-4.5' : 'seadream-4.0',
    });
  } catch (error) {
    console.error('生成图像失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '图像生成失败',
    });
  }
});

// 生成成就图标 - 使用火山引擎即梦API
app.post('/api/generate-achievement-icon', async (req, res) => {
  try {
    const { achievementName, achievementDescription, category } = req.body;
    
    const prompt = `Game achievement icon, fantasy style, centered composition:
Achievement: "${achievementName}"
Theme: ${category}
Style: Ornate medal or badge design, mystical sea theme, glowing effects, dark fantasy aesthetic.
Simple background, icon-sized, high contrast.`;
    
    // 特殊成就使用高级模型
    const useAdvanced = category === 'special';
    const imageUrl = await generateImageWithJimeng(prompt, useAdvanced);
    
    if (!imageUrl) {
      throw new Error('成就图标生成失败');
    }
    
    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('生成成就图标失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '图标生成失败',
    });
  }
});

// 生成结局叙事 (流式输出)
app.post('/api/generate-ending', async (req, res) => {
  try {
    const { endingType, playerStats, fishCaught, significantFish } = req.body;
    
    const prompt = buildEndingPrompt(endingType, playerStats, fishCaught, significantFish);
    
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 结局叙事使用高品质模型
    const stream = await openai.chat.completions.create({
      model: 'gpt-5-mini', // 结局叙事使用高品质模型
      messages: [
        {
          role: 'system',
          content: `你是虚数海的命运织者。你将为垂钓者编织最终的命运叙事。
你的叙述风格应该：
- 史诗且神秘
- 富有诗意和哲理
- 回顾玩家的旅程
- 揭示隐藏的真相
请用中文创作，篇幅约200-300字。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
      temperature: 0.85,
      max_tokens: 500, // 增加输出长度以提升质量
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('生成结局失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '结局生成失败',
    });
  }
});

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ============================================
// 辅助函数
// ============================================

function buildFishGenerationPrompt(weather: any, karmaStats: any): string {
  const weatherDescriptions: Record<string, string> = {
    sunny: '金色的阳光穿透水面，在深渊中投下斑驳的光影',
    bloodRain: '腥红的雨滴落入海中，唤醒了沉睡的记忆',
    fog: '乳白色的迷雾笼罩一切，时间在此处凝滞',
    storm: '雷电撕裂天幕，虚空在颤抖中呢喃',
    aurora: '极光如丝绸般流淌，映照出无数可能的命运',
    eclipse: '黑日高悬，万物隐匿，唯有真相在暗处闪烁',
    starfall: '星辰坠落如雨，每一颗都是某个灵魂未了的心愿',
  };

  const karmaHint = karmaStats 
    ? `（垂钓者身上萦绕着${karmaStats.gluttony > 30 ? '饥饿的气息' : ''}${karmaStats.greed > 30 ? '、贪婪的阴影' : ''}${karmaStats.mercy > 30 ? '、慈悲的微光' : ''}）`
    : '';
    
  return `此刻的虚数海：
${weatherDescriptions[weather.type] || weather.description || ''}
${karmaHint}

请回忆一个你曾在此遇见的生灵，用以下格式记录：

{
  "name": "它的名字（2-4个中文字，如同一个古老的咒语）",
  "rarity": "common/uncommon/rare/epic/legendary/mythical（依据你对它的印象）",
  "personality": "pleading/tempting/mysterious/aggressive/wise/innocent（它的性情）",
  "dialogue": "它对垂钓者说的话（40-60字，让人能听到它的声音——或恳求，或诱惑，或只是沉默中的一声叹息）",
  "loreFragment": "它的故事（60-100字）。请用散文诗的笔法书写：它曾经是谁？在漫长的岁月里，什么是它放不下的执念？什么是它最珍贵的记忆？如今被钓起的这一刻，它在想什么？不要列举要点，而是让故事自然流淌，像一首完整的短诗。",
  "visualKeywords": "它的样貌（英文，10-15词，描绘它的形态、色彩、气质，如：ancient silvery fish with melancholic eyes, translucent fins like frozen tears, faint runic scars along its body）",
  "attributes": {
    "hunger": 数值10-50,
    "value": 数值50-500,
    "intel": "它知道的秘密（20-30字，关于虚数海深处的传说）"
  }
}`;
}

// 优化的图像生成提示词（更简洁、风格化、降低成本）
function buildOptimizedImagePrompt(
  fishName: string,
  description: string,
  rarity: string,
  weather: string,
  visualKeywords?: string
): string {
  // 稀有度对应的简洁风格
  const rarityStyle: Record<string, string> = {
    common: 'simple ink sketch style',
    uncommon: 'watercolor style with soft glow',
    rare: 'digital art with luminescent effects',
    epic: 'fantasy art with magical aura',
    legendary: 'epic fantasy with golden light',
    mythical: 'surreal cosmic art style',
  };

  // 天气对应的色调
  const weatherTone: Record<string, string> = {
    sunny: 'warm golden tones',
    bloodRain: 'dark crimson palette',
    fog: 'misty grey tones',
    storm: 'electric blue highlights',
    aurora: 'iridescent green and purple',
    eclipse: 'deep purple and black',
    starfall: 'golden starlight effects',
  };

  // 优先使用视觉关键词
  const visualDesc = visualKeywords || description || 'mysterious aquatic being';

  // 生成简洁的提示词（控制复杂度降低成本）
  return `A stylized fantasy fish creature icon. ${rarityStyle[rarity] || 'watercolor style'}. ${weatherTone[weather] || 'mystical colors'}. ${visualDesc}. Simple composition, centered, white background, trading card game art style. Minimalist yet detailed. No text.`;
}

function buildEndingPrompt(
  endingType: string,
  playerStats: any,
  fishCaught: number,
  significantFish: string[]
): string {
  const endingThemes: Record<string, string> = {
    descent: '沉沦结局 - 暴食吞噬了灵魂',
    avarice: '贪婪结局 - 财富成为囚笼',
    ascension: '觉悟结局 - 慈悲之心得到超脱',
    balance: '平衡结局 - 在欲望与慈悲之间找到平衡',
    void: '虚无结局 - 在虚数海中迷失',
    hoarder: '囤积者结局 - 无尽的占有欲',
    devourer: '吞噬者结局 - 吞噬善良灵魂',
    corruptor: '堕落者结局 - 纵容邪恶蔓延',
    moonSecret: '月之秘密结局 - 揭示虚数海的终极真相',
  };

  return `结局类型：${endingThemes[endingType] || endingType}

玩家数据：
- 捕获鱼类总数：${fishCaught || 0}
- 最终体力：${playerStats?.visible?.stamina || 0}
- 最终金币：${playerStats?.visible?.coins || 0}
- 暴食值：${playerStats?.karma?.gluttony || 0}
- 贪婪值：${playerStats?.karma?.greed || 0}
- 慈悲值：${playerStats?.karma?.mercy || 0}
${significantFish?.length ? `- 重要的鱼类：${significantFish.join('、')}` : ''}

请根据以上信息，创作简短而富有诗意的结局叙事。`;
}

function generateFallbackFish(weather: any) {
  const fishData = [
    {
      name: '虚影鲤',
      dialogue: '求求你...让我回到深渊吧...那里有我等待了千年的人，她还在那里，我能感觉到...',
      loreFragment: '它曾是一位守望者的化身，在虚数海诞生之前就已存在。它最美好的记忆是日出时分与另一个灵魂的相遇。千年过去，它依然在等待重逢的那一天，即使虚数海已将一切扭曲得面目全非。',
      visualKeywords: 'ethereal translucent koi fish with flowing gossamer fins, faint human silhouette within, melancholic glowing eyes, ancient jade scales',
    },
    {
      name: '迷雾鳗',
      dialogue: '嘻嘻，如果放了我，我可以告诉你一个秘密哦~关于你来这里真正的原因...',
      loreFragment: '没有人知道它从何而来。它收集秘密，用谜语交换真相。它最执念的是那个它无法参透的谜题——自己究竟是谁创造的。它记得雾中曾有温暖的光，但那光早已消逝在无尽的灰白中。',
      visualKeywords: 'sinuous mist eel with swirling fog patterns, multiple knowing eyes, cryptic smile, body fading into vapor at edges',
    },
    {
      name: '星尘鱼',
      dialogue: '...你看见了什么？我看见了你的过去，也看见了尚未发生的未来...',
      loreFragment: '它是一颗坠落的星辰，在触及虚数海的瞬间获得了生命。它怀念天空中的孤独与辽阔，却也珍惜海中偶遇的每一个灵魂。它知道终有一天会回归虚无，但在那之前，它想看遍这片海域的每个角落。',
      visualKeywords: 'cosmic fish made of stardust and nebulae, constellation patterns on body, trailing comet tail, eyes like distant galaxies',
    },
    {
      name: '幻梦鲈',
      dialogue: '你终将明白，垂钓者最终会成为被垂钓的猎物。这是这片海域永恒的法则。',
      loreFragment: '它曾是一个垂钓者，在追逐最珍贵的猎物时坠入了虚数海。它最美好的记忆是岸边女儿的笑脸，那是它再也无法触及的温暖。如今它化作鱼形，等待着下一个垂钓者重蹈它的覆辙。',
      visualKeywords: 'bass fish with human features faintly visible, fishing hook scar on lip, wise yet tragic eyes, scales like faded memories',
    },
    {
      name: '时光鲑',
      dialogue: '这片海域的真相，你真的想知道吗？有些真相，知道了反而是诅咒...',
      loreFragment: '它逆流而上穿越时间的河流，见证过虚数海的诞生与无数次毁灭。它的执念是寻找时间的源头，阻止某个它永远不愿提及的悲剧。它最美好的记忆已经被时光冲刷得模糊不清，只剩下一种温暖的感觉。',
      visualKeywords: 'salmon with clock face patterns, flowing temporal ribbons, body shifting between young and ancient, eyes reflecting different eras',
    },
  ];
  
  const idx = Math.floor(Math.random() * fishData.length);
  const fish = fishData[idx];
  
  return {
    id: Date.now().toString(),
    name: fish.name,
    rarity: 'common',
    personality: 'mysterious',
    dialogue: fish.dialogue,
    loreFragment: fish.loreFragment,
    visualKeywords: fish.visualKeywords,
    attributes: {
      hunger: 15 + Math.floor(Math.random() * 20),
      value: 50 + Math.floor(Math.random() * 100),
      intel: '海底传来低沉的呢喃，似乎在诉说着被遗忘的故事...',
    },
    weather: weather?.type || 'sunny',
    timestamp: Date.now(),
  };
}

// 验证 OpenAI API 连接
async function verifyOpenAIConnection(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  警告: OPENAI_API_KEY 未设置');
    console.warn('   请在项目根目录创建 .env 文件并添加:');
    console.warn('   OPENAI_API_KEY=sk-your-api-key-here');
    return false;
  }
  
  try {
    console.log('🔍 验证 OpenAI API 连接...');
    
    // 测试文本生成
    const textTest = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [{ role: 'user', content: 'Say "ok" only' }],
      max_tokens: 10,
    });
    
    if (textTest.choices[0]?.message?.content) {
      console.log('✅ 文本生成服务正常');
    }
    
    // 测试图像生成（可选，因为比较贵）
    // 注释掉以节省成本，但保留代码以便调试
    /*
    console.log('🔍 验证 DALL-E 图像生成...');
    const imageTest = await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'A simple blue dot on white background',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    
    if (imageTest.data?.[0]?.url) {
      console.log('✅ 图像生成服务正常');
    }
    */
    console.log('ℹ️  图像生成服务已配置（首次使用时验证）');
    
    return true;
  } catch (error: any) {
    console.error('❌ OpenAI API 验证失败:', error.message);
    if (error.message?.includes('API key')) {
      console.error('   请检查 API Key 是否正确');
    }
    return false;
  }
}

// 启动服务器
app.listen(PORT, async () => {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('   🐟 虚数海筏 - 服务器启动中...');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log('');
  
  const isConnected = await verifyOpenAIConnection();
  
  // 检查即梦API密钥
  if (JIMENG_API_KEY) {
    console.log('✅ 火山引擎即梦API密钥已配置');
    console.log(`   模型: ${JIMENG_MODEL_ADVANCED} (高级), ${JIMENG_MODEL_STANDARD} (标准)`);
  } else {
    console.log('⚠️  火山引擎即梦API密钥未设置');
    console.log('   请在.env文件中配置 JIMENG_API_KEY');
    console.log('   图像生成功能将无法使用');
  }
  
  console.log('');
  if (isConnected) {
    console.log('🎮 服务器已就绪，可以开始游戏！');
  } else {
    console.log('⚠️  服务器启动但功能受限');
    console.log('   生物生成将使用备用数据');
  }
  console.log('═══════════════════════════════════════');
  console.log('');
});

export default app;
