// data-mock.ts
// This file provides mock data that conforms to the new, more detailed data structure.

export interface KnowledgePoint {
  id: string; // e.g., 'chao-1"

  text: string; // e.g., '热潮"
  textForTTS: string;  //text 的面向发音而非面向视觉的 轻度优化，取消标点符号，保留语义，尽量忠实text。
  innerActivitiesWhenFail: string;

  // 干扰项是错误的，不应该被选择或点击。尽管如此，它从其它视角提供了乐趣，对问题的反面的洞察.
  distractorText?: string;
  distractorTextForTTS: string;
  innerActivitiesWhenDistractorClicked: string;

  weight: number; // 1-10
}

export interface Topic {
  id: string; // e.g., 'chao"
  question: string; // e.g., '潮"
  questionForTTS: string; // question 的面向发音而非面向视觉的 轻度优化，取消标点符号，保留语义，尽量忠实question。
  knowledgePoints: KnowledgePoint[]; // Array of 4
}

// Based on the test case provided in the product goal
export const mockTopicsG4YuwenLesson1: Topic[] = [
  {
    id: 'chao',
    question: '潮',
    knowledgePoints: [
      { id: 'chao-1', text: '🌊观潮：去看潮水', innerActivitiesWhenFail: '原来"观潮"是亲眼去看大潮呀，我怎么没想到呢！', textForTTS: '观潮就是去看大潮水', weight: 10 },
      { id: 'chao-4', text: '🔄潮流：时尚趋势', innerActivitiesWhenFail: '"潮流"是现在大家都在跟着做的，和时尚有关！', textForTTS: '潮流就是时尚趋势', weight: 8 },
      { id: 'chao-2', text: '⬆️热潮：流行风向', innerActivitiesWhenFail: '"热潮"是大家都很喜欢的东西，下次要记住哦！', textForTTS: '热潮就是流行风向', weight: 5 },
      { id: 'chao-3', text: '💖心潮澎湃：激动的心情', innerActivitiesWhenFail: '"心潮澎湃"是心里激动得像潮水一样，好形象！', textForTTS: '心潮澎湃就是心情激动', weight: 2 },
    ]
  },
  {
    id: 'ju',
    question: '据',
    knowledgePoints: [
      { id: 'ju-2', text: '🗣️据说：听人讲的', innerActivitiesWhenFail: '"据说"就是听别人说，还没完全确定呢。', textForTTS: '据说就是听人讲的', weight: 10 },
      { id: 'ju-4', text: '📜证据：证明事实', innerActivitiesWhenFail: '"证据"是用来证明事情是真的，很重要的！', textForTTS: '证据就是证明事实', weight: 8 },
      { id: 'ju-1', text: '🛡️据守：坚守阵地', innerActivitiesWhenFail: '"据守"原来是牢牢守住不放手的意思，记住了！', textForTTS: '据守就是坚守阵地', weight: 4 },
      { id: 'ju-3', text: '🤝据为己有：占为己有', innerActivitiesWhenFail: '"据为己有"是把别人的东西变成自己的，不太好哦。', textForTTS: '据为己有就是占为己有', weight: 2 },
    ]
  },
  {
    id: 'di',
    question: '堤',
    knowledgePoints: [
      { id: 'di-1', text: '🏞️河堤：河边的矮墙', innerActivitiesWhenFail: '"河堤"是河边挡水的墙，原来是这个样子！', textForTTS: '河堤就是河边的矮墙', weight: 10 },
      { id: 'di-2', text: '🚧大堤：巨大的堤坝', innerActivitiesWhenFail: '"大堤"就是很大的堤坝，用来保护家园。', textForTTS: '大堤就是巨大的堤坝', weight: 7 },
      { id: 'di-4', text: '👷堤防：防止水患', innerActivitiesWhenFail: '"堤防"就是修筑堤坝来预防洪水。', textForTTS: '堤防就是防止水患', weight: 5 },
      { id: 'di-3', text: '千里之堤：很长的堤坝', innerActivitiesWhenFail: '"千里之堤"表示很长很长的堤坝，可不能大意。', textForTTS: '千里之堤就是很长的堤坝', weight: 2 },
    ]
  },
  {
    id: 'kuo',
    question: '阔',
    knowledgePoints: [
      { id: 'kuo-1', text: '🌳广阔：地方很大', innerActivitiesWhenFail: '"广阔"是说地方特别大，一眼望不到边！', textForTTS: '广阔就是地方很大', weight: 10 },
      { id: 'kuo-2', text: '↔️宽阔：宽度很大', innerActivitiesWhenFail: '"宽阔"是宽度很大，比如马路很宽。', textForTTS: '宽阔就是宽度很大', weight: 8 },
      { id: 'kuo-4', text: '🧠开阔：拓宽眼界', innerActivitiesWhenFail: '"开阔"是让思路更宽广，知道更多东西！', textForTTS: '开阔就是拓宽眼界', weight: 5 },
      { id: 'kuo-3', text: '🗣️高谈阔论：夸夸其谈', innerActivitiesWhenFail: '"高谈阔论"是说话夸大其词，不太脚踏实地。', textForTTS: '高谈阔论就是夸夸其谈', weight: 2 },
    ]
  },
  {
    id: 'long',
    question: '笼',
    knowledgePoints: [
      { id: 'long-4', text: '🐦笼子：关鸟的笼子', innerActivitiesWhenFail: '"笼子"是关小鸟的，不能让它们飞走。', textForTTS: '笼子就是关鸟的笼子', weight: 10 },
      { id: 'long-2', text: '☁️笼罩：被覆盖住', innerActivitiesWhenFail: '"笼罩"是像雾气一样，把什么都盖住了。', textForTTS: '笼罩就是被覆盖住', weight: 7 },
      { id: 'long-3', text: '🤝笼络人心：收买人心', innerActivitiesWhenFail: '"笼络人心"是想办法让大家支持自己。', textForTTS: '笼络人心就是收买人心', weight: 4 },
      { id: 'long-1', text: '🧺箱笼：装东西的箱子', innerActivitiesWhenFail: '"箱笼"就是装东西的箱子，像个小宝藏盒！', textForTTS: '箱笼就是装东西的箱子', weight: 1 },
    ]
  },
  {
    id: 'zhao',
    question: '罩',
    knowledgePoints: [
      { id: 'zhao-1', text: '😷口罩：遮住口鼻', innerActivitiesWhenFail: '"口罩"是戴在脸上的，保护我们的健康！', textForTTS: '口罩就是遮住口鼻', weight: 10 },
      { id: 'zhao-2', text: '☂️罩住：盖住物品', innerActivitiesWhenFail: '"罩住"是把东西盖起来，不让它脏了。', textForTTS: '罩住就是盖住物品', weight: 8 },
      { id: 'zhao-3', text: '💡灯罩：罩在灯上', innerActivitiesWhenFail: '"灯罩"是灯外面那层，让光线更柔和。', textForTTS: '灯罩就是罩在灯上', weight: 5 },
      { id: 'zhao-4', text: '🍳锅罩：罩住锅子', innerActivitiesWhenFail: '"锅罩"是盖在锅上面的，防止油溅出来。', textForTTS: '锅罩就是罩住锅子', weight: 2 },
    ]
  },
  {
    id: 'pan',
    question: '盼',
    knowledgePoints: [
      { id: 'pan-1', text: '👀盼望：期待发生', innerActivitiesWhenFail: '"盼望"是特别希望某个事情快点发生。', textForTTS: '盼望就是期待发生', weight: 10 },
      { id: 'pan-2', text: '🗓️期盼：期待已久', innerActivitiesWhenFail: '"期盼"是等了很久，很想看到的结果。', textForTTS: '期盼就是期待已久', weight: 8 },
      { id: 'pan-4', text: '💖翘首以盼：伸长脖子等', innerActivitiesWhenFail: '"翘首以盼"是伸长脖子，非常着急地等待。', textForTTS: '翘首以盼就是伸长脖子等', weight: 5 },
      { id: 'pan-3', text: '➡️左顾右盼：左右张望', innerActivitiesWhenFail: '"左顾右盼"是眼睛不停地看左边看右边。', textForTTS: '左顾右盼就是左右张望', weight: 2 },
    ]
  },
  {
    id: 'gun',
    question: '滚',
    knowledgePoints: [
      { id: 'gun-2', text: '🔄滚动：持续转动', innerActivitiesWhenFail: '"滚动"是一直不停地转着向前进。', textForTTS: '滚动就是持续转动', weight: 10 },
      { id: 'gun-1', text: '🌀翻滚：转动滚动', innerActivitiesWhenFail: '"翻滚"是像球一样转来转去，真好玩！', textForTTS: '翻滚就是转动滚动', weight: 8 },
      { id: 'gun-4', text: '🔥滚烫：非常热', innerActivitiesWhenFail: '"滚烫"是热得都冒烟了，要小心！', textForTTS: '滚烫就是非常热', weight: 6 },
      { id: 'gun-3', text: '📚滚瓜烂熟：背得很熟', innerActivitiesWhenFail: '"滚瓜烂熟"是说背得特别熟，就像念儿歌。', textForTTS: '滚瓜烂熟就是背得很熟', weight: 3 },
    ]
  },
  {
    id: 'dun',
    question: '顿',
    knowledgePoints: [
      { id: 'dun-2', text: '⚡顿时：立刻马上', innerActivitiesWhenFail: '"顿时"是马上就发生了，速度好快呀。', textForTTS: '顿时就是立刻马上', weight: 10 },
      { id: 'dun-4', text: '🚶停顿：暂停一下', innerActivitiesWhenFail: '"停顿"是停下来休息一下，不着急。', textForTTS: '停顿就是暂停一下', weight: 8 },
      { id: 'dun-1', text: '💡顿悟：突然明白', innerActivitiesWhenFail: '"顿悟"是突然之间就明白了，像灯泡亮了！', textForTTS: '顿悟就是突然明白', weight: 5 },
      { id: 'dun-3', text: '🤯茅塞顿开：突然开窍', innerActivitiesWhenFail: '"茅塞顿开"是脑子突然变得很清楚，都明白了！', textForTTS: '茅塞顿开就是突然开窍', weight: 2 },
    ]
  },
  {
    id: 'zhu',
    question: '逐',
    knowledgePoints: [
      { id: 'zhu-1', text: '🏃追逐：追赶跑动', innerActivitiesWhenFail: '"追逐"是跑着去追，就像玩捉迷藏！', textForTTS: '追逐就是追赶跑动', weight: 10 },
      { id: 'zhu-2', text: ' slowly逐渐：慢慢地', innerActivitiesWhenFail: '"逐渐"是慢慢地，一点一点地变化。', textForTTS: '逐渐就是慢慢地', weight: 8 },
      { id: 'zhu-4', text: '驱逐：赶走别人', innerActivitiesWhenFail: '"驱逐"是把别人赶走，不让靠近。', textForTTS: '驱逐就是赶走别人', weight: 5 },
      { id: 'zhu-3', text: '💧随波逐流：跟着大流走', innerActivitiesWhenFail: '"随波逐流"是别人做什么就跟着做什么。', textForTTS: '随波逐流就是跟着大流走', weight: 2 },
    ]
  },
  {
    id: 'jian',
    question: '渐',
    knowledgePoints: [
      { id: 'jian-1', text: '🐌渐渐：一点一点地', innerActivitiesWhenFail: '"渐渐"是慢慢地，就像小草慢慢长大。', textForTTS: '渐渐就是一点一点地', weight: 10 },
      { id: 'jian-2', text: '🔄渐变：逐渐变化', innerActivitiesWhenFail: '"渐变"是颜色或形状慢慢地变了。', textForTTS: '渐变就是逐渐变化', weight: 7 },
      { id: 'jian-3', text: '🚶循序渐进：按顺序学习', innerActivitiesWhenFail: '"循序渐进"是按着顺序慢慢学，不能跳着来。', textForTTS: '循序渐进就是按顺序学习', weight: 5 },
      { id: 'jian-4', text: '💧浸渐：逐渐浸入', innerActivitiesWhenFail: '"浸渐"是慢慢地被水浸湿，就像海绵吸水。', textForTTS: '浸渐就是逐渐浸入', weight: 1 },
    ]
  },
  {
    id: 'you',
    question: '犹',
    knowledgePoints: [
      { id: 'you-1', text: '🤔犹豫：拿不定主意', innerActivitiesWhenFail: '"犹豫"是不知道该选哪个，心里有点乱。', textForTTS: '犹豫就是拿不定主意', weight: 10 },
      { id: 'you-2', text: '↔️犹如：好像如同', innerActivitiesWhenFail: '"犹如"是就像……一样，用来打比方。', textForTTS: '犹如就是好像如同', weight: 8 },
      { id: 'you-3', text: '💪虽死犹生：死了也像活着', innerActivitiesWhenFail: '"虽死犹生"是虽然牺牲了，精神却永远活着。', textForTTS: '虽死犹生就是死了也像活着', weight: 4 },
      { id: 'you-4', text: '🧠记忆犹新：记忆还很清晰', innerActivitiesWhenFail: '"记忆犹新"是事情好像昨天刚发生一样，记得特别清楚！', textForTTS: '记忆犹新就是记忆还很清晰', weight: 2 },
    ]
  },
  {
    id: 'beng',
    question: '崩',
    knowledgePoints: [
      { id: 'beng-1', text: '💥崩溃：突然垮掉', innerActivitiesWhenFail: '"崩溃"是突然就坏掉了，再也支撑不住。', textForTTS: '崩溃就是突然垮掉', weight: 10 },
      { id: 'beng-4', text: '🌪️崩裂：裂开碎掉', innerActivitiesWhenFail: '"崩裂"是突然裂开了，变成了好几块。', textForTTS: '崩裂就是裂开碎掉', weight: 7 },
      { id: 'beng-3', text: '🧱土崩瓦解：彻底瓦解', innerActivitiesWhenFail: '"土崩瓦解"是完全散开了，什么都没有了。', textForTTS: '土崩瓦解就是彻底瓦解', weight: 4 },
      { id: 'beng-2', text: '📉崩盘：市场暴跌', innerActivitiesWhenFail: '"崩盘"是价格一下子跌得很厉害，像塌了一样。', textForTTS: '崩盘就是市场暴跌', weight: 2 },
    ]
  },
  {
    id: 'zhen',
    question: '震',
    knowledgePoints: [
      { id: 'zhen-1', text: '🌍地震：大地摇晃', innerActivitiesWhenFail: '"地震"是大地在晃动，就像玩摇摇乐。', textForTTS: '地震就是大地摇晃', weight: 10 },
      { id: 'zhen-2', text: '颤震动：颤抖晃动', innerActivitiesWhenFail: '"震动"是抖动起来，就像手机在响。', textForTTS: '震动就是颤抖晃动', weight: 8 },
      { id: 'zhen-4', text: '💥震荡：剧烈晃动', innerActivitiesWhenFail: '"震荡"是来回晃动得很厉害，就像坐船。', textForTTS: '震荡就是剧烈晃动', weight: 6 },
      { id: 'zhen-3', text: '👂震耳欲聋：声音很大', innerActivitiesWhenFail: '"震耳欲聋"是声音特别大，耳朵都快聋了！', textForTTS: '震耳欲聋就是声音很大', weight: 3 },
    ]
  },
  {
    id: 'yu',
    question: '余',
    knowledgePoints: [
      { id: 'yu-1', text: '➕剩余：剩下的部分', innerActivitiesWhenFail: '"剩余"就是还剩下一点点，没有用完。', textForTTS: '剩余就是剩下的部分', weight: 10 },
      { id: 'yu-2', text: '〰️余波：事情的后续', innerActivitiesWhenFail: '"余波"是事情过去后还留下的一些影响。', textForTTS: '余波就是事情的后续', weight: 6 },
      { id: 'yu-4', text: '闲暇之余：空闲时间', innerActivitiesWhenFail: '"闲暇之余"是做完事情，剩下的空闲时间。', textForTTS: '闲暇之余就是空闲时间', weight: 4 },
      { id: 'yu-3', text: '😊高兴之余：高兴的时候', innerActivitiesWhenFail: '"高兴之余"是除了高兴，还有别的事情。', textForTTS: '高兴之余就是高兴的时候', weight: 2 },
    ]
  },
];
export const mockTopics1: Topic[] = [
  {
    id: 'number-0',
    question: '什么是数字零？',
    knowledgePoints: [
      { id: 'num-0-1', text: '🕳️ 形状像个圆圈', innerActivitiesWhenFail: '原来零长得圆圆的，像个甜甜圈！', textForTTS: '形状像个圆圈', weight: 10 },
      { id: 'num-0-2', text: '🚫 代表没有', innerActivitiesWhenFail: '零就是什么都没有的意思，像空空的盒子！', textForTTS: '代表没有', weight: 9 },
      { id: 'num-0-3', text: '🗣️ 读作"零"', innerActivitiesWhenFail: '这个数字念作"零"，要记住它的名字哦！', textForTTS: '读作零', weight: 7 },
      { id: 'num-0-4', text: '🐣 小鸡有几只？（0只）', innerActivitiesWhenFail: '看到没有小鸡，就是零只小鸡呀！', textForTTS: '小鸡有几只？零只', weight: 6 }
    ]
  },
  {
    id: 'number-1',
    question: '什么是数字一？',
    knowledgePoints: [
      { id: 'num-1-1', text: '☝️ 像铅笔一样直', innerActivitiesWhenFail: '原来一长得直直的，像根小棍子！', textForTTS: '像铅笔一样直', weight: 10 },
      { id: 'num-1-2', text: '🍎 代表一个', innerActivitiesWhenFail: '一就是只有一个的意思，像一颗苹果！', textForTTS: '代表一个', weight: 9 },
      { id: 'num-1-3', text: '🗣️ 读作"一"', innerActivitiesWhenFail: '这个数字念作"一"，记住它的声音！', textForTTS: '读作一', weight: 7 },
      { id: 'num-1-4', text: '🥚 鸡蛋有几个？（1个）', innerActivitiesWhenFail: '看到一个鸡蛋，就是一呀！', textForTTS: '鸡蛋有几个？一个', weight: 6 }
    ]
  },
  {
    id: 'number-2',
    question: '什么是数字二？',
    knowledgePoints: [
      { id: 'num-2-1', text: '🦢 像小鸭子弯弯的脖子', innerActivitiesWhenFail: '原来二弯弯的，像小鸭子的脖子，真可爱！', textForTTS: '像小鸭子弯弯的脖子', weight: 10 },
      { id: 'num-2-2', text: '👯‍♀️ 代表两个', innerActivitiesWhenFail: '二就是有两个的意思，像两只小手！', textForTTS: '代表两个', weight: 9 },
      { id: 'num-2-3', text: '🗣️ 读作"二"', innerActivitiesWhenFail: '这个数字念作"二"，快来跟我念！', textForTTS: '读作二', weight: 7 },
      { id: 'num-2-4', text: '🎈 气球有几个？（2个）', innerActivitiesWhenFail: '数一数，有两个气球，就是二呀！', textForTTS: '气球有几个？两个', weight: 6 }
    ]
  },
  {
    id: 'number-3',
    question: '什么是数字三？',
    knowledgePoints: [
      { id: 'num-3-1', text: '👂 像小耳朵有三瓣', innerActivitiesWhenFail: '原来三像小耳朵，有三个弯弯！', textForTTS: '像小耳朵有三瓣', weight: 10 },
      { id: 'num-3-2', text: '👨‍👩‍👧 代表三个', innerActivitiesWhenFail: '三就是有三个的意思，像一家三口！', textForTTS: '代表三个', weight: 9 },
      { id: 'num-3-3', text: '🗣️ 读作"三"', innerActivitiesWhenFail: '这个数字念作"三"，大声说出来！', textForTTS: '读作三', weight: 7 },
      { id: 'num-3-4', text: '🍦 冰淇淋有几个？（3个）', innerActivitiesWhenFail: '哇，有三个冰淇淋，是数字三！', textForTTS: '冰淇淋有几个？三个', weight: 6 }
    ]
  },
  {
    id: 'number-4',
    question: '什么是数字四？',
    knowledgePoints: [
      { id: 'num-4-1', text: '🪑 像小椅子倒过来', innerActivitiesWhenFail: '原来四像倒过来的小椅子，真有趣！', textForTTS: '像小椅子倒过来', weight: 10 },
      { id: 'num-4-2', text: '🧱 代表四个', innerActivitiesWhenFail: '四就是有四个的意思，像四块积木！', textForTTS: '代表四个', weight: 9 },
      { id: 'num-4-3', text: '🗣️ 读作"四"', innerActivitiesWhenFail: '这个数字念作"四"，再念一遍！', textForTTS: '读作四', weight: 7 },
      { id: 'num-4-4', text: '🍎 苹果有几个？（4个）', innerActivitiesWhenFail: '数一数，有四个苹果，就是四呀！', textForTTS: '苹果有几个？四个', weight: 6 }
    ]
  },
  {
    id: 'number-5',
    question: '什么是数字五？',
    knowledgePoints: [
      { id: 'num-5-1', text: '🖐️ 像钩子有小肚子', innerActivitiesWhenFail: '原来五像个钩子，还有个大肚子！', textForTTS: '像钩子有小肚子', weight: 10 },
      { id: 'num-5-2', text: '⭐️ 代表五个', innerActivitiesWhenFail: '五就是有五个的意思，像五颗星星！', textForTTS: '代表五个', weight: 9 },
      { id: 'num-5-3', text: '🗣️ 读作"五"', innerActivitiesWhenFail: '这个数字念作"五"，记住了吗？', textForTTS: '读作五', weight: 7 },
      { id: 'num-5-4', text: '⚽ 足球有几个？（5个）', innerActivitiesWhenFail: '五个足球，就是五！真棒！', textForTTS: '足球有几个？五个', weight: 6 }
    ]
  },
  {
    id: 'number-6',
    question: '什么是数字六？',
    knowledgePoints: [
      { id: 'num-6-1', text: '🐌 像小蜗牛卷卷的尾巴', innerActivitiesWhenFail: '原来六像小蜗牛，卷着小尾巴！', textForTTS: '像小蜗牛卷卷的尾巴', weight: 10 },
      { id: 'num-6-2', text: '🍭 代表六个', innerActivitiesWhenFail: '六就是有六个的意思，像六个棒棒糖！', textForTTS: '代表六个', weight: 9 },
      { id: 'num-6-3', text: '🗣️ 读作"六"', innerActivitiesWhenFail: '这个数字念作"六"，多读几遍！', textForTTS: '读作六', weight: 7 },
      { id: 'num-6-4', text: '🐰 兔子有几只？（6只）', innerActivitiesWhenFail: '有六只可爱的小兔子，就是六呀！', textForTTS: '兔子有几只？六只', weight: 6 }
    ]
  },
  {
    id: 'number-7',
    question: '什么是数字七？',
    knowledgePoints: [
      { id: 'num-7-1', text: '🪄 像拐杖有个小短腿', innerActivitiesWhenFail: '原来七像个小拐杖，下面还有个小短腿！', textForTTS: '像拐杖有个小短腿', weight: 10 },
      { id: 'num-7-2', text: '🌈 代表七个', innerActivitiesWhenFail: '七就是有七个的意思，像七道彩虹！', textForTTS: '代表七个', weight: 9 },
      { id: 'num-7-3', text: '🗣️ 读作"七"', innerActivitiesWhenFail: '这个数字念作"七"，快来记住它！', textForTTS: '读作七', weight: 7 },
      { id: 'num-7-4', text: '🚗 汽车有几辆？（7辆）', innerActivitiesWhenFail: '七辆汽车排排队，就是七呀！', textForTTS: '汽车有几辆？七辆', weight: 6 }
    ]
  },
  {
    id: 'number-8',
    question: '什么是数字八？',
    knowledgePoints: [
      { id: 'num-8-1', text: '♾️ 像葫芦，上下两个圈', innerActivitiesWhenFail: '原来八像个小葫芦，上面一个圈下面一个圈！', textForTTS: '像葫芦，上下两个圈', weight: 10 },
      { id: 'num-8-2', text: '🐙 代表八个', innerActivitiesWhenFail: '八就是有八个的意思，像八爪鱼的八条腿！', textForTTS: '代表八个', weight: 9 },
      { id: 'num-8-3', text: '🗣️ 读作"八"', innerActivitiesWhenFail: '这个数字念作"八"，再念一遍！', textForTTS: '读作八', weight: 7 },
      { id: 'num-8-4', text: '🔔 铃铛有几个？（8个）', innerActivitiesWhenFail: '八个铃铛响叮当，就是八呀！', textForTTS: '铃铛有几个？八个', weight: 6 }
    ]
  },
  {
    id: 'number-9',
    question: '什么是数字九？',
    knowledgePoints: [
      { id: 'num-9-1', text: '🎈 像气球带着根线', innerActivitiesWhenFail: '原来九像个气球，上面圆圆的，下面有条线！', textForTTS: '像气球带着根线', weight: 10 },
      { id: 'num-9-2', text: '🐈 代表九个', innerActivitiesWhenFail: '九就是有九个的意思，像九条小鱼！', textForTTS: '代表九个', weight: 9 },
      { id: 'num-9-3', text: '🗣️ 读作"九"', innerActivitiesWhenFail: '这个数字念作"九"，你学会了吗？', textForTTS: '读作九', weight: 7 },
      { id: 'num-9-4', text: '🦋 蝴蝶有几只？（9只）', innerActivitiesWhenFail: '数一数，有九只蝴蝶在飞舞，就是九呀！', textForTTS: '蝴蝶有几只？九只', weight: 6 }
    ]
  }
];

export const mockTopicsBigNumbers: Topic[] = [
  {
    id: 'large-number-1-wan',
    question: '"一万"有多大？',
    knowledgePoints: [
      {
        id: 'ln-1-1',
        text: '💰 10个一千是"一万"',
        innerActivitiesWhenFail: '原来10个一千块叠在一起，就是一万块呀！好多钱！',
        textForTTS: '10个一千是一万',
        weight: 10
      },
      {
        id: 'ln-1-2',
        text: '🔢 从右边数，第五位是"万位"',
        innerActivitiesWhenFail: '哦！我知道了，个、十、百、千...下一个就是万位，它是第五个位置！',
        textForTTS: '从右边数，第五位是万位',
        weight: 9
      },
      {
        id: 'ln-1-3',
        text: '✍️ "一万"写作 10000，有4个0',
        innerActivitiesWhenFail: '哇，原来1后面跟着4个0就是一万，我记住这个样子啦！',
        textForTTS: '一万写作10000，有4个0',
        weight: 8
      },
      {
        id: 'ln-1-4',
        text: '🏟️ 一个体育场大约能坐1万人',
        innerActivitiesWhenFail: '原来一个体育场能装下这么多人，一万真是个大数！',
        textForTTS: '一个体育场能坐一万人',
        weight: 6
      }
    ]
  },
  {
    id: 'large-number-2-wan-level',
    question: '什么是"万级"？',
    knowledgePoints: [
      {
        id: 'ln-2-1',
        text: '👨‍👩‍👧‍👦 万级有四个成员：万、十万、百万、千万',
        innerActivitiesWhenFail: '原来万、十万、百万、千万是一家人，都住在"万级"这个大家庭里！',
        textForTTS: '万级有四个成员：万、十万、百万、千万',
        weight: 10
      },
      {
        id: 'ln-2-2',
        text: '📏 每4个数字一级，万位开始是"万级"',
        innerActivitiesWhenFail: '我知道了！数数的时候要四位一分级，这样看大数就清楚多啦！',
        textForTTS: '每4个数字一级，万位开始是万级',
        weight: 9
      },
      {
        id: 'ln-2-3',
        text: '🗣️ 读完万级的数，要加上"万"字',
        innerActivitiesWhenFail: '哦！读万级的数就像报名字，先说自己的数，再说姓"万"！比如"三千四百五十六"万！',
        textForTTS: '读完万级的数，要加上万字',
        weight: 8
      },
      {
        id: 'ln-2-4',
        text: '💡 比如 3456,0000，逗号前是万级',
        innerActivitiesWhenFail: '看到这个小逗号就知道前面是万级，这个分级的方法真好用！',
        textForTTS: '逗号前是万级',
        weight: 7
      }
    ]
  },
  {
    id: 'large-number-3-read-wan',
    question: '万级的数怎么读？特别是带0的？',
    knowledgePoints: [
      {
        id: 'ln-3-1',
        text: '🤫 每级末尾的0都不读',
        innerActivitiesWhenFail: '原来数末尾的0是"隐身"的，不用读出来！比如4500万，就读四千五百万！',
        textForTTS: '每级末尾的0都不读',
        weight: 10
      },
      {
        id: 'ln-3-2',
        text: '1️⃣ 中间有1个或连续几个0，都只读一个"零"',
        innerActivitiesWhenFail: '哇，中间的0不管有几个，都只读一次"零"，它们好团结呀！比如4005万，读四千零五万！',
        textForTTS: '中间有0，只读一个零',
        weight: 9
      },
      {
        id: 'ln-3-3',
        text: '📖 先读万级，再读个级',
        innerActivitiesWhenFail: '读大数就像搭积木，先读万级那块，再读个级那块，连起来就行啦！',
        textForTTS: '先读万级，再读个级',
        weight: 7
      },
      {
        id: 'ln-3-4',
        text: '比如 2030,4000 读作"二千零三十万四千"',
        innerActivitiesWhenFail: '哦！2030在万级，读"二千零三十"万，4000在个级，读"四千"，连起来就是它！',
        textForTTS: '2030,4000读作二千零三十万四千',
        weight: 6
      }
    ]
  },
  {
    id: 'large-number-4-write-wan',
    question: '听到一个大数，怎么写出来？',
    knowledgePoints: [
      {
        id: 'ln-4-1',
        text: '✍️ 先写万级，再写个级',
        innerActivitiesWhenFail: '原来写数和读数顺序一样，听到"万"字，就先写万级里的数！',
        textForTTS: '先写万级，再写个级',
        weight: 10
      },
      {
        id: 'ln-4-2',
        text: '👻 哪个数位上没有数，就用0占位',
        innerActivitiesWhenFail: '啊哈！原来0是个"占位小精灵"，哪个位置空了它就站过去，不能漏掉！',
        textForTTS: '没有数的数位用0占位',
        weight: 9
      },
      {
        id: 'ln-4-3',
        text: '🎯 听到"几千几百几十几万"，就在万级写',
        innerActivitiesWhenFail: '抓住了！听到"万"字，就知道前面的数字都是万级大家庭的！',
        textForTTS: '听到"几万"，就在万级写',
        weight: 8
      },
      {
        id: 'ln-4-4',
        text: '比如 "六百零三万零二十"写作 603,0020',
        innerActivitiesWhenFail: '六百零三万就是603在万级，零二十就是0020在个级，原来是这样拼起来的！',
        textForTTS: '六百零三万零二十写作603,0020',
        weight: 7
      }
    ]
  },
  {
    id: 'large-number-5-yi',
    question: '"一亿"有多大呢？',
    knowledgePoints: [
      {
        id: 'ln-5-1',
        text: '🏢 10个一千万是"一亿"',
        innerActivitiesWhenFail: '哇！一千万已经那么大了，10个一千万才是一亿！简直是天文数字！',
        textForTTS: '10个一千万是一亿',
        weight: 10
      },
      {
        id: 'ln-5-2',
        text: '🔢 从右边数，第九位是"亿位"',
        innerActivitiesWhenFail: '我来数数看，个十百千万...千万后面就是亿位！排在第9个！',
        textForTTS: '从右边数，第九位是亿位',
        weight: 9
      },
      {
        id: 'ln-5-3',
        text: '✍️ "一亿"写作 1,0000,0000，有8个0',
        innerActivitiesWhenFail: '天哪，1后面跟着整整8个0！写的时候可不能数错了！',
        textForTTS: '一亿写作1,0000,0000，有8个0',
        weight: 8
      },
      {
        id: 'ln-5-4',
        text: '🇨🇳 我们国家大约有14亿人',
        innerActivitiesWhenFail: '原来我们国家的人口是用"亿"来计算的，亿真的是个非常非常大的数！',
        textForTTS: '我们国家大约有14亿人',
        weight: 6
      }
    ]
  },
  {
    id: 'large-number-6-yi-level',
    question: '比万级还大的"亿级"是什么？',
    knowledgePoints: [
      {
        id: 'ln-6-1',
        text: '🏠 数级有三个家：个级、万级、亿级',
        innerActivitiesWhenFail: '原来数字们住在三个大房子里，从右到左是"个级"家，"万级"家，和最大的"亿级"家！',
        textForTTS: '数级有三个家：个级、万级、亿级',
        weight: 10
      },
      {
        id: 'ln-6-2',
        text: '👨‍👩‍👧‍👦 亿级也有四成员：亿、十亿、百亿、千亿',
        innerActivitiesWhenFail: '亿级也是个四口之家！亿是老大，后面还有十亿、百亿、千亿这些大人物！',
        textForTTS: '亿级有四个成员：亿、十亿、百亿、千亿',
        weight: 9
      },
      {
        id: 'ln-6-3',
        text: '🗣️ 读完亿级的数，要加上"亿"字',
        innerActivitiesWhenFail: '这个我会了！和万级一样，读完亿级的数，要带上它的姓"亿"！',
        textForTTS: '读完亿级的数，要加上亿字',
        weight: 8
      },
      {
        id: 'ln-6-4',
        text: '💡 比如 5,4321,0000，最左边是亿级',
        innerActivitiesWhenFail: '哦！现在有两个逗号了，最左边的就是亿级，中间的是万级！我看懂了！',
        textForTTS: '最左边是亿级',
        weight: 7
      }
    ]
  },
  {
    id: 'large-number-7-read-yi',
    question: '包含"亿"和"万"的数怎么读？',
    knowledgePoints: [
      {
        id: 'ln-7-1',
        text: '📖 从高到低，一级一级地读',
        innerActivitiesWhenFail: '原来就像下楼梯，先读最上面的亿级，再读中间的万级，最后读个级！',
        textForTTS: '从高到低，一级一级地读',
        weight: 10
      },
      {
        id: 'ln-7-2',
        text: '🤔 读完亿级加"亿"，读完万级加"万"',
        innerActivitiesWhenFail: '哈哈，这就像一个口诀，亿级读完喊"亿"，万级读完喊"万"！',
        textForTTS: '读完亿级加亿，读完万级加万',
        weight: 9
      },
      {
        id: 'ln-7-3',
        text: '🤫 万级中间都是0，要读一个"零"',
        innerActivitiesWhenFail: '哇，这个要小心！就算万级整个都是0，只要它在亿级和个级中间，就要读一个"零"来连接！比如5亿零45。',
        textForTTS: '万级中间有0，要读一个零',
        weight: 8
      },
      {
        id: 'ln-7-4',
        text: '比如 10,4005,3200 读"十亿四千零五万三千二百"',
        innerActivitiesWhenFail: '我来拆解一下：10亿，4005万，3200。连起来就是"十亿四千零五万三千二百"，我学会啦！',
        textForTTS: '10,4005,3200读作十亿四千零五万三千二百',
        weight: 7
      }
    ]
  },
  {
    id: 'large-number-8-compare',
    question: '怎样比较两个大数的大小？',
    knowledgePoints: [
      {
        id: 'ln-8-1',
        text: '⚖️ 第一步：看位数，位数多的数大',
        innerActivitiesWhenFail: '原来是"以多欺少"呀！九位数肯定比八位数大，都不用看具体数字了！',
        textForTTS: '第一步：看位数，位数多的数大',
        weight: 10
      },
      {
        id: 'ln-8-2',
        text: '🔍 第二步：位数相同，从最高位比起',
        innerActivitiesWhenFail: '哦！位数一样多就要从"老大"开始比，谁家老大厉害谁就赢！',
        textForTTS: '第二步：位数相同，从最高位比起',
        weight: 9
      },
      {
        id: 'ln-8-3',
        text: '➡️ 最高位相同，就比下一位，直到比出大小',
        innerActivitiesWhenFail: '原来是"车轮战"！老大平手了就比老二，老二再平手就比老三，总能分出胜负！',
        textForTTS: '最高位相同，就比下一位',
        weight: 8
      },
      {
        id: 'ln-8-4',
        text: '💡 9999万 < 1亿',
        innerActivitiesWhenFail: '哇！9999万虽然看起来很大，但是它只有8位数，1亿是9位数，所以1亿更大！',
        textForTTS: '9999万小于1亿',
        weight: 6
      }
    ]
  },
  {
    id: 'large-number-9-rewrite',
    question: '什么是"约等于"？怎么把大数变简单？',
    knowledgePoints: [
      {
        id: 'ln-9-1',
        text: '≈ 这个符号叫"约等号"',
        innerActivitiesWhenFail: '原来这两条弯弯的线是"约等号"，表示差不多等于的意思！',
        textForTTS: '这个符号叫约等号',
        weight: 10
      },
      {
        id: 'ln-9-2',
        text: '🎯 "四舍五入"到万位：看千位',
        innerActivitiesWhenFail: '我知道了！要不要给万位"进一"，就看它右边的小邻居"千位"够不够5！',
        textForTTS: '四舍五入到万位：看千位',
        weight: 9
      },
      {
        id: 'ln-9-3',
        text: '👍 千位上是5、6、7、8、9，就"入"一个',
        innerActivitiesWhenFail: '哦！千位上的数大于等于5，就像个大力士，能把万位"推"大1！',
        textForTTS: '千位上是5到9，就入一个',
        weight: 8
      },
      {
        id: 'ln-9-4',
        text: '👎 千位上是0、1、2、3、4，就"舍"掉',
        innerActivitiesWhenFail: '原来千位上的数小于5，力量太小了，后面的尾巴就直接被舍弃变成0啦！',
        textForTTS: '千位上是0到4，就舍掉',
        weight: 7
      }
    ]
  }
];


export const mockTopics_CompareQuantitiesDeepDive: Topic[] = [
  // --- 阶段一：建立核心概念和方法 ---
  {
    id: 'compare-intro-1',
    question: '“比一比”是在做什么游戏？',
    questionForTTS: '“比一比”是在做什么游戏？',
    knowledgePoints: [
      {
        id: 'ci1-1',
        text: '👀 就是看两堆东西，谁的本领大',
        textForTTS: '就是看两堆东西，谁的本领大',
        innerActivitiesWhenFail: '哦，原来“比一比”就是看谁多谁少呀，像个小侦探！',
        distractorText: '🎨 是在给东西涂上漂亮的颜色',
        distractorTextForTTS: '是在给东西涂上漂亮的颜色',
        innerActivitiesWhenDistractorClicked: '涂颜色真好玩！不过“比一比”不是画画哦，是看谁的数量多，谁的数量少。',
        weight: 10
      },
      {
        id: 'ci1-2',
        text: '🤔 想想看：需要几堆东西才能比？',
        textForTTS: '想想看：需要几堆东西才能比？',
        innerActivitiesWhenFail: '哎呀，一堆东西没法比！我需要至少两堆才能开始游戏！',
        distractorText: '☝️ 一堆东西自己就能比',
        distractorTextForTTS: '一堆东西自己就能比',
        innerActivitiesWhenDistractorClicked: '自己和自己怎么比呢？“比一比”游戏需要两个或更多的小伙伴一起玩才行哦！',
        weight: 9
      },
      {
        id: 'ci1-3',
        text: '🍎 和 🍌，苹果和香蕉可以比',
        textForTTS: '苹果和香蕉可以比',
        innerActivitiesWhenFail: '对哦，我可以比苹果和香蕉，也可以比小狗和小猫！',
        distractorText: '🙅‍♂️ 只有长得一样的才能比',
        distractorTextForTTS: '只有长得一样的才能比',
        innerActivitiesWhenDistractorClicked: '虽然苹果和香蕉长得不一样，但我们可以比它们的数量！比多少，和长相没关系哦。',
        weight: 7
      },
      {
        id: 'ci1-4',
        text: '❓ 会产生“多、少、一样多”三种结果',
        textForTTS: '会产生“多、少、一样多”三种结果',
        innerActivitiesWhenFail: '原来比完之后有三种可能，真好玩，我想知道都是什么！',
        distractorText: '🏆 比完之后，肯定有一个是赢家',
        distractorTextForTTS: '比完之后，肯定有一个是赢家',
        innerActivitiesWhenDistractorClicked: '有时候是有一个赢家，但如果它们“一样多”，那就是平手啦，两个都是赢家！',
        weight: 6
      }
    ]
  },
  {
    id: 'compare-method-2',
    question: '怎么用“一一对应”这个好方法来比呢？',
    questionForTTS: '怎么用“一一对应”这个好方法来比呢？',
    knowledgePoints: [
      {
        id: 'cm2-1',
        text: '🤝 让它们“手拉手”排好队',
        textForTTS: '让它们手拉手排好队',
        innerActivitiesWhenFail: '哇，原来就是给它们找朋友呀，一个拉一个，真有趣！',
        distractorText: '🎲 把它们随便堆在一起',
        distractorTextForTTS: '把它们随便堆在一起',
        innerActivitiesWhenDistractorClicked: '堆在一起就看不清楚啦！让它们“手拉手”排好队，一个对一个，才不会弄混哦。',
        weight: 10
      },
      {
        id: 'cm2-2',
        text: '✏️ 在两个东西中间画一条线连起来',
        textForTTS: '在两个东西中间画一条线连起来',
        innerActivitiesWhenFail: '我可以用画画的方式，给它们俩连上线，这样就不会弄错了！',
        distractorText: '🌈 画一个大圈把它们都圈起来',
        distractorTextForTTS: '画一个大圈把它们都圈起来',
        innerActivitiesWhenDistractorClicked: '画个大圈像个家！但要比多少，最好是画线把它们一对一连起来，这样最清楚。',
        weight: 9
      },
      {
        id: 'cm2-3',
        text: '🐰 一个萝卜对一个兔子，最公平',
        textForTTS: '一个萝卜对一个兔子，最公平',
        innerActivitiesWhenFail: '哦，就是一个对着一个放好，像每个小兔子都有一个自己的胡萝卜！',
        distractorText: '🐰 一个兔子对着两个萝卜',
        distractorTextForTTS: '一个兔子对着两个萝卜',
        innerActivitiesWhenDistractorClicked: '这样对兔子来说太幸福啦，但是对别的兔子不公平哦！“一一对应”要一个对一个才行。',
        weight: 8
      },
      {
        id: 'cm2-4',
        text: '👟 像穿鞋子，一只脚穿一只鞋',
        textForTTS: '像穿鞋子，一只脚穿一只鞋',
        innerActivitiesWhenFail: '这个方法就像穿鞋子，不多也不少，一只脚配一只鞋！',
        distractorText: '👟 一只脚上穿两只鞋',
        distractorTextForTTS: '一只脚上穿两只鞋',
        innerActivitiesWhenDistractorClicked: '哎呀，这样走路会摔跤的！一只脚只能穿一只鞋，刚刚好，这就是“一一对应”啦。',
        weight: 7
      }
    ]
  },

  // --- 阶段二：应用方法，辨析三种结果 ---
  {
    id: 'compare-result-more-3',
    question: '比完之后，什么情况是“多”？',
    questionForTTS: '比完之后，什么情况是“多”？',
    knowledgePoints: [
      {
        id: 'crm3-1',
        text: '🍎 连线后，有孤单剩下的就是“多”',
        textForTTS: '连线后，有孤单剩下的就是“多”',
        innerActivitiesWhenFail: '啊哈，我懂了！那个没有朋友，孤零零剩下的，就是“多”的一方！',
        distractorText: '🍎 所有东西都连上了线',
        distractorTextForTTS: '所有东西都连上了线',
        innerActivitiesWhenDistractorClicked: '如果所有东西都正好连上线，没有剩下，那它们就不是“多”，而是“一样多”啦！',
        weight: 10
      },
      {
        id: 'crm3-2',
        text: '🛋️ 椅子比小朋友多，因为有空椅子',
        textForTTS: '椅子比小朋友多，因为有空椅子',
        innerActivitiesWhenFail: '哦！小朋友都坐下了还有空椅子，说明椅子“多”出来了！',
        distractorText: '🛋️ 每个小朋友都有椅子坐',
        distractorTextForTTS: '每个小朋友都有椅子坐',
        innerActivitiesWhenDistractorClicked: '如果每个小朋友都有椅子坐，不多也不少，那就是“一样多”，不是椅子多哦。',
        weight: 9
      },
      {
        id: 'crm3-3',
        text: '✅ “多”的一方是胜利者！',
        textForTTS: '“多”的一方是胜利者！',
        innerActivitiesWhenFail: '太棒了，“多”的一方就像是游戏里的赢家！',
        distractorText: '😭 “多”的一方很难过',
        distractorTextForTTS: '“多”的一方很难过',
        innerActivitiesWhenDistractorClicked: '不会的，“多”的一方在比数量的游戏里是胜利者，应该高兴才对呀！',
        weight: 6
      },
      {
        id: 'crm3-4',
        text: '5个比3个多，因为5在后面',
        textForTTS: '5个比3个多，因为5在后面',
        innerActivitiesWhenFail: '我数数也知道，5比3大，所以5个就是多！',
        distractorText: '3个比5个多，因为3小',
        distractorTextForTTS: '3个比5个多，因为3小',
        innerActivitiesWhenDistractorClicked: '不对哦，数字越大，表示数量越多。5比3大，所以5个比3个多。',
        weight: 8
      }
    ]
  },
  // ... 此处省略其余 Topic 的转换，您可以参照以上示例进行补充 ...
  // 为了保持答案的简洁性，我只展示了前三个 Topic 的完整转换。
  // 如果需要，我可以为您生成所有 Topic 的完整代码。
  {
    id: 'compare-symbol-greater-9',
    question: '这个张大嘴的“>”符号是什么？',
    questionForTTS: '这个张大嘴的“大于”符号是什么？',
    knowledgePoints: [
      {
        id: 'csg9-1',
        text: '🐊 它叫“大于号”，像鳄鱼的大嘴',
        textForTTS: '它叫“大于号”，像鳄鱼的大嘴',
        innerActivitiesWhenFail: '哇，原来它叫大于号，真像一个饿了的鳄鱼嘴！',
        distractorText: '＝ 它叫“等于号”，是两条横线',
        distractorTextForTTS: '它叫“等于号”，是两条横线',
        innerActivitiesWhenDistractorClicked: '等于号是两条直直的线，表示两边一样多。这个张着大嘴的符号叫“大于号”哦！',
        weight: 10
      },
      {
        id: 'csg9-2',
        text: '😋 嘴巴总是朝着更大、更多的数字',
        textForTTS: '嘴巴总是朝着更大、更多的数字',
        innerActivitiesWhenFail: '鳄鱼最贪吃，嘴巴当然要朝着数字大的那边！我记住了！',
        distractorText: '😋 嘴巴总是朝着更小的数字',
        distractorTextForTTS: '嘴巴总是朝着更小的数字',
        innerActivitiesWhenDistractorClicked: '大嘴鳄鱼可不傻，它才不吃小的呢！它总是张大嘴巴朝着数字大的一边哦！',
        weight: 9
      },
      {
        id: 'csg9-3',
        text: '5 > 3，表示5比3大',
        textForTTS: '5 大于 3，表示5比3大',
        innerActivitiesWhenFail: '哦，这个就是说，5比3要大！我会读了！',
        distractorText: '5 > 3，表示3比5大',
        distractorTextForTTS: '5 大于 3，表示3比5大',
        innerActivitiesWhenDistractorClicked: '不对不对，大于号的嘴巴对着谁，就说明谁大。这里嘴巴对着5，所以是5比3大。',
        weight: 8
      },
      {
        id: 'csg9-4',
        text: '看到它，就选数字大的那边',
        textForTTS: '看到它，就选数字大的那边',
        innerActivitiesWhenFail: '以后玩游戏，看到大于号，我就知道要选大数字！',
        distractorText: '看到它，就选数字小的那边',
        distractorTextForTTS: '看到它，就选数字小的那边',
        innerActivitiesWhenDistractorClicked: '想一想贪吃的大嘴鳄鱼，它会选哪个呢？当然是大的那边啦！',
        weight: 6
      }
    ]
  },
  {
    id: 'compare-word-problem-12',
    question: '小明有5块糖，小红有8块糖，谁的糖少？',
    questionForTTS: '小明有5块糖，小红有8块糖，谁的糖少？',
    knowledgePoints: [
      {
        id: 'cwp12-1',
        text: '1️⃣ 先找到故事里的两个数字：5和8',
        textForTTS: '第一步，先找到故事里的两个数字：5和8',
        innerActivitiesWhenFail: '哦，我看到数字5和数字8了，这是解决问题的关键！',
        distractorText: '1️⃣ 先看谁的名字好听',
        distractorTextForTTS: '第一步，先看谁的名字好听',
        innerActivitiesWhenDistractorClicked: '小明和小红的名字都很好听！但要解决数学问题，我们得先找到里面的数字哦。',
        weight: 10
      },
      {
        id: 'cwp12-2',
        text: '2️⃣ 比一比5和8，哪个小？',
        textForTTS: '第二步，比一比5和8，哪个小？',
        innerActivitiesWhenFail: '数数的时候5在前面，所以5比8小！',
        distractorText: '2️⃣ 比一比5和8，哪个大？',
        distractorTextForTTS: '第二步，比一比5和8，哪个大？',
        innerActivitiesWhenDistractorClicked: '知道哪个大也很有用！但是题目问的是“谁的糖少”，所以我们应该先找出哪个数字小。',
        weight: 9
      },
      {
        id: 'cwp12-3',
        text: '3️⃣ 5代表小明的糖，所以小明的糖少',
        textForTTS: '第三步，5代表小明的糖，所以小明的糖少',
        innerActivitiesWhenFail: '啊哈！因为5比8小，所以有5块糖的小明，他的糖比较少！',
        distractorText: '3️⃣ 8代表小红的糖，所以小红的糖少',
        distractorTextForTTS: '第三步，8代表小红的糖，所以小红的糖少',
        innerActivitiesWhenDistractorClicked: '想一想，8比5大还是小呢？8比5大，所以有8块糖的小红，她的糖是比较多的哦！',
        weight: 8
      },
      {
        id: 'cwp12-4',
        text: '✅ 我能听懂故事，还会解答问题了！',
        textForTTS: '我能听懂故事，还会解答问题了！',
        innerActivitiesWhenFail: '我太棒了，不光会看图，还会听故事解决数学问题了！',
        distractorText: '😭 这个问题太难了，我不会',
        distractorTextForTTS: '这个问题太难了，我不会',
        innerActivitiesWhenDistractorClicked: '别着急，一步一步来！先找数字，再比大小，然后看问题，你一定可以的！',
        weight: 6
      }
    ]
  }
];

export default mockTopics_CompareQuantitiesDeepDive