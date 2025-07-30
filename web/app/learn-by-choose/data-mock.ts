// data-mock.ts
// This file provides mock data that conforms to the new, more detailed data structure.

export interface KnowledgePoint {
    id: string; // e.g., "chao-1"
    text: string; // e.g., "热潮"
    innerActivitiesWhenFail: string; 
    weight: number; // 1-10
}

export interface Topic {
    id: string; // e.g., "chao"
    question: string; // e.g., "潮"
    knowledgePoints: KnowledgePoint[]; // Array of 4
}

// Based on the test case provided in the product goal
export const mockTopics: Topic[] = [
    {
        id: 'chao',
        question: '潮',
        knowledgePoints: [
            { id: 'chao-1', text: '🌊观潮：去看潮水', innerActivitiesWhenFail: '原来“观潮”是亲眼去看大潮呀，我怎么没想到呢！', weight: 10 },
            { id: 'chao-4', text: '🔄潮流：时尚趋势', innerActivitiesWhenFail: '“潮流”是现在大家都在跟着做的，和时尚有关！', weight: 8 },
            { id: 'chao-2', text: '⬆️热潮：流行风向', innerActivitiesWhenFail: '“热潮”是大家都很喜欢的东西，下次要记住哦！', weight: 5 },
            { id: 'chao-3', text: '💖心潮澎湃：激动的心情', innerActivitiesWhenFail: '“心潮澎湃”是心里激动得像潮水一样，好形象！', weight: 2 },
        ]
    },
    {
        id: 'ju',
        question: '据',
        knowledgePoints: [
            { id: 'ju-2', text: '🗣️据说：听人讲的', innerActivitiesWhenFail: '“据说”就是听别人说，还没完全确定呢。', weight: 10 },
            { id: 'ju-4', text: '📜证据：证明事实', innerActivitiesWhenFail: '“证据”是用来证明事情是真的，很重要的！', weight: 8 },
            { id: 'ju-1', text: '🛡️据守：坚守阵地', innerActivitiesWhenFail: '“据守”原来是牢牢守住不放手的意思，记住了！', weight: 4 },
            { id: 'ju-3', text: '🤝据为己有：占为己有', innerActivitiesWhenFail: '“据为己有”是把别人的东西变成自己的，不太好哦。', weight: 2 },
        ]
    },
    {
        id: 'di',
        question: '堤',
        knowledgePoints: [
            { id: 'di-1', text: '🏞️河堤：河边的矮墙', innerActivitiesWhenFail: '“河堤”是河边挡水的墙，原来是这个样子！', weight: 10 },
            { id: 'di-2', text: '🚧大堤：巨大的堤坝', innerActivitiesWhenFail: '“大堤”就是很大的堤坝，用来保护家园。', weight: 7 },
            { id: 'di-4', text: '👷堤防：防止水患', innerActivitiesWhenFail: '“堤防”就是修筑堤坝来预防洪水。', weight: 5 },
            { id: 'di-3', text: '千里之堤：很长的堤坝', innerActivitiesWhenFail: '“千里之堤”表示很长很长的堤坝，可不能大意。', weight: 2 },
        ]
    },
    {
        id: 'kuo',
        question: '阔',
        knowledgePoints: [
            { id: 'kuo-1', text: '🌳广阔：地方很大', innerActivitiesWhenFail: '“广阔”是说地方特别大，一眼望不到边！', weight: 10 },
            { id: 'kuo-2', text: '↔️宽阔：宽度很大', innerActivitiesWhenFail: '“宽阔”是宽度很大，比如马路很宽。', weight: 8 },
            { id: 'kuo-4', text: '🧠开阔：拓宽眼界', innerActivitiesWhenFail: '“开阔”是让思路更宽广，知道更多东西！', weight: 5 },
            { id: 'kuo-3', text: '🗣️高谈阔论：夸夸其谈', innerActivitiesWhenFail: '“高谈阔论”是说话夸大其词，不太脚踏实地。', weight: 2 },
        ]
    },
    {
        id: 'long',
        question: '笼',
        knowledgePoints: [
            { id: 'long-4', text: '🐦笼子：关鸟的笼子', innerActivitiesWhenFail: '“笼子”是关小鸟的，不能让它们飞走。', weight: 10 },
            { id: 'long-2', text: '☁️笼罩：被覆盖住', innerActivitiesWhenFail: '“笼罩”是像雾气一样，把什么都盖住了。', weight: 7 },
            { id: 'long-3', text: '🤝笼络人心：收买人心', innerActivitiesWhenFail: '“笼络人心”是想办法让大家支持自己。', weight: 4 },
            { id: 'long-1', text: '🧺箱笼：装东西的箱子', innerActivitiesWhenFail: '“箱笼”就是装东西的箱子，像个小宝藏盒！', weight: 1 },
        ]
    },
    {
        id: 'zhao',
        question: '罩',
        knowledgePoints: [
            { id: 'zhao-1', text: '😷口罩：遮住口鼻', innerActivitiesWhenFail: '“口罩”是戴在脸上的，保护我们的健康！', weight: 10 },
            { id: 'zhao-2', text: '☂️罩住：盖住物品', innerActivitiesWhenFail: '“罩住”是把东西盖起来，不让它脏了。', weight: 8 },
            { id: 'zhao-3', text: '💡灯罩：罩在灯上', innerActivitiesWhenFail: '“灯罩”是灯外面那层，让光线更柔和。', weight: 5 },
            { id: 'zhao-4', text: '🍳锅罩：罩住锅子', innerActivitiesWhenFail: '“锅罩”是盖在锅上面的，防止油溅出来。', weight: 2 },
        ]
    },
    {
        id: 'pan',
        question: '盼',
        knowledgePoints: [
            { id: 'pan-1', text: '👀盼望：期待发生', innerActivitiesWhenFail: '“盼望”是特别希望某个事情快点发生。', weight: 10 },
            { id: 'pan-2', text: '🗓️期盼：期待已久', innerActivitiesWhenFail: '“期盼”是等了很久，很想看到的结果。', weight: 8 },
            { id: 'pan-4', text: '💖翘首以盼：伸长脖子等', innerActivitiesWhenFail: '“翘首以盼”是伸长脖子，非常着急地等待。', weight: 5 },
            { id: 'pan-3', text: '➡️左顾右盼：左右张望', innerActivitiesWhenFail: '“左顾右盼”是眼睛不停地看左边看右边。', weight: 2 },
        ]
    },
    {
        id: 'gun',
        question: '滚',
        knowledgePoints: [
            { id: 'gun-2', text: '🔄滚动：持续转动', innerActivitiesWhenFail: '“滚动”是一直不停地转着向前进。', weight: 10 },
            { id: 'gun-1', text: '🌀翻滚：转动滚动', innerActivitiesWhenFail: '“翻滚”是像球一样转来转去，真好玩！', weight: 8 },
            { id: 'gun-4', text: '🔥滚烫：非常热', innerActivitiesWhenFail: '“滚烫”是热得都冒烟了，要小心！', weight: 6 },
            { id: 'gun-3', text: '📚滚瓜烂熟：背得很熟', innerActivitiesWhenFail: '“滚瓜烂熟”是说背得特别熟，就像念儿歌。', weight: 3 },
        ]
    },
    {
        id: 'dun',
        question: '顿',
        knowledgePoints: [
            { id: 'dun-2', text: '⚡顿时：立刻马上', innerActivitiesWhenFail: '“顿时”是马上就发生了，速度好快呀。', weight: 10 },
            { id: 'dun-4', text: '🚶停顿：暂停一下', innerActivitiesWhenFail: '“停顿”是停下来休息一下，不着急。', weight: 8 },
            { id: 'dun-1', text: '💡顿悟：突然明白', innerActivitiesWhenFail: '“顿悟”是突然之间就明白了，像灯泡亮了！', weight: 5 },
            { id: 'dun-3', text: '🤯茅塞顿开：突然开窍', innerActivitiesWhenFail: '“茅塞顿开”是脑子突然变得很清楚，都明白了！', weight: 2 },
        ]
    },
    {
        id: 'zhu',
        question: '逐',
        knowledgePoints: [
            { id: 'zhu-1', text: '🏃追逐：追赶跑动', innerActivitiesWhenFail: '“追逐”是跑着去追，就像玩捉迷藏！', weight: 10 },
            { id: 'zhu-2', text: ' slowly逐渐：慢慢地', innerActivitiesWhenFail: '“逐渐”是慢慢地，一点一点地变化。', weight: 8 },
            { id: 'zhu-4', text: '驱逐：赶走别人', innerActivitiesWhenFail: '“驱逐”是把别人赶走，不让靠近。', weight: 5 },
            { id: 'zhu-3', text: '💧随波逐流：跟着大流走', innerActivitiesWhenFail: '“随波逐流”是别人做什么就跟着做什么。', weight: 2 },
        ]
    },
    {
        id: 'jian',
        question: '渐',
        knowledgePoints: [
            { id: 'jian-1', text: '🐌渐渐：一点一点地', innerActivitiesWhenFail: '“渐渐”是慢慢地，就像小草慢慢长大。', weight: 10 },
            { id: 'jian-2', text: '🔄渐变：逐渐变化', innerActivitiesWhenFail: '“渐变”是颜色或形状慢慢地变了。', weight: 7 },
            { id: 'jian-3', text: '🚶循序渐进：按顺序学习', innerActivitiesWhenFail: '“循序渐进”是按着顺序慢慢学，不能跳着来。', weight: 5 },
            { id: 'jian-4', text: '💧浸渐：逐渐浸入', innerActivitiesWhenFail: '“浸渐”是慢慢地被水浸湿，就像海绵吸水。', weight: 1 },
        ]
    },
    {
        id: 'you',
        question: '犹',
        knowledgePoints: [
            { id: 'you-1', text: '🤔犹豫：拿不定主意', innerActivitiesWhenFail: '“犹豫”是不知道该选哪个，心里有点乱。', weight: 10 },
            { id: 'you-2', text: '↔️犹如：好像如同', innerActivitiesWhenFail: '“犹如”是就像……一样，用来打比方。', weight: 8 },
            { id: 'you-3', text: '💪虽死犹生：死了也像活着', innerActivitiesWhenFail: '“虽死犹生”是虽然牺牲了，精神却永远活着。', weight: 4 },
            { id: 'you-4', text: '🧠记忆犹新：记忆还很清晰', innerActivitiesWhenFail: '“记忆犹新”是事情好像昨天刚发生一样，记得特别清楚！', weight: 2 },
        ]
    },
    {
        id: 'beng',
        question: '崩',
        knowledgePoints: [
            { id: 'beng-1', text: '💥崩溃：突然垮掉', innerActivitiesWhenFail: '“崩溃”是突然就坏掉了，再也支撑不住。', weight: 10 },
            { id: 'beng-4', text: '🌪️崩裂：裂开碎掉', innerActivitiesWhenFail: '“崩裂”是突然裂开了，变成了好几块。', weight: 7 },
            { id: 'beng-3', text: '🧱土崩瓦解：彻底瓦解', innerActivitiesWhenFail: '“土崩瓦解”是完全散开了，什么都没有了。', weight: 4 },
            { id: 'beng-2', text: '📉崩盘：市场暴跌', innerActivitiesWhenFail: '“崩盘”是价格一下子跌得很厉害，像塌了一样。', weight: 2 },
        ]
    },
    {
        id: 'zhen',
        question: '震',
        knowledgePoints: [
            { id: 'zhen-1', text: '🌍地震：大地摇晃', innerActivitiesWhenFail: '“地震”是大地在晃动，就像玩摇摇乐。', weight: 10 },
            { id: 'zhen-2', text: '颤震动：颤抖晃动', innerActivitiesWhenFail: '“震动”是抖动起来，就像手机在响。', weight: 8 },
            { id: 'zhen-4', text: '💥震荡：剧烈晃动', innerActivitiesWhenFail: '“震荡”是来回晃动得很厉害，就像坐船。', weight: 6 },
            { id: 'zhen-3', text: '👂震耳欲聋：声音很大', innerActivitiesWhenFail: '“震耳欲聋”是声音特别大，耳朵都快聋了！', weight: 3 },
        ]
    },
    {
        id: 'yu',
        question: '余',
        knowledgePoints: [
            { id: 'yu-1', text: '➕剩余：剩下的部分', innerActivitiesWhenFail: '“剩余”就是还剩下一点点，没有用完。', weight: 10 },
            { id: 'yu-2', text: '〰️余波：事情的后续', innerActivitiesWhenFail: '“余波”是事情过去后还留下的一些影响。', weight: 6 },
            { id: 'yu-4', text: '闲暇之余：空闲时间', innerActivitiesWhenFail: '“闲暇之余”是做完事情，剩下的空闲时间。', weight: 4 },
            { id: 'yu-3', text: '😊高兴之余：高兴的时候', innerActivitiesWhenFail: '“高兴之余”是除了高兴，还有别的事情。', weight: 2 },
        ]
    },
];

export const mockTopics1: Topic[] =  [
    {
      "id": "number-0",
      "question": "什么是数字零？",
      "knowledgePoints": [
        {
          "id": "num-0-1",
          "text": "🕳️ 形状像个圆圈",
          "innerActivitiesWhenFail": "原来零长得圆圆的，像个甜甜圈！",
          "weight": 10
        },
        {
          "id": "num-0-2",
          "text": "🚫 代表没有",
          "innerActivitiesWhenFail": "零就是什么都没有的意思，像空空的盒子！",
          "weight": 9
        },
        {
          "id": "num-0-3",
          "text": "🗣️ 读作“零”",
          "innerActivitiesWhenFail": "这个数字念作“零”，要记住它的名字哦！",
          "weight": 7
        },
        {
          "id": "num-0-4",
          "text": "🐣 小鸡有几只？（0只）",
          "innerActivitiesWhenFail": "看到没有小鸡，就是零只小鸡呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-1",
      "question": "什么是数字一？",
      "knowledgePoints": [
        {
          "id": "num-1-1",
          "text": "☝️ 像铅笔一样直",
          "innerActivitiesWhenFail": "原来一长得直直的，像根小棍子！",
          "weight": 10
        },
        {
          "id": "num-1-2",
          "text": "🍎 代表一个",
          "innerActivitiesWhenFail": "一就是只有一个的意思，像一颗苹果！",
          "weight": 9
        },
        {
          "id": "num-1-3",
          "text": "🗣️ 读作“一”",
          "innerActivitiesWhenFail": "这个数字念作“一”，记住它的声音！",
          "weight": 7
        },
        {
          "id": "num-1-4",
          "text": "🥚 鸡蛋有几个？（1个）",
          "innerActivitiesWhenFail": "看到一个鸡蛋，就是一呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-2",
      "question": "什么是数字二？",
      "knowledgePoints": [
        {
          "id": "num-2-1",
          "text": "🦢 像小鸭子弯弯的脖子",
          "innerActivitiesWhenFail": "原来二弯弯的，像小鸭子的脖子，真可爱！",
          "weight": 10
        },
        {
          "id": "num-2-2",
          "text": "👯‍♀️ 代表两个",
          "innerActivitiesWhenFail": "二就是有两个的意思，像两只小手！",
          "weight": 9
        },
        {
          "id": "num-2-3",
          "text": "🗣️ 读作“二”",
          "innerActivitiesWhenFail": "这个数字念作“二”，快来跟我念！",
          "weight": 7
        },
        {
          "id": "num-2-4",
          "text": "🎈 气球有几个？（2个）",
          "innerActivitiesWhenFail": "数一数，有两个气球，就是二呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-3",
      "question": "什么是数字三？",
      "knowledgePoints": [
        {
          "id": "num-3-1",
          "text": "👂 像小耳朵有三瓣",
          "innerActivitiesWhenFail": "原来三像小耳朵，有三个弯弯！",
          "weight": 10
        },
        {
          "id": "num-3-2",
          "text": "👨‍👩‍👧 代表三个",
          "innerActivitiesWhenFail": "三就是有三个的意思，像一家三口！",
          "weight": 9
        },
        {
          "id": "num-3-3",
          "text": "🗣️ 读作“三”",
          "innerActivitiesWhenFail": "这个数字念作“三”，大声说出来！",
          "weight": 7
        },
        {
          "id": "num-3-4",
          "text": "🍦 冰淇淋有几个？（3个）",
          "innerActivitiesWhenFail": "哇，有三个冰淇淋，是数字三！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-4",
      "question": "什么是数字四？",
      "knowledgePoints": [
        {
          "id": "num-4-1",
          "text": "🪑 像小椅子倒过来",
          "innerActivitiesWhenFail": "原来四像倒过来的小椅子，真有趣！",
          "weight": 10
        },
        {
          "id": "num-4-2",
          "text": "🧱 代表四个",
          "innerActivitiesWhenFail": "四就是有四个的意思，像四块积木！",
          "weight": 9
        },
        {
          "id": "num-4-3",
          "text": "🗣️ 读作“四”",
          "innerActivitiesWhenFail": "这个数字念作“四”，再念一遍！",
          "weight": 7
        },
        {
          "id": "num-4-4",
          "text": "🍎 苹果有几个？（4个）",
          "innerActivitiesWhenFail": "数一数，有四个苹果，就是四呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-5",
      "question": "什么是数字五？",
      "knowledgePoints": [
        {
          "id": "num-5-1",
          "text": "🖐️ 像钩子有小肚子",
          "innerActivitiesWhenFail": "原来五像个钩子，还有个大肚子！",
          "weight": 10
        },
        {
          "id": "num-5-2",
          "text": "⭐️ 代表五个",
          "innerActivitiesWhenFail": "五就是有五个的意思，像五颗星星！",
          "weight": 9
        },
        {
          "id": "num-5-3",
          "text": "🗣️ 读作“五”",
          "innerActivitiesWhenFail": "这个数字念作“五”，记住了吗？",
          "weight": 7
        },
        {
          "id": "num-5-4",
          "text": "⚽ 足球有几个？（5个）",
          "innerActivitiesWhenFail": "五个足球，就是五！真棒！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-6",
      "question": "什么是数字六？",
      "knowledgePoints": [
        {
          "id": "num-6-1",
          "text": "🐌 像小蜗牛卷卷的尾巴",
          "innerActivitiesWhenFail": "原来六像小蜗牛，卷着小尾巴！",
          "weight": 10
        },
        {
          "id": "num-6-2",
          "text": "🍭 代表六个",
          "innerActivitiesWhenFail": "六就是有六个的意思，像六个棒棒糖！",
          "weight": 9
        },
        {
          "id": "num-6-3",
          "text": "🗣️ 读作“六”",
          "innerActivitiesWhenFail": "这个数字念作“六”，多读几遍！",
          "weight": 7
        },
        {
          "id": "num-6-4",
          "text": "🐰 兔子有几只？（6只）",
          "innerActivitiesWhenFail": "有六只可爱的小兔子，就是六呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-7",
      "question": "什么是数字七？",
      "knowledgePoints": [
        {
          "id": "num-7-1",
          "text": "🪄 像拐杖有个小短腿",
          "innerActivitiesWhenFail": "原来七像个小拐杖，下面还有个小短腿！",
          "weight": 10
        },
        {
          "id": "num-7-2",
          "text": "🌈 代表七个",
          "innerActivitiesWhenFail": "七就是有七个的意思，像七道彩虹！",
          "weight": 9
        },
        {
          "id": "num-7-3",
          "text": "🗣️ 读作“七”",
          "innerActivitiesWhenFail": "这个数字念作“七”，快来记住它！",
          "weight": 7
        },
        {
          "id": "num-7-4",
          "text": "🚗 汽车有几辆？（7辆）",
          "innerActivitiesWhenFail": "七辆汽车排排队，就是七呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-8",
      "question": "什么是数字八？",
      "knowledgePoints": [
        {
          "id": "num-8-1",
          "text": "♾️ 像葫芦，上下两个圈",
          "innerActivitiesWhenFail": "原来八像个小葫芦，上面一个圈下面一个圈！",
          "weight": 10
        },
        {
          "id": "num-8-2",
          "text": "🐙 代表八个",
          "innerActivitiesWhenFail": "八就是有八个的意思，像八爪鱼的八条腿！",
          "weight": 9
        },
        {
          "id": "num-8-3",
          "text": "🗣️ 读作“八”",
          "innerActivitiesWhenFail": "这个数字念作“八”，再念一遍！",
          "weight": 7
        },
        {
          "id": "num-8-4",
          "text": "🔔 铃铛有几个？（8个）",
          "innerActivitiesWhenFail": "八个铃铛响叮当，就是八呀！",
          "weight": 6
        }
      ]
    },
    {
      "id": "number-9",
      "question": "什么是数字九？",
      "knowledgePoints": [
        {
          "id": "num-9-1",
          "text": "🎈 像气球带着根线",
          "innerActivitiesWhenFail": "原来九像个气球，上面圆圆的，下面有条线！",
          "weight": 10
        },
        {
          "id": "num-9-2",
          "text": "🐈 代表九个",
          "innerActivitiesWhenFail": "九就是有九个的意思，像九条小鱼！",
          "weight": 9
        },
        {
          "id": "num-9-3",
          "text": "🗣️ 读作“九”",
          "innerActivitiesWhenFail": "这个数字念作“九”，你学会了吗？",
          "weight": 7
        },
        {
          "id": "num-9-4",
          "text": "🦋 蝴蝶有几只？（9只）",
          "innerActivitiesWhenFail": "数一数，有九只蝴蝶在飞舞，就是九呀！",
          "weight": 6
        }
      ]
    }
  ]


  export const mockTopicsBigNumbers: Topic[] = [
  {
    "id": "large-number-1-wan",
    "question": "“一万”有多大？",
    "knowledgePoints": [
      {
        "id": "ln-1-1",
        "text": "💰 10个一千是“一万”",
        "innerActivitiesWhenFail": "原来10个一千块叠在一起，就是一万块呀！好多钱！",
        "weight": 10
      },
      {
        "id": "ln-1-2",
        "text": "🔢 从右边数，第五位是“万位”",
        "innerActivitiesWhenFail": "哦！我知道了，个、十、百、千...下一个就是万位，它是第五个位置！",
        "weight": 9
      },
      {
        "id": "ln-1-3",
        "text": "✍️ “一万”写作 10000，有4个0",
        "innerActivitiesWhenFail": "哇，原来1后面跟着4个0就是一万，我记住这个样子啦！",
        "weight": 8
      },
      {
        "id": "ln-1-4",
        "text": "🏟️ 一个体育场大约能坐1万人",
        "innerActivitiesWhenFail": "原来一个体育场能装下这么多人，一万真是个大数！",
        "weight": 6
      }
    ]
  },
  {
    "id": "large-number-2-wan-level",
    "question": "什么是“万级”？",
    "knowledgePoints": [
      {
        "id": "ln-2-1",
        "text": "👨‍👩‍👧‍👦 万级有四个成员：万、十万、百万、千万",
        "innerActivitiesWhenFail": "原来万、十万、百万、千万是一家人，都住在'万级'这个大家庭里！",
        "weight": 10
      },
      {
        "id": "ln-2-2",
        "text": "📏 每4个数字一级，万位开始是“万级”",
        "innerActivitiesWhenFail": "我知道了！数数的时候要四位一分级，这样看大数就清楚多啦！",
        "weight": 9
      },
      {
        "id": "ln-2-3",
        "text": "🗣️ 读完万级的数，要加上“万”字",
        "innerActivitiesWhenFail": "哦！读万级的数就像报名字，先说自己的数，再说姓'万'！比如“三千四百五十六”万！",
        "weight": 8
      },
      {
        "id": "ln-2-4",
        "text": "💡 比如 3456,0000，逗号前是万级",
        "innerActivitiesWhenFail": "看到这个小逗号就知道前面是万级，这个分级的方法真好用！",
        "weight": 7
      }
    ]
  },
  {
    "id": "large-number-3-read-wan",
    "question": "万级的数怎么读？特别是带0的？",
    "knowledgePoints": [
      {
        "id": "ln-3-1",
        "text": "🤫 每级末尾的0都不读",
        "innerActivitiesWhenFail": "原来数末尾的0是“隐身”的，不用读出来！比如4500万，就读四千五百万！",
        "weight": 10
      },
      {
        "id": "ln-3-2",
        "text": "1️⃣ 中间有1个或连续几个0，都只读一个“零”",
        "innerActivitiesWhenFail": "哇，中间的0不管有几个，都只读一次“零”，它们好团结呀！比如4005万，读四千零五万！",
        "weight": 9
      },
      {
        "id": "ln-3-3",
        "text": "📖 先读万级，再读个级",
        "innerActivitiesWhenFail": "读大数就像搭积木，先读万级那块，再读个级那块，连起来就行啦！",
        "weight": 7
      },
      {
        "id": "ln-3-4",
        "text": " örneğin 2030,4000 读作“二千零三十万四千”",
        "innerActivitiesWhenFail": "哦！2030在万级，读“二千零三十”万，4000在个级，读“四千”，连起来就是它！",
        "weight": 6
      }
    ]
  },
  {
    "id": "large-number-4-write-wan",
    "question": "听到一个大数，怎么写出来？",
    "knowledgePoints": [
      {
        "id": "ln-4-1",
        "text": "✍️ 先写万级，再写个级",
        "innerActivitiesWhenFail": "原来写数和读数顺序一样，听到“万”字，就先写万级里的数！",
        "weight": 10
      },
      {
        "id": "ln-4-2",
        "text": "👻 哪个数位上没有数，就用0占位",
        "innerActivitiesWhenFail": "啊哈！原来0是个“占位小精灵”，哪个位置空了它就站过去，不能漏掉！",
        "weight": 9
      },
      {
        "id": "ln-4-3",
        "text": "🎯 听到“几千几百几十几万”，就在万级写",
        "innerActivitiesWhenFail": "抓住了！听到“万”字，就知道前面的数字都是万级大家庭的！",
        "weight": 8
      },
      {
        "id": "ln-4-4",
        "text": " örneğin “六百零三万零二十”写作 603,0020",
        "innerActivitiesWhenFail": "六百零三万就是603在万级，零二十就是0020在个级，原来是这样拼起来的！",
        "weight": 7
      }
    ]
  },
  {
    "id": "large-number-5-yi",
    "question": "“一亿”有多大呢？",
    "knowledgePoints": [
      {
        "id": "ln-5-1",
        "text": "🏢 10个一千万是“一亿”",
        "innerActivitiesWhenFail": "哇！一千万已经那么大了，10个一千万才是一亿！简直是天文数字！",
        "weight": 10
      },
      {
        "id": "ln-5-2",
        "text": "🔢 从右边数，第九位是“亿位”",
        "innerActivitiesWhenFail": "我来数数看，个十百千万...千万后面就是亿位！排在第9个！",
        "weight": 9
      },
      {
        "id": "ln-5-3",
        "text": "✍️ “一亿”写作 1,0000,0000，有8个0",
        "innerActivitiesWhenFail": "天哪，1后面跟着整整8个0！写的时候可不能数错了！",
        "weight": 8
      },
      {
        "id": "ln-5-4",
        "text": "🇨🇳 我们国家大约有14亿人",
        "innerActivitiesWhenFail": "原来我们国家的人口是用“亿”来计算的，亿真的是个非常非常大的数！",
        "weight": 6
      }
    ]
  },
  {
    "id": "large-number-6-yi-level",
    "question": "比万级还大的“亿级”是什么？",
    "knowledgePoints": [
      {
        "id": "ln-6-1",
        "text": "🏠 数级有三个家：个级、万级、亿级",
        "innerActivitiesWhenFail": "原来数字们住在三个大房子里，从右到左是“个级”家，“万级”家，和最大的“亿级”家！",
        "weight": 10
      },
      {
        "id": "ln-6-2",
        "text": "👨‍👩‍👧‍👦 亿级也有四成员：亿、十亿、百亿、千亿",
        "innerActivitiesWhenFail": "亿级也是个四口之家！亿是老大，后面还有十亿、百亿、千亿这些大人物！",
        "weight": 9
      },
      {
        "id": "ln-6-3",
        "text": "🗣️ 读完亿级的数，要加上“亿”字",
        "innerActivitiesWhenFail": "这个我会了！和万级一样，读完亿级的数，要带上它的姓“亿”！",
        "weight": 8
      },
      {
        "id": "ln-6-4",
        "text": "💡 比如 5,4321,0000，最左边是亿级",
        "innerActivitiesWhenFail": "哦！现在有两个逗号了，最左边的就是亿级，中间的是万级！我看懂了！",
        "weight": 7
      }
    ]
  },
  {
    "id": "large-number-7-read-yi",
    "question": "包含“亿”和“万”的数怎么读？",
    "knowledgePoints": [
      {
        "id": "ln-7-1",
        "text": "📖 从高到低，一级一级地读",
        "innerActivitiesWhenFail": "原来就像下楼梯，先读最上面的亿级，再读中间的万级，最后读个级！",
        "weight": 10
      },
      {
        "id": "ln-7-2",
        "text": "🤔 读完亿级加“亿”，读完万级加“万”",
        "innerActivitiesWhenFail": "哈哈，这就像一个口诀，亿级读完喊“亿”，万级读完喊“万”！",
        "weight": 9
      },
      {
        "id": "ln-7-3",
        "text": "🤫 万级中间都是0，要读一个“零”",
        "innerActivitiesWhenFail": "哇，这个要小心！就算万级整个都是0，只要它在亿级和个级中间，就要读一个“零”来连接！比如5亿零45。",
        "weight": 8
      },
      {
        "id": "ln-7-4",
        "text": " örneğin 10,4005,3200 读“十亿四千零五万三千二百”",
        "innerActivitiesWhenFail": "我来拆解一下：10亿，4005万，3200。连起来就是“十亿四千零五万三千二百”，我学会啦！",
        "weight": 7
      }
    ]
  },
  {
    "id": "large-number-8-compare",
    "question": "怎样比较两个大数的大小？",
    "knowledgePoints": [
      {
        "id": "ln-8-1",
        "text": "⚖️ 第一步：看位数，位数多的数大",
        "innerActivitiesWhenFail": "原来是“以多欺少”呀！九位数肯定比八位数大，都不用看具体数字了！",
        "weight": 10
      },
      {
        "id": "ln-8-2",
        "text": "🔍 第二步：位数相同，从最高位比起",
        "innerActivitiesWhenFail": "哦！位数一样多就要从“老大”开始比，谁家老大厉害谁就赢！",
        "weight": 9
      },
      {
        "id": "ln-8-3",
        "text": "➡️ 最高位相同，就比下一位，直到比出大小",
        "innerActivitiesWhenFail": "原来是“车轮战”！老大平手了就比老二，老二再平手就比老三，总能分出胜负！",
        "weight": 8
      },
      {
        "id": "ln-8-4",
        "text": "💡 9999万 < 1亿",
        "innerActivitiesWhenFail": "哇！9999万虽然看起来很大，但是它只有8位数，1亿是9位数，所以1亿更大！",
        "weight": 6
      }
    ]
  },
  {
    "id": "large-number-9-rewrite",
    "question": "什么是“约等于”？怎么把大数变简单？",
    "knowledgePoints": [
      {
        "id": "ln-9-1",
        "text": "≈ 这个符号叫“约等号”",
        "innerActivitiesWhenFail": "原来这两条弯弯的线是“约等号”，表示差不多等于的意思！",
        "weight": 10
      },
      {
        "id": "ln-9-2",
        "text": "🎯 “四舍五入”到万位：看千位",
        "innerActivitiesWhenFail": "我知道了！要不要给万位“进一”，就看它右边的小邻居“千位”够不够5！",
        "weight": 9
      },
      {
        "id": "ln-9-3",
        "text": "👍 千位上是5、6、7、8、9，就“入”一个",
        "innerActivitiesWhenFail": "哦！千位上的数大于等于5，就像个大力士，能把万位“推”大1！",
        "weight": 8
      },
      {
        "id": "ln-9-4",
        "text": "👎 千位上是0、1、2、3、4，就“舍”掉",
        "innerActivitiesWhenFail": "原来千位上的数小于5，力量太小了，后面的尾巴就直接被舍弃变成0啦！",
        "weight": 7
      }
    ]
  }
]
