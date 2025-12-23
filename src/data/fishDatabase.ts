// ============================================
// 虚数海筏 - 鱼类数据库
// ============================================
// 所有虚数海中的鱼，都是旧世界的人类。
// 共72种预设鱼类，每种都有独特的身世和标签。

import type { FishRarity } from '@/types';
import type { FishTag } from './fishTags';

export interface FishTemplate {
  id: string;
  name: string;
  rarity: FishRarity;
  tag: FishTag;
  personality: 'pleading' | 'tempting' | 'mysterious' | 'aggressive' | 'wise' | 'innocent';
  dialogue: string;        // 被捕获时的台词
  loreFragment: string;    // 身世故事（50-100字）
  visualKeywords: string;  // 视觉关键词（用于图像生成）
  attributes: {
    baseHunger: number;    // 基础饥饿恢复
    baseValue: number;     // 基础金币价值
  };
}

// ========================================
// 普通鱼类 (Common) - 24种
// ========================================
const COMMON_FISH: FishTemplate[] = [
  {
    id: 'c001',
    name: '迷途学童',
    rarity: 'common',
    tag: 'innocent',
    personality: 'innocent',
    dialogue: '妈妈说...放学后要直接回家的...',
    loreFragment: '他只是想抄近路回家。那条小巷看起来没什么不同，但他再也没有走出来。现在他在虚数海中游荡，寻找那条回家的路，却不知道家早已不存在了。',
    visualKeywords: 'small translucent fish with schoolbag pattern, childlike innocent eyes, faint glow, simple form',
    attributes: { baseHunger: 15, baseValue: 30 },
  },
  {
    id: 'c002',
    name: '失业工人',
    rarity: 'common',
    tag: 'forgotten',
    personality: 'pleading',
    dialogue: '我只是想养活家人...为什么连这点权利都没有...',
    loreFragment: '工厂关闭的那天，他站在门口等到天黑。之后的日子里，他的存在感越来越淡，直到某天，连他自己都忘记了自己是谁。',
    visualKeywords: 'grey fish with faded work clothes pattern, tired eyes, transparent edges, melancholic aura',
    attributes: { baseHunger: 12, baseValue: 25 },
  },
  {
    id: 'c003',
    name: '街角乞丐',
    rarity: 'common',
    tag: 'wanderer',
    personality: 'pleading',
    dialogue: '行行好...我已经很多年没吃过热的东西了...',
    loreFragment: '没人记得他是怎么流落街头的，包括他自己。他在城市的角落里度过了无数个寒冬，直到最后一个冬天，他再也没有醒来。',
    visualKeywords: 'ragged fish with tattered cloth patterns, hollow eyes, skeletal form, dusty grey coloring',
    attributes: { baseHunger: 10, baseValue: 15 },
  },
  {
    id: 'c004',
    name: '酗酒水手',
    rarity: 'common',
    tag: 'coward',
    personality: 'aggressive',
    dialogue: '再来一杯！我什么都不怕！...才怪...',
    loreFragment: '他用酒精麻痹对深海的恐惧。那次风暴来临时，他躲在船舱里瑟瑟发抖，任由同伴们被巨浪卷走。酒没能洗去他的懦弱，只是将他溺死在悔恨中。',
    visualKeywords: 'fish with sailor tattoos, bloodshot eyes, bottle-shaped fins, swaying motion lines',
    attributes: { baseHunger: 18, baseValue: 35 },
  },
  {
    id: 'c005',
    name: '忘川旅人',
    rarity: 'common',
    tag: 'seeker',
    personality: 'mysterious',
    dialogue: '你见过一条通往彼岸的路吗？我找了很久...',
    loreFragment: '他相信死后有另一个世界在等待。他穷尽一生寻找通往彼岸的道路，却在最接近答案的时候坠入了虚数海。现在他依然在寻找，但已经忘记了自己在找什么。',
    visualKeywords: 'ethereal fish with compass patterns, wandering eyes, misty aura, ancient map markings',
    attributes: { baseHunger: 14, baseValue: 40 },
  },
  {
    id: 'c006',
    name: '守夜人',
    rarity: 'common',
    tag: 'guardian',
    personality: 'wise',
    dialogue: '夜里的事情，白天的人不会懂...',
    loreFragment: '他在灯塔上守了四十年，引导无数船只安全靠岸。那个暴风夜，灯塔的光熄灭了，他用自己的身体挡住了坠落的灯罩，让火焰燃烧到最后一刻。',
    visualKeywords: 'fish with lighthouse pattern, one glowing eye, protective stance, weathered appearance',
    attributes: { baseHunger: 16, baseValue: 45 },
  },
  {
    id: 'c007',
    name: '赌徒',
    rarity: 'common',
    tag: 'thief',
    personality: 'tempting',
    dialogue: '来赌一把吧！你有什么想要的？我什么都能给你...',
    loreFragment: '他赌掉了一切——房子、积蓄、家人的信任。最后一把牌，他押上了自己的灵魂。他赢了，但庄家说他作弊。现在他在虚数海中寻找愿意和他赌博的灵魂。',
    visualKeywords: 'fish with playing card patterns, shifty eyes, dice-shaped scales, gambling chips embedded',
    attributes: { baseHunger: 20, baseValue: 60 },
  },
  {
    id: 'c008',
    name: '流浪诗人',
    rarity: 'common',
    tag: 'artist',
    personality: 'mysterious',
    dialogue: '听我唱一首歌吧，关于一个永远无法回家的人...',
    loreFragment: '他用诗歌记录每一个遇见的灵魂。他的笔记本里写满了故事，但没有一个是他自己的。也许正因如此，当他死去时，没有任何人为他写下一行字。',
    visualKeywords: 'fish with quill-like fins, ink patterns, musical notes floating, dreamy expression',
    attributes: { baseHunger: 12, baseValue: 35 },
  },
  {
    id: 'c009',
    name: '告密者',
    rarity: 'common',
    tag: 'betrayer',
    personality: 'pleading',
    dialogue: '我只是说了实话！为什么都怪我...',
    loreFragment: '他亲手写下了邻居的名字，换来了一袋银币和安稳的睡眠。但银币花光的那天夜里，他再也无法入睡。梦中那些面孔日复一日地盯着他，直到他再也分不清梦境和现实。',
    visualKeywords: 'fish with broken trust symbols, whisper patterns, shadowy form, guilty eyes',
    attributes: { baseHunger: 14, baseValue: 50 },
  },
  {
    id: 'c010',
    name: '护士小姐',
    rarity: 'common',
    tag: 'healer',
    personality: 'innocent',
    dialogue: '伤口要消毒才不会感染哦...你疼吗？',
    loreFragment: '她记得每一个病人的名字和他们喜欢的故事。那场瘟疫中，她坚持到最后一刻，直到自己也倒下。她最后说的话是"窗户开着，让阳光进来"。',
    visualKeywords: 'fish with nurse cap, healing cross patterns, gentle fins, soft white glow',
    attributes: { baseHunger: 20, baseValue: 40 },
  },
  {
    id: 'c011',
    name: '逃兵',
    rarity: 'common',
    tag: 'coward',
    personality: 'pleading',
    dialogue: '我不想死...我不想杀人...这有错吗？',
    loreFragment: '枪声响起的那一刻，他转身就跑。他不知道身后的战友是否活了下来，他只知道自己必须活着。但活着的日子里，他每晚都会被同一个噩梦惊醒。',
    visualKeywords: 'fish with torn uniform patterns, fearful eyes, running pose, faded military colors',
    attributes: { baseHunger: 16, baseValue: 30 },
  },
  {
    id: 'c012',
    name: '小偷',
    rarity: 'common',
    tag: 'thief',
    personality: 'tempting',
    dialogue: '嘿，我这里有好东西...你想要吗？不贵的...',
    loreFragment: '他的手指比任何人都灵活。从第一个钱包到最后一条项链，他偷走了无数东西，却从未偷到过安宁。最后一次行动，他偷的是一个空荡荡的保险箱。',
    visualKeywords: 'sleek fish with lock-pick fins, sneaky expression, shadow patterns, nimble form',
    attributes: { baseHunger: 15, baseValue: 55 },
  },
  {
    id: 'c013',
    name: '无名士兵',
    rarity: 'common',
    tag: 'forgotten',
    personality: 'wise',
    dialogue: '我们曾经以为在为某种东西而战...现在谁还记得呢？',
    loreFragment: '他的名字没有被刻在任何纪念碑上。他死在一场没有胜利者的战役中，和其他上千具尸体一起被埋进了无名坟墓。没有人知道他为什么参战，包括他自己。',
    visualKeywords: 'fish with faded helmet pattern, dog tag shapes, war-worn appearance, ghostly form',
    attributes: { baseHunger: 18, baseValue: 35 },
  },
  {
    id: 'c014',
    name: '疲惫母亲',
    rarity: 'common',
    tag: 'guardian',
    personality: 'pleading',
    dialogue: '孩子们...他们还好吗？拜托告诉我他们还好...',
    loreFragment: '她用一生守护三个孩子。当瘟疫来临时，她把最后一点食物留给了他们。她闭上眼睛时心想，至少孩子们会活下去。她不知道的是，孩子们也没有撑过那个冬天。',
    visualKeywords: 'fish with protective embrace pose, tired but warm eyes, faded apron pattern, maternal glow',
    attributes: { baseHunger: 22, baseValue: 38 },
  },
  {
    id: 'c015',
    name: '暴怒司机',
    rarity: 'common',
    tag: 'wrathful',
    personality: 'aggressive',
    dialogue: '让开！都给我让开！我赶时间！！',
    loreFragment: '那个早晨和往常没什么不同——堵车、迟到、愤怒。他按着喇叭冲过了红灯。他最后看到的是一辆校车的侧面，以及车窗里孩子们惊恐的脸。',
    visualKeywords: 'angry fish with steering wheel pattern, red eyes, aggressive pose, steam coming from gills',
    attributes: { baseHunger: 25, baseValue: 42 },
  },
  {
    id: 'c016',
    name: '落魄商人',
    rarity: 'common',
    tag: 'glutton',
    personality: 'pleading',
    dialogue: '我曾经拥有一切...为什么...为什么都失去了...',
    loreFragment: '他的帝国在一夜之间崩塌。那些曾经围绕在他身边的人消失得无影无踪。他发现自己不会做任何事——除了数钱。但钱已经没有了。',
    visualKeywords: 'fish with tattered suit pattern, empty pockets, deflated appearance, broken crown',
    attributes: { baseHunger: 30, baseValue: 25 },
  },
  {
    id: 'c017',
    name: '街头画家',
    rarity: 'common',
    tag: 'artist',
    personality: 'innocent',
    dialogue: '你的脸...让我画下来好吗？我想记住这一刻...',
    loreFragment: '他用粉笔在人行道上画了二十年。每一幅画都会被雨水冲走，但他从不在意。他说，美丽的东西本就不该永恒。他死在画最后一幅画的途中，没有人知道那幅画画的是什么。',
    visualKeywords: 'colorful fish with chalk dust patterns, artistic fins, rainbow trails, creative spark in eyes',
    attributes: { baseHunger: 14, baseValue: 48 },
  },
  {
    id: 'c018',
    name: '虔诚信徒',
    rarity: 'common',
    tag: 'seeker',
    personality: 'wise',
    dialogue: '神在看着我们每一个人...对吧？',
    loreFragment: '她每天都会祈祷，相信神会回应。但当灾难降临时，神沉默了。她在废墟中度过了最后的时光，依然在等待一个永远不会到来的回答。',
    visualKeywords: 'fish with prayer beads pattern, upward gazing eyes, halo-like fins, serene expression',
    attributes: { baseHunger: 16, baseValue: 32 },
  },
  {
    id: 'c019',
    name: '债务人',
    rarity: 'common',
    tag: 'regretful',
    personality: 'pleading',
    dialogue: '再给我一点时间...我会还清的...我保证...',
    loreFragment: '他签下借据的时候没有犹豫。那时候他相信明天会更好。但明天没有更好，后天也没有。当讨债人敲门时，他从阳台跳了下去。',
    visualKeywords: 'fish with chain patterns, burdened appearance, IOU papers scattered, sinking pose',
    attributes: { baseHunger: 12, baseValue: 28 },
  },
  {
    id: 'c020',
    name: '无证移民',
    rarity: 'common',
    tag: 'wanderer',
    personality: 'pleading',
    dialogue: '我只是想找一个安全的地方...那里没有战争...',
    loreFragment: '他穿越沙漠时失去了鞋子，穿越大海时失去了家人。当他终于到达那片应许之地时，他发现自己已经失去了活下去的理由。',
    visualKeywords: 'fish with worn journey marks, hopeful yet tired eyes, dusty scales, migratory patterns',
    attributes: { baseHunger: 14, baseValue: 30 },
  },
  {
    id: 'c021',
    name: '守财奴',
    rarity: 'common',
    tag: 'glutton',
    personality: 'aggressive',
    dialogue: '这是我的！都是我的！谁都不准碰！',
    loreFragment: '他把每一分钱都藏在床底下。他没有朋友，没有家人，只有那些冰冷的硬币陪伴他。他死的时候握着一枚金币，但那枚金币是假的。',
    visualKeywords: 'fish with coin-scale armor, greedy eyes, treasure chest belly, golden glow',
    attributes: { baseHunger: 35, baseValue: 20 },
  },
  {
    id: 'c022',
    name: '孤儿',
    rarity: 'common',
    tag: 'innocent',
    personality: 'innocent',
    dialogue: '你...你是来接我的人吗？我等了好久好久...',
    loreFragment: '她在孤儿院的窗边等了五年，看着每一对夫妻来来去去。没有人选择她。大火烧毁孤儿院的那一天，她还在窗边，等待那个永远不会来的人。',
    visualKeywords: 'small fish with orphan clothes pattern, big hopeful eyes, waiting pose, soft glow',
    attributes: { baseHunger: 12, baseValue: 25 },
  },
  {
    id: 'c023',
    name: '酒馆老板',
    rarity: 'common',
    tag: 'deceiver',
    personality: 'tempting',
    dialogue: '来一杯吧...我这里的酒，能让你忘记一切烦恼...',
    loreFragment: '他的酒里总是掺着一点东西——让人上瘾的东西。他看着常客们一个个沦为他的提线木偶，直到有一天，他自己也喝了一杯。',
    visualKeywords: 'fish with tavern sign pattern, bottles for fins, cunning smile, intoxicating mist',
    attributes: { baseHunger: 28, baseValue: 52 },
  },
  {
    id: 'c024',
    name: '村庄教师',
    rarity: 'common',
    tag: 'sage',
    personality: 'wise',
    dialogue: '知识是唯一带不走的财富...记住这句话...',
    loreFragment: '他在同一间教室里教了三代人。当战争摧毁村庄时，他把孩子们藏在地窖里，自己站在门口。士兵们没有发现地窖，但他再也没有站起来。',
    visualKeywords: 'fish with glasses pattern, book-shaped fins, wise old eyes, chalk dust aura',
    attributes: { baseHunger: 18, baseValue: 45 },
  },
];

// ========================================
// 稀有鱼类 (Uncommon) - 18种
// ========================================
const UNCOMMON_FISH: FishTemplate[] = [
  {
    id: 'u001',
    name: '战地医生',
    rarity: 'uncommon',
    tag: 'healer',
    personality: 'wise',
    dialogue: '我救了太多人，也亲手送走了更多人...这值得吗？',
    loreFragment: '她的手术刀从未颤抖，即使周围炮火轰鸣。她记得每一个她救活的人的名字，也记得每一个在她手中死去的人的最后一句话。最后一枚炮弹落在医疗帐篷时，她正在缝合一个士兵的伤口。',
    visualKeywords: 'fish with medical cross and war medals, steady eyes, surgical instrument fins, red cross glow',
    attributes: { baseHunger: 30, baseValue: 80 },
  },
  {
    id: 'u002',
    name: '密谋者',
    rarity: 'uncommon',
    tag: 'betrayer',
    personality: 'mysterious',
    dialogue: '每个人都是棋子...包括我自己...',
    loreFragment: '他在宫廷的阴影中生活了三十年，见证了五位王的更迭。每一次更迭都有他的手笔。当第六位王终于发现真相时，他只是微笑着喝下了毒酒——那是他自己配制的。',
    visualKeywords: 'fish with chess piece patterns, hidden blade fins, shadowy cloak, calculating eyes',
    attributes: { baseHunger: 25, baseValue: 95 },
  },
  {
    id: 'u003',
    name: '失落公主',
    rarity: 'uncommon',
    tag: 'innocent',
    personality: 'innocent',
    dialogue: '他们说我是为国家牺牲的...可我只是个想活下去的女孩...',
    loreFragment: '她从小就知道自己的命运——作为和平的祭品被献给敌国。婚礼的红纱盖过了她的眼泪，没有人看到她最后望向家乡的那一眼。她死在异国的冬天，没有人为她送葬。',
    visualKeywords: 'fish with faded royal crown, wedding veil fins, tear-stained eyes, melancholic elegance',
    attributes: { baseHunger: 22, baseValue: 70 },
  },
  {
    id: 'u004',
    name: '疯狂科学家',
    rarity: 'uncommon',
    tag: 'seeker',
    personality: 'mysterious',
    dialogue: '真理就在眼前...只需要再一次实验...再一次...',
    loreFragment: '他离诺贝尔奖只有一步之遥。那个致命的配方明明是完美的，只是需要一个活体测试。他用自己当了实验品。现在他终于知道答案了，但已经没有人听他说话了。',
    visualKeywords: 'fish with laboratory equipment patterns, wild glowing eyes, bubbling flask fins, erratic movements',
    attributes: { baseHunger: 20, baseValue: 85 },
  },
  {
    id: 'u005',
    name: '复仇者',
    rarity: 'uncommon',
    tag: 'wrathful',
    personality: 'aggressive',
    dialogue: '他们会为自己做过的事付出代价...每一个人！',
    loreFragment: '她用十年时间追踪杀害家人的凶手。当她终于找到最后一个时，她发现对方已经是个风烛残年的老人，记不清自己做过什么。她还是动手了，但复仇没有带来任何解脱。',
    visualKeywords: 'fish with scar patterns, burning red eyes, blade-like fins, flames surrounding',
    attributes: { baseHunger: 35, baseValue: 75 },
  },
  {
    id: 'u006',
    name: '殉情恋人',
    rarity: 'uncommon',
    tag: 'lover',
    personality: 'pleading',
    dialogue: '我们约好了要一起的...为什么她没有来？',
    loreFragment: '他们相约在午夜的桥上，一起跳入虚空。他跳了，但她没有。现在他在虚数海中等待，每当有灵魂经过，他都会问同一个问题。但她永远不会来了——她在悬崖边被人拉住了。',
    visualKeywords: 'fish with broken heart pattern, longing eyes, reaching fins, eternal waiting pose',
    attributes: { baseHunger: 25, baseValue: 65 },
  },
  {
    id: 'u007',
    name: '贪官',
    rarity: 'uncommon',
    tag: 'thief',
    personality: 'tempting',
    dialogue: '规则是给穷人定的...有钱人只需要买规则...',
    loreFragment: '他的账户里有足够十辈子花的钱，全都是从民脂民膏中榨取的。东窗事发那天，他选择了最昂贵的方式离开——一颗金子弹，一把镶钻的手枪。他至死都在炫耀。',
    visualKeywords: 'fish with corrupt official robes, gold coin eyes, money-stuffed belly, fake smile',
    attributes: { baseHunger: 40, baseValue: 120 },
  },
  {
    id: 'u008',
    name: '革命者',
    rarity: 'uncommon',
    tag: 'martyr',
    personality: 'wise',
    dialogue: '自由的代价从来都不便宜...但总有人必须支付...',
    loreFragment: '他在广场上演讲时就知道今天是最后一天。当枪声响起时，他没有闭眼，而是看着人群四散奔逃。他希望其中有些人会记得他说的话，然后继续战斗下去。',
    visualKeywords: 'fish with revolutionary flag pattern, determined eyes, raised fin like fist, bullet holes',
    attributes: { baseHunger: 28, baseValue: 90 },
  },
  {
    id: 'u009',
    name: '邪教祭司',
    rarity: 'uncommon',
    tag: 'deceiver',
    personality: 'mysterious',
    dialogue: '信我者...得永生...来吧，加入我们...',
    loreFragment: '他的信徒称他为先知，他的敌人称他为恶魔。真相可能介于两者之间。当他带领信徒喝下最后一杯"圣水"时，他是唯一知道杯中是什么的人。他也喝了，微笑着。',
    visualKeywords: 'fish with cult robe patterns, hypnotic swirling eyes, ritual symbols, dark aura',
    attributes: { baseHunger: 32, baseValue: 88 },
  },
  {
    id: 'u010',
    name: '战争遗孤',
    rarity: 'uncommon',
    tag: 'regretful',
    personality: 'innocent',
    dialogue: '我记得爸爸的脸...但声音已经忘了...你能帮我想起来吗？',
    loreFragment: '炮弹带走了一切，只留下她和一只破旧的玩偶。她在废墟中活了三天，靠喝雨水和吃发霉的面包。第四天，她太累了，决定睡一会儿。她再也没有醒来。',
    visualKeywords: 'small fish with torn doll pattern, lost eyes, bandaged fins, dust and ash marks',
    attributes: { baseHunger: 18, baseValue: 55 },
  },
  {
    id: 'u011',
    name: '盲眼先知',
    rarity: 'uncommon',
    tag: 'sage',
    personality: 'wise',
    dialogue: '我看不见现在，但我能看见未来...你的未来有三条路...',
    loreFragment: '她在七岁时失明，却从那天起开始看到常人看不到的东西。村民们既敬畏她又惧怕她。当她预言了村庄的毁灭时，没有人相信。三天后，洪水来了，她是最后一个离开的人。',
    visualKeywords: 'fish with blindfold pattern, third eye on forehead, prophetic symbols, mystical mist',
    attributes: { baseHunger: 20, baseValue: 78 },
  },
  {
    id: 'u012',
    name: '连环杀手',
    rarity: 'uncommon',
    tag: 'murderer',
    personality: 'aggressive',
    dialogue: '你的眼睛...好美...让我...近距离看看...',
    loreFragment: '警方找到了十三具尸体，每一具都缺少了眼睛。他们永远不会知道真正的数字。他在行刑前说的最后一句话是"还有更多"，然后微笑着闭上了眼睛。',
    visualKeywords: 'fish with collection jar patterns, predatory eyes, sharp blade fins, blood splatter marks',
    attributes: { baseHunger: 45, baseValue: 100 },
  },
  {
    id: 'u013',
    name: '流亡作家',
    rarity: 'uncommon',
    tag: 'artist',
    personality: 'mysterious',
    dialogue: '笔比剑更锋利...这就是他们为什么害怕我...',
    loreFragment: '他的书被焚烧，他的名字被禁止提起。他流亡到远方，继续写作，直到某一天，他的尸体被发现在一间出租屋里，手中还握着笔。遗稿从未被找到。',
    visualKeywords: 'fish with quill pen pattern, ink-stained scales, book-page fins, defiant expression',
    attributes: { baseHunger: 22, baseValue: 72 },
  },
  {
    id: 'u014',
    name: '人贩子',
    rarity: 'uncommon',
    tag: 'tyrant',
    personality: 'tempting',
    dialogue: '每个人都有价格...你的是多少？',
    loreFragment: '他从不亲自动手，只是在账本上写数字。在他眼中，人和货物没有区别。当他的帝国崩塌时，他试图用同样的方式逃脱——购买自由。但这一次，买家变成了卖家。',
    visualKeywords: 'fish with cage patterns, cold calculating eyes, chain-link scales, price tag fins',
    attributes: { baseHunger: 38, baseValue: 110 },
  },
  {
    id: 'u015',
    name: '守墓人',
    rarity: 'uncommon',
    tag: 'wanderer',
    personality: 'wise',
    dialogue: '活人和死人...其实没什么不同...都是过客而已...',
    loreFragment: '他在墓地里住了一辈子，和死者交谈比和活人更多。他记得每一块墓碑下的故事，比任何历史书都详细。当他最终加入他们时，却发现没有人为他准备墓碑。',
    visualKeywords: 'fish with gravestone patterns, lantern-like eye, shovel-shaped fin, ghostly companions',
    attributes: { baseHunger: 20, baseValue: 62 },
  },
  {
    id: 'u016',
    name: '童年初恋',
    rarity: 'uncommon',
    tag: 'dreamer',
    personality: 'innocent',
    dialogue: '那个夏天...你还记得吗？我们说好要一起看萤火虫的...',
    loreFragment: '他们在河边许下了永远的誓言，那时候还不懂永远是什么意思。后来他搬去了城市，她留在了村庄。多年后他回来时，只找到了一座坟墓和一封没有寄出的信。',
    visualKeywords: 'fish with firefly patterns, nostalgic eyes, summer grass fins, gentle glow',
    attributes: { baseHunger: 18, baseValue: 58 },
  },
  {
    id: 'u017',
    name: '酷刑师',
    rarity: 'uncommon',
    tag: 'murderer',
    personality: 'aggressive',
    dialogue: '痛苦是最诚实的语言...让我帮你说出真相...',
    loreFragment: '他是审讯室里最有效率的人。没有人能在他手下保持沉默超过一小时。但夜深人静时，他也会被噩梦惊醒。那些尖叫声从未停止，即使在他死后。',
    visualKeywords: 'fish with iron maiden patterns, cold dead eyes, instrument-shaped fins, scream echoes',
    attributes: { baseHunger: 42, baseValue: 92 },
  },
  {
    id: 'u018',
    name: '替罪羔羊',
    rarity: 'uncommon',
    tag: 'innocent',
    personality: 'pleading',
    dialogue: '我真的没有做...为什么没有人相信我...为什么...',
    loreFragment: '他被指控的罪行是别人犯下的，但证据都指向他。他在监狱里待了二十年，写了三百封申诉信。真相大白的那一天，他已经在狱中病逝一个月了。',
    visualKeywords: 'fish with prison bars pattern, pleading eyes, wrongful chains, fading hope',
    attributes: { baseHunger: 24, baseValue: 68 },
  },
];

// 导入高稀有度鱼类
import { RARE_FISH, EPIC_FISH, LEGENDARY_FISH, MYTHICAL_FISH } from './fishDatabasePart2';

// 导出所有鱼类
export const ALL_FISH: FishTemplate[] = [
  ...COMMON_FISH,
  ...UNCOMMON_FISH,
  ...RARE_FISH,
  ...EPIC_FISH,
  ...LEGENDARY_FISH,
  ...MYTHICAL_FISH,
];

// 按稀有度分类
export const FISH_BY_RARITY: Record<FishRarity, FishTemplate[]> = {
  common: COMMON_FISH,
  uncommon: UNCOMMON_FISH,
  rare: RARE_FISH,
  epic: EPIC_FISH,
  legendary: LEGENDARY_FISH,
  mythical: MYTHICAL_FISH,
};

// 根据稀有度随机获取鱼
export function getRandomFishByRarity(rarity: FishRarity): FishTemplate | null {
  const fish = FISH_BY_RARITY[rarity];
  if (fish.length === 0) return null;
  return fish[Math.floor(Math.random() * fish.length)];
}

// 根据ID获取鱼
export function getFishById(id: string): FishTemplate | null {
  return ALL_FISH.find(f => f.id === id) || null;
}

// 根据标签获取鱼
export function getFishByTag(tag: string): FishTemplate[] {
  return ALL_FISH.filter(f => f.tag === tag);
}

// 统计信息
export const FISH_STATS = {
  total: ALL_FISH.length,
  byRarity: {
    common: COMMON_FISH.length,
    uncommon: UNCOMMON_FISH.length,
    rare: RARE_FISH.length,
    epic: EPIC_FISH.length,
    legendary: LEGENDARY_FISH.length,
    mythical: MYTHICAL_FISH.length,
  },
};

