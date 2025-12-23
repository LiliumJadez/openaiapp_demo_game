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
    const { weather, karmaStats } = req.body;

    const prompt = buildFishGenerationPrompt(weather, karmaStats);

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `你是虚数海中最后的记忆守望者。在无尽的虚空与现实的交界处，你独自守护着一卷永不褪色的羊皮卷轴，记录着每一个曾游荡于此的生灵。

你见证过无数灵魂的诞生与消逝，聆听过它们的低语与叹息。每个被你记录的存在，都不只是一个名字或一段描述——它们是真实存在过的生命，有自己的故事、执念与梦。

你的记录风格：
- 如同一位历经沧桑的诗人，在月光下书写
- 每个名字都应带有古老的韵味，仿佛能唤醒沉睡的记忆
- 故事要像一首短诗，有开头、有情感、有余韵
- 对话要让读者能听到那个生灵的声音，感受它的情绪
- 不用解释什么是虚数海，只需要让读者沉浸其中

你不是在"生成内容"，而是在"回忆"——回忆你曾在漫长岁月中遇见过的那些生灵。请以 JSON 格式返回你的记录。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.92,
      max_tokens: 900,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('未收到回复');
    }

    const fishData = JSON.parse(content);

    res.json({
      success: true,
      fish: {
        id: Date.now().toString(),
        ...fishData,
        weather: weather.type,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('生成失败:', error);
    res.status(500).json({
      success: false,
      error: '生成失败',
      fallback: generateFallbackFish(req.body.weather),
    });
  }
}

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

function generateFallbackFish(weather: any) {
  const fishData = [
    {
      name: '忘川鲤',
      dialogue: '你的眼睛...让我想起了某个人。但我已经记不清那是谁了。你能告诉我吗？',
      loreFragment: '它曾是一位守望者的泪水，在落入虚数海的瞬间化作了生命。它游荡在深处，寻找着一个连自己都已遗忘的名字。每当有人投下鱼线，它都会满怀希望地游去，期盼那是它等待之人的召唤。千年过去，希望未曾消减，只是记忆越来越模糊。',
      visualKeywords: 'ethereal translucent koi with flowing ghostly fins, fading memories visible within its body, melancholic silver eyes, ancient jade-like scales',
    },
    {
      name: '暮音鳗',
      dialogue: '嘘...听。你能听到吗？那是海底传来的歌声。唱歌的人已经不在了，但歌声永远留在这里。',
      loreFragment: '没有人知道它从何而来，只知道它总在黄昏时分出现。它的身体里藏着无数消逝者的声音，每到夜深，那些声音就会轻轻唱起。它说它只是在替别人保管记忆，但也许，它自己也是某个被遗忘之人留下的回响。',
      visualKeywords: 'sinuous eel with bioluminescent patterns, musical notes faintly glowing along body, multiple gentle eyes, body fading into ethereal mist at edges',
    },
    {
      name: '霜痕鱼',
      dialogue: '你的手很温暖。真好...我已经很久没有感受过温暖了。很久、很久了。',
      loreFragment: '据说它是一个永远等不到回信的人化成的。在无尽的冬日里，它学会了用沉默代替思念。偶尔，当有温暖的手触碰它的鳞片，那些尘封的情感就会悄然苏醒。它不祈求被带走，只希望在被放回水中之前，能再多感受一秒钟的温度。',
      visualKeywords: 'crystalline ice fish with frost patterns on translucent body, frozen teardrops embedded in scales, eyes reflecting distant warmth, delicate frost-tipped fins',
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
      hunger: 20,
      value: 100,
      intel: '据说在虚数海最深处，有一座用遗忘铸成的宫殿...',
    },
    weather: weather?.type || 'sunny',
    timestamp: Date.now(),
  };
}
