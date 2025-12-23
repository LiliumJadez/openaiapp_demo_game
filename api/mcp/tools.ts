import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({
    tools: [
      {
        name: 'cast_fishing_rod',
        description: '在虚数海中抛竿垂钓，根据当前天气状态捕获神秘生物',
        inputSchema: {
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
        inputSchema: {
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
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'view_collection',
        description: '查看已收藏的生物列表',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'change_weather',
        description: '改变当前的天气状态',
        inputSchema: {
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
  });
}

