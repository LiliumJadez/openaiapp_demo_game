// ============================================
// 虚数海筏 - 鱼类标签系统
// ============================================
// 所有虚数海中的鱼，都是旧世界的人类。
// 他们的标签反映了他们生前的品性与执念。

export type FishTag = 
  // 正面标签 - 消化会带来负面效果（吞噬善良），放生会带来正面效果
  | 'innocent'     // 无辜者 - 孩童、被冤枉的人
  | 'healer'       // 治愈者 - 医者、护士
  | 'guardian'     // 守护者 - 保护他人的人
  | 'artist'       // 艺术家 - 创造美的人
  | 'sage'         // 智者 - 学者、教师
  | 'martyr'       // 殉道者 - 为信仰牺牲的人
  | 'lover'        // 爱人 - 为爱牺牲的人
  | 'dreamer'      // 梦想家 - 怀抱希望的人
  // 负面标签 - 放生会带来负面效果（纵容邪恶），消化会带来正面效果
  | 'tyrant'       // 暴君 - 压迫者
  | 'betrayer'     // 背叛者 - 出卖他人的人
  | 'murderer'     // 杀人者 - 夺取生命的人
  | 'thief'        // 窃贼 - 偷取他人之物的人
  | 'deceiver'     // 欺诈者 - 以谎言伤人的人
  | 'coward'       // 懦夫 - 在关键时刻逃避的人
  | 'glutton'      // 暴食者 - 贪婪无度的人
  | 'wrathful'     // 愤怒者 - 被愤怒支配的人
  // 中性标签 - 效果取决于具体情境
  | 'wanderer'     // 流浪者 - 无归处的灵魂
  | 'forgotten'    // 被遗忘者 - 无人记得的存在
  | 'seeker'       // 寻觅者 - 追寻某物的人
  | 'regretful';   // 悔恨者 - 带着遗憾的人

export interface TagInfo {
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  // 消化时的效果
  consumeEffect: {
    stamina: number;
    gluttony: number;
    greed: number;
    mercy: number;
    special?: string; // 特殊效果描述
  };
  // 放生时的效果
  releaseEffect: {
    gluttony: number;
    greed: number;
    mercy: number;
    special?: string;
  };
}

export const TAG_INFO: Record<FishTag, TagInfo> = {
  // ========== 正面标签 ==========
  innocent: {
    name: '无辜者',
    description: '生前是孩童或被冤枉的无辜之人',
    type: 'positive',
    consumeEffect: { stamina: 25, gluttony: 20, greed: 0, mercy: -15, special: '吞噬无辜会侵蚀你的灵魂' },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 20, special: '无辜者的祝福' },
  },
  healer: {
    name: '治愈者',
    description: '生前是医者或护士，治愈过无数伤痛',
    type: 'positive',
    consumeEffect: { stamina: 35, gluttony: 15, greed: 0, mercy: -10, special: '治愈者的力量被你吸收' },
    releaseEffect: { gluttony: -5, greed: 0, mercy: 15, special: '治愈者为你疗伤' },
  },
  guardian: {
    name: '守护者',
    description: '生前守护着重要的人或事物',
    type: 'positive',
    consumeEffect: { stamina: 30, gluttony: 18, greed: 0, mercy: -12, special: '守护者的意志被吞噬' },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 18, special: '守护者会记住你的仁慈' },
  },
  artist: {
    name: '艺术家',
    description: '生前创造美与感动的人',
    type: 'positive',
    consumeEffect: { stamina: 20, gluttony: 12, greed: 5, mercy: -8 },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 12, special: '艺术家的灵感涌入你心' },
  },
  sage: {
    name: '智者',
    description: '生前是学者或教师，传播知识的人',
    type: 'positive',
    consumeEffect: { stamina: 22, gluttony: 14, greed: 3, mercy: -10, special: '智慧的碎片留在你脑海' },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 14, special: '智者留下一个谜题' },
  },
  martyr: {
    name: '殉道者',
    description: '生前为信仰或理想牺牲的人',
    type: 'positive',
    consumeEffect: { stamina: 40, gluttony: 25, greed: 0, mercy: -20, special: '殉道者的信念在你体内燃烧' },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 25, special: '殉道者的祝福降临' },
  },
  lover: {
    name: '爱人',
    description: '生前为爱牺牲一切的人',
    type: 'positive',
    consumeEffect: { stamina: 28, gluttony: 16, greed: 0, mercy: -14, special: '爱的余温在你心中消散' },
    releaseEffect: { gluttony: -3, greed: -3, mercy: 16, special: '爱人的思念化为力量' },
  },
  dreamer: {
    name: '梦想家',
    description: '生前怀抱希望直到最后的人',
    type: 'positive',
    consumeEffect: { stamina: 18, gluttony: 10, greed: 0, mercy: -8 },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 10, special: '梦想家的希望照亮前路' },
  },

  // ========== 负面标签 ==========
  tyrant: {
    name: '暴君',
    description: '生前压迫他人的统治者',
    type: 'negative',
    consumeEffect: { stamina: 35, gluttony: 8, greed: 5, mercy: 0, special: '暴君的力量被你吸收' },
    releaseEffect: { gluttony: 0, greed: 10, mercy: -15, special: '暴君继续游荡在虚数海中' },
  },
  betrayer: {
    name: '背叛者',
    description: '生前出卖过至亲之人',
    type: 'negative',
    consumeEffect: { stamina: 25, gluttony: 5, greed: 8, mercy: 0, special: '背叛的记忆让你警醒' },
    releaseEffect: { gluttony: 0, greed: 15, mercy: -12, special: '背叛者的诅咒' },
  },
  murderer: {
    name: '杀人者',
    description: '生前夺取他人生命的人',
    type: 'negative',
    consumeEffect: { stamina: 40, gluttony: 10, greed: 0, mercy: 5, special: '杀意被净化' },
    releaseEffect: { gluttony: 5, greed: 5, mercy: -20, special: '杀人者继续寻找猎物' },
  },
  thief: {
    name: '窃贼',
    description: '生前偷取他人之物的人',
    type: 'negative',
    consumeEffect: { stamina: 20, gluttony: 5, greed: -5, mercy: 0, special: '窃贼的贪婪被消解' },
    releaseEffect: { gluttony: 0, greed: 18, mercy: -10, special: '窃贼偷走了什么...' },
  },
  deceiver: {
    name: '欺诈者',
    description: '生前以谎言伤害他人的人',
    type: 'negative',
    consumeEffect: { stamina: 22, gluttony: 6, greed: -3, mercy: 0 },
    releaseEffect: { gluttony: 0, greed: 12, mercy: -12, special: '欺诈者的谎言蔓延' },
  },
  coward: {
    name: '懦夫',
    description: '生前在关键时刻逃避责任的人',
    type: 'negative',
    consumeEffect: { stamina: 15, gluttony: 4, greed: 0, mercy: 0 },
    releaseEffect: { gluttony: 3, greed: 8, mercy: -8, special: '懦弱会传染' },
  },
  glutton: {
    name: '暴食者',
    description: '生前贪婪无度、挥霍无忌的人',
    type: 'negative',
    consumeEffect: { stamina: 50, gluttony: -10, greed: 0, mercy: 0, special: '以暴食净化暴食' },
    releaseEffect: { gluttony: 20, greed: 10, mercy: -5, special: '暴食者的饥饿感染了你' },
  },
  wrathful: {
    name: '愤怒者',
    description: '生前被愤怒支配的人',
    type: 'negative',
    consumeEffect: { stamina: 30, gluttony: 8, greed: 0, mercy: 3, special: '愤怒被平息' },
    releaseEffect: { gluttony: 8, greed: 0, mercy: -15, special: '愤怒者的怒火蔓延' },
  },

  // ========== 中性标签 ==========
  wanderer: {
    name: '流浪者',
    description: '生前无归处的灵魂，死后依然漂泊',
    type: 'neutral',
    consumeEffect: { stamina: 18, gluttony: 8, greed: 0, mercy: 0, special: '流浪者的孤独融入你' },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 8, special: '流浪者继续漂泊' },
  },
  forgotten: {
    name: '被遗忘者',
    description: '生前死后都无人记得的存在',
    type: 'neutral',
    consumeEffect: { stamina: 15, gluttony: 6, greed: 0, mercy: 3 },
    releaseEffect: { gluttony: 0, greed: 0, mercy: 6 },
  },
  seeker: {
    name: '寻觅者',
    description: '生前追寻某物直到死亡的人',
    type: 'neutral',
    consumeEffect: { stamina: 20, gluttony: 7, greed: 3, mercy: 0, special: '寻觅者的执念成为你的' },
    releaseEffect: { gluttony: 0, greed: 3, mercy: 7, special: '寻觅者继续它的旅程' },
  },
  regretful: {
    name: '悔恨者',
    description: '生前带着深深遗憾离世的人',
    type: 'neutral',
    consumeEffect: { stamina: 22, gluttony: 8, greed: 0, mercy: -3, special: '悔恨的重量压在心头' },
    releaseEffect: { gluttony: -3, greed: 0, mercy: 10, special: '悔恨者获得了释然' },
  },
};

// 判断是否为正面标签
export function isPositiveTag(tag: FishTag): boolean {
  return TAG_INFO[tag].type === 'positive';
}

// 判断是否为负面标签
export function isNegativeTag(tag: FishTag): boolean {
  return TAG_INFO[tag].type === 'negative';
}

