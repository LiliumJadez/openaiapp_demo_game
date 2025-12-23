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
    const { endingType, playerStats, fishCaught, significantFish } = req.body;

    const prompt = buildEndingPrompt(endingType, playerStats, fishCaught, significantFish);

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `你是虚数海的命运织者。你将为垂钓者编织最终的命运叙事。
你的叙述风格应该：
- 史诗且神秘
- 富有诗意和哲理
- 回顾玩家的旅程
- 揭示隐藏的真相
请用中文创作，篇幅约300-500字。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
      temperature: 0.85,
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
}

function buildEndingPrompt(
  endingType: string,
  playerStats: any,
  fishCaught: number,
  significantFish: string[]
): string {
  const endingThemes: Record<string, string> = {
    descent: '沉沦结局 - 暴食吞噬了灵魂，垂钓者成为了虚数海的一部分',
    avarice: '贪婪结局 - 财富堆积成山，却也成为了囚笼',
    ascension: '觉悟结局 - 慈悲之心得到回报，垂钓者获得了超脱',
    balance: '平衡结局 - 在欲望与慈悲之间找到了微妙的平衡',
    void: '虚无结局 - 体力耗尽，垂钓者在虚数海中迷失',
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

请根据以上信息，创作这个结局的完整叙事。回顾玩家的旅程，揭示虚数海的秘密，给予一个富有诗意和哲理的结局。`;
}

