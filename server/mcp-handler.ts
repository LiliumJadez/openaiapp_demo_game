import { OpenAI } from 'openai';

// OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// 游戏状态（简化版，实际应用中应该使用数据库）
interface GameSession {
  id: string;
  weather: {
    type: string;
    intensity: number;
    description: string;
    mysticalEffect: string;
  };
  visibleStats: {
    stamina: number;
    coins: number;
    fishCaught: number;
  };
  karmaStats: {
    gluttony: number;
    greed: number;
    mercy: number;
  };
  currentFish: any | null;
  collection: any[];
}

const sessions = new Map<string, GameSession>();

// 天气配置
const WEATHER_CONFIG: Record<string, { description: string; mysticalEffect: string }> = {
  sunny: {
    description: '晴空万里，湖面波光粼粼',
    mysticalEffect: '阳光穿透水面，照亮深处的秘密',
  },
  bloodRain: {
    description: '血色细雨飘落，染红了虚数之海',
    mysticalEffect: '血雨唤醒沉睡的远古存在',
  },
  fog: {
    description: '迷雾笼罩，万物隐匿其中',
    mysticalEffect: '迷雾中传来未知的低语',
  },
  storm: {
    description: '风暴肆虐，虚空震颤',
    mysticalEffect: '雷电撕裂现实与虚幻的边界',
  },
  aurora: {
    description: '极光流转，梦幻交织',
    mysticalEffect: '极光中映射着无数可能的命运',
  },
};

// 获取或创建会话
function getSession(sessionId: string): GameSession {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      weather: {
        type: 'sunny',
        intensity: 0.5,
        ...WEATHER_CONFIG.sunny,
      },
      visibleStats: {
        stamina: 100,
        coins: 0,
        fishCaught: 0,
      },
      karmaStats: {
        gluttony: 0,
        greed: 0,
        mercy: 0,
      },
      currentFish: null,
      collection: [],
    });
  }
  return sessions.get(sessionId)!;
}

// MCP 工具处理器
export async function handleMCPToolCall(
  sessionId: string,
  toolName: string,
  args: Record<string, any>
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  const session = getSession(sessionId);

  switch (toolName) {
    case 'cast_fishing_rod':
      return await handleCastRod(session, args);

    case 'make_choice':
      return handleMakeChoice(session, args);

    case 'view_stats':
      return handleViewStats(session);

    case 'view_collection':
      return handleViewCollection(session);

    case 'change_weather':
      return handleChangeWeather(session, args);

    default:
      return { success: false, error: `未知工具: ${toolName}` };
  }
}

// 处理抛竿
async function handleCastRod(
  session: GameSession,
  args: Record<string, any>
): Promise<{ success: boolean; result?: any; error?: string }> {
  // 检查体力
  if (session.visibleStats.stamina <= 0) {
    return {
      success: false,
      error: '体力耗尽，无法继续垂钓。游戏即将结束...',
    };
  }

  // 消耗体力
  session.visibleStats.stamina -= 5;

  // 更新天气（如果指定）
  if (args.weather_preference && WEATHER_CONFIG[args.weather_preference]) {
    session.weather = {
      type: args.weather_preference,
      intensity: 0.3 + Math.random() * 0.7,
      ...WEATHER_CONFIG[args.weather_preference],
    };
  } else if (Math.random() > 0.7) {
    // 随机天气变化
    const types = Object.keys(WEATHER_CONFIG);
    const newType = types[Math.floor(Math.random() * types.length)];
    session.weather = {
      type: newType,
      intensity: 0.3 + Math.random() * 0.7,
      ...WEATHER_CONFIG[newType],
    };
  }

  try {
    // 使用 GPT-4o 生成鱼类
    const fish = await generateFish(session);
    session.currentFish = fish;
    session.visibleStats.fishCaught++;

    return {
      success: true,
      result: {
        message: `🎣 你抛出了鱼线... 在${session.weather.description}的天气下，有东西上钩了！`,
        weather: session.weather,
        fish: {
          name: fish.name,
          rarity: fish.rarity,
          personality: fish.personality,
          dialogue: fish.dialogue,
          loreFragment: fish.loreFragment,
          attributes: fish.attributes,
        },
        stamina: session.visibleStats.stamina,
        prompt: `"${fish.dialogue}"\n\n这条 ${fish.name} 正在注视着你。你将如何抉择？\n- 🔥 消化：恢复 ${fish.attributes.hunger} 体力（增加暴食值）\n- 💎 收藏：获得 ${fish.attributes.value} 金币（增加贪婪值）\n- 🕊️ 放生：获取情报（增加慈悲值）`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: '生成生物失败，请稍后重试',
    };
  }
}

// 处理抉择
function handleMakeChoice(
  session: GameSession,
  args: Record<string, any>
): { success: boolean; result?: any; error?: string } {
  if (!session.currentFish) {
    return { success: false, error: '当前没有捕获的生物' };
  }

  const fish = session.currentFish;
  const choice = args.choice;
  let resultMessage = '';

  switch (choice) {
    case 'consume':
      session.visibleStats.stamina = Math.min(100, session.visibleStats.stamina + fish.attributes.hunger);
      session.karmaStats.gluttony += 15 + Math.floor(Math.random() * 10);
      resultMessage = `🔥 你吞噬了 ${fish.name}，恢复了 ${fish.attributes.hunger} 点体力。\n一阵饱足感涌来，但内心深处似乎多了一丝空虚...`;
      break;

    case 'collect':
      session.visibleStats.coins += fish.attributes.value;
      session.karmaStats.greed += 15 + Math.floor(Math.random() * 10);
      session.collection.push(fish);
      resultMessage = `💎 你将 ${fish.name} 收入了收藏。获得 ${fish.attributes.value} 金币。\n它被永远困在了你的收藏室中...`;
      break;

    case 'release':
      session.karmaStats.mercy += 15 + Math.floor(Math.random() * 10);
      resultMessage = `🕊️ 你放生了 ${fish.name}。它在消失前留下了一段信息：\n"${fish.attributes.intel}"`;
      break;

    default:
      return { success: false, error: '无效的选择' };
  }

  session.currentFish = null;

  // 检查结局
  const ending = checkEnding(session);
  if (ending) {
    resultMessage += `\n\n⚠️ ${ending.warning}`;
  }

  return {
    success: true,
    result: {
      message: resultMessage,
      stats: {
        stamina: session.visibleStats.stamina,
        coins: session.visibleStats.coins,
        fishCaught: session.visibleStats.fishCaught,
      },
      karma: session.karmaStats,
      ending: ending?.type || null,
    },
  };
}

// 查看状态
function handleViewStats(session: GameSession): { success: boolean; result?: any } {
  return {
    success: true,
    result: {
      weather: {
        type: session.weather.type,
        description: session.weather.description,
      },
      visible: session.visibleStats,
      karma: {
        gluttony: session.karmaStats.gluttony,
        greed: session.karmaStats.greed,
        mercy: session.karmaStats.mercy,
      },
      collection_count: session.collection.length,
    },
  };
}

// 查看收藏
function handleViewCollection(session: GameSession): { success: boolean; result?: any } {
  return {
    success: true,
    result: {
      count: session.collection.length,
      items: session.collection.map((f) => ({
        name: f.name,
        rarity: f.rarity,
        value: f.attributes.value,
        loreFragment: f.loreFragment,
      })),
    },
  };
}

// 改变天气
function handleChangeWeather(
  session: GameSession,
  args: Record<string, any>
): { success: boolean; result?: any; error?: string } {
  const weatherType = args.weather_type;

  if (!WEATHER_CONFIG[weatherType]) {
    return { success: false, error: '无效的天气类型' };
  }

  session.weather = {
    type: weatherType,
    intensity: 0.5 + Math.random() * 0.5,
    ...WEATHER_CONFIG[weatherType],
  };

  return {
    success: true,
    result: {
      message: `天气已变化为: ${session.weather.description}`,
      weather: session.weather,
    },
  };
}

// 生成鱼类
async function generateFish(session: GameSession) {
  const prompt = `当前天气：${session.weather.type}
天气描述：${session.weather.description}
神秘效果：${session.weather.mysticalEffect}
天气强度：${session.weather.intensity}
玩家当前状态：暴食值${session.karmaStats.gluttony}，贪婪值${session.karmaStats.greed}，慈悲值${session.karmaStats.mercy}。

请生成一条虚数生物，返回以下JSON格式：
{
  "name": "生物名称（中文，富有想象力）",
  "rarity": "稀有度（common/uncommon/rare/epic/legendary/mythical之一）",
  "personality": "性格（pleading/tempting/mysterious/aggressive/wise/innocent之一）",
  "dialogue": "生物的台词（求饶、诱惑或神秘的话语，50-100字）",
  "loreFragment": "身世碎片（关于这个生物的隐藏故事，30-60字）",
  "attributes": {
    "hunger": 数值（10-50之间，表示消化后恢复的体力）,
    "value": 数值（50-500之间，表示收藏获得的金币）,
    "intel": "情报内容（放生后获得的神秘信息，30-50字）"
  }
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `你是一个神秘的虚数海生物图鉴编纂者。你需要根据天气状态创造独特的虚数生物。
每个生物都有自己的性格、来历和秘密。它们可能求饶、诱惑、或展现神秘。
请用中文回答，风格应该神秘、诗意且略带不安。`,
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 未返回内容');
  }

  const fishData = JSON.parse(content);

  return {
    id: Date.now().toString(),
    ...fishData,
    weather: session.weather.type,
    timestamp: Date.now(),
  };
}

// 检查结局
function checkEnding(session: GameSession): { type: string; warning: string } | null {
  const KARMA_THRESHOLD = 80;

  if (session.visibleStats.stamina <= 0) {
    return { type: 'void', warning: '你的体力已经耗尽，虚无正在吞噬你...' };
  }

  if (session.karmaStats.gluttony >= KARMA_THRESHOLD) {
    return { type: 'descent', warning: '暴食的业火正在侵蚀你的灵魂...' };
  }

  if (session.karmaStats.greed >= KARMA_THRESHOLD) {
    return { type: 'avarice', warning: '贪婪的锁链正在束缚你的自由...' };
  }

  if (session.karmaStats.mercy >= KARMA_THRESHOLD) {
    return { type: 'ascension', warning: '慈悲的光辉正在照亮你的道路...' };
  }

  return null;
}

// 生成结局叙事（流式）
export async function* streamEndingNarrative(
  sessionId: string,
  endingType: string
): AsyncGenerator<string, void, unknown> {
  const session = getSession(sessionId);

  const endingThemes: Record<string, string> = {
    descent: '沉沦结局 - 暴食吞噬了灵魂，垂钓者成为了虚数海的一部分',
    avarice: '贪婪结局 - 财富堆积成山，却也成为了囚笼',
    ascension: '觉悟结局 - 慈悲之心得到回报，垂钓者获得了超脱',
    balance: '平衡结局 - 在欲望与慈悲之间找到了微妙的平衡',
    void: '虚无结局 - 体力耗尽，垂钓者在虚数海中迷失',
  };

  const prompt = `结局类型：${endingThemes[endingType] || endingType}

玩家数据：
- 捕获鱼类总数：${session.visibleStats.fishCaught}
- 最终体力：${session.visibleStats.stamina}
- 最终金币：${session.visibleStats.coins}
- 暴食值：${session.karmaStats.gluttony}
- 贪婪值：${session.karmaStats.greed}
- 慈悲值：${session.karmaStats.mercy}
- 收藏数量：${session.collection.length}
${session.collection.length > 0 ? `- 收藏的生物：${session.collection.map((f) => f.name).join('、')}` : ''}

请根据以上信息，创作这个结局的完整叙事。回顾玩家的旅程，揭示虚数海的秘密，给予一个富有诗意和哲理的结局。`;

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
      { role: 'user', content: prompt },
    ],
    stream: true,
    temperature: 0.85,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

export { getSession, sessions };

