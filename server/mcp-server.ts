import express from 'express';
import cors from 'cors';
import { handleMCPToolCall, streamEndingNarrative, getSession } from './mcp-handler';

const app = express();
const PORT = process.env.MCP_PORT || 3002;

app.use(cors());
app.use(express.json());

// ============================================
// MCP 协议端点 - 用于 ChatGPT Apps SDK
// ============================================

// MCP Manifest
app.get('/mcp/manifest', (_req, res) => {
  res.json({
    name: 'imaginary-sea-raft',
    display_name: '虚数海筏',
    description: '一款通过垂钓与未知生物进行道德博弈的网页游戏',
    version: '1.0.0',
    tools: [
      {
        name: 'cast_fishing_rod',
        description: '在虚数海中抛竿垂钓，根据当前天气状态捕获神秘生物',
        input_schema: {
          type: 'object',
          properties: {
            weather_preference: {
              type: 'string',
              description: '期望的天气类型（可选）',
              enum: ['sunny', 'bloodRain', 'fog', 'storm', 'aurora'],
            },
          },
          required: [],
        },
      },
      {
        name: 'make_choice',
        description: '对捕获的生物做出抉择：消化（恢复体力）、收藏（获得金币）或放生（获取情报）',
        input_schema: {
          type: 'object',
          properties: {
            choice: {
              type: 'string',
              description: '玩家的选择',
              enum: ['consume', 'collect', 'release'],
            },
            fish_id: {
              type: 'string',
              description: '目标生物的ID',
            },
          },
          required: ['choice'],
        },
      },
      {
        name: 'view_stats',
        description: '查看当前的游戏状态，包括体力、金币和业力值',
        input_schema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'view_collection',
        description: '查看已收藏的生物列表',
        input_schema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'change_weather',
        description: '改变当前的天气状态',
        input_schema: {
          type: 'object',
          properties: {
            weather_type: {
              type: 'string',
              description: '目标天气类型',
              enum: ['sunny', 'bloodRain', 'fog', 'storm', 'aurora'],
            },
          },
          required: ['weather_type'],
        },
      },
    ],
    prompts: [
      {
        name: 'game_introduction',
        description: '游戏介绍和规则说明',
      },
    ],
    resources: [
      {
        uri: 'game://state',
        name: '游戏状态',
        description: '当前游戏的完整状态信息',
        mime_type: 'application/json',
      },
    ],
  });
});

// 工具调用端点
app.post('/mcp/tools/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const sessionId = req.headers['x-session-id'] as string || 'default';
  const args = req.body;

  try {
    const result = await handleMCPToolCall(sessionId, toolName, args);
    res.json(result);
  } catch (error) {
    console.error('工具调用失败:', error);
    res.status(500).json({
      success: false,
      error: '工具调用失败',
    });
  }
});

// 资源端点
app.get('/mcp/resources/:resourceUri', (req, res) => {
  const { resourceUri } = req.params;
  const sessionId = req.headers['x-session-id'] as string || 'default';

  try {
    const session = getSession(sessionId);

    switch (resourceUri) {
      case 'game%3A%2F%2Fstate':
      case 'game://state':
        res.json({
          weather: session.weather,
          stats: session.visibleStats,
          karma: session.karmaStats,
          currentFish: session.currentFish,
        });
        break;

      case 'game%3A%2F%2Fcollection':
      case 'game://collection':
        res.json({
          items: session.collection,
        });
        break;

      default:
        res.status(404).json({ error: '资源未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: '获取资源失败' });
  }
});

// 流式结局端点 (SSE)
app.get('/mcp/stream/ending/:endingType', async (req, res) => {
  const { endingType } = req.params;
  const sessionId = req.headers['x-session-id'] as string || 'default';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = streamEndingNarrative(sessionId, endingType);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('流式输出失败:', error);
    res.write(`data: ${JSON.stringify({ error: '生成失败' })}\n\n`);
    res.end();
  }
});

// 提示词端点
app.get('/mcp/prompts/:promptName', (_req, res) => {
  const { promptName } = _req.params;

  const prompts: Record<string, string> = {
    game_introduction: `
# 欢迎来到虚数海筏 🎣

你是一名在虚数海上漂泊的垂钓者。这片海域存在于现实与虚幻的边界，生活着无数神秘的生物。

## 游戏规则

1. **抛竿垂钓**：点击水面或使用 cast_fishing_rod 命令开始垂钓
2. **遭遇生物**：每次垂钓都会捕获一条独特的虚数生物
3. **做出抉择**：面对每一条生物，你必须做出不可逆的选择：
   - 🔥 **消化**：恢复体力，但增加暴食值
   - 💎 **收藏**：获得金币，但增加贪婪值
   - 🕊️ **放生**：获取情报，但增加慈悲值

## 业力系统

你的每一个选择都会影响隐藏的业力值。当任意业力值达到阈值时，将触发对应的结局：
- 暴食过高 → 沉沦结局
- 贪婪过高 → 贪婪结局
- 慈悲过高 → 觉悟结局

## 天气系统

虚数海的天气会随机变化，不同天气会吸引不同类型的生物：
- ☀️ 晴空
- 🩸 血雨
- 🌫️ 迷雾
- ⛈️ 风暴
- 🌌 极光

祝你在虚数海的旅途愉快。记住：每一条生物都有它的故事...
    `.trim(),
  };

  const prompt = prompts[promptName];
  if (prompt) {
    res.json({ content: prompt });
  } else {
    res.status(404).json({ error: '提示词未找到' });
  }
});

// 健康检查
app.get('/mcp/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'imaginary-sea-raft-mcp',
    timestamp: Date.now(),
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🌊 虚数海筏 MCP 服务器运行在 http://localhost:${PORT}`);
  console.log('📡 ChatGPT Apps SDK 已就绪');
});

export default app;

