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


export const mockTopics_CompareQuantitiesDeepDive: Topic[] = [
  // --- 阶段一：建立核心概念和方法 ---
  // {
  //   id: 'compare-intro-1',
  //   question: '“比一比”是在做什么游戏？',
  //   questionForTTS: '“比一比”是在做什么游戏？',
  //   knowledgePoints: [
  //     {
  //       id: 'ci1-1',
  //       text: '👀 就是看两堆东西，谁的本领大',
  //       textForTTS: '就是看两堆东西，谁的本领大',
  //       innerActivitiesWhenFail: '哦，原来“比一比”就是看谁多谁少呀，像个小侦探！',
  //       distractorText: '🎨 是在给东西涂上漂亮的颜色',
  //       distractorTextForTTS: '是在给东西涂上漂亮的颜色',
  //       innerActivitiesWhenDistractorClicked: '涂颜色真好玩！不过“比一比”不是画画哦，是看谁的数量多，谁的数量少。',
  //       weight: 10
  //     },
  //     {
  //       id: 'ci1-2',
  //       text: '🤔 想想看：需要几堆东西才能比？',
  //       textForTTS: '想想看：需要几堆东西才能比？',
  //       innerActivitiesWhenFail: '哎呀，一堆东西没法比！我需要至少两堆才能开始游戏！',
  //       distractorText: '☝️ 一堆东西自己就能比',
  //       distractorTextForTTS: '一堆东西自己就能比',
  //       innerActivitiesWhenDistractorClicked: '自己和自己怎么比呢？“比一比”游戏需要两个或更多的小伙伴一起玩才行哦！',
  //       weight: 9
  //     },
  //     {
  //       id: 'ci1-3',
  //       text: '🍎 和 🍌，苹果和香蕉可以比',
  //       textForTTS: '苹果和香蕉可以比',
  //       innerActivitiesWhenFail: '对哦，我可以比苹果和香蕉，也可以比小狗和小猫！',
  //       distractorText: '🙅‍♂️ 只有长得一样的才能比',
  //       distractorTextForTTS: '只有长得一样的才能比',
  //       innerActivitiesWhenDistractorClicked: '虽然苹果和香蕉长得不一样，但我们可以比它们的数量！比多少，和长相没关系哦。',
  //       weight: 7
  //     },
  //     {
  //       id: 'ci1-4',
  //       text: '❓ 会产生“多、少、一样多”三种结果',
  //       textForTTS: '会产生“多、少、一样多”三种结果',
  //       innerActivitiesWhenFail: '原来比完之后有三种可能，真好玩，我想知道都是什么！',
  //       distractorText: '🏆 比完之后，肯定有一个是赢家',
  //       distractorTextForTTS: '比完之后，肯定有一个是赢家',
  //       innerActivitiesWhenDistractorClicked: '有时候是有一个赢家，但如果它们“一样多”，那就是平手啦，两个都是赢家！',
  //       weight: 6
  //     }
  //   ]
  // },
  // {
  //   id: 'compare-method-2',
  //   question: '怎么用“一一对应”这个好方法来比呢？',
  //   questionForTTS: '怎么用“一一对应”这个好方法来比呢？',
  //   knowledgePoints: [
  //     {
  //       id: 'cm2-1',
  //       text: '🤝 让它们“手拉手”排好队',
  //       textForTTS: '让它们手拉手排好队',
  //       innerActivitiesWhenFail: '哇，原来就是给它们找朋友呀，一个拉一个，真有趣！',
  //       distractorText: '🎲 把它们随便堆在一起',
  //       distractorTextForTTS: '把它们随便堆在一起',
  //       innerActivitiesWhenDistractorClicked: '堆在一起就看不清楚啦！让它们“手拉手”排好队，一个对一个，才不会弄混哦。',
  //       weight: 10
  //     },
  //     {
  //       id: 'cm2-2',
  //       text: '✏️ 在两个东西中间画一条线连起来',
  //       textForTTS: '在两个东西中间画一条线连起来',
  //       innerActivitiesWhenFail: '我可以用画画的方式，给它们俩连上线，这样就不会弄错了！',
  //       distractorText: '🌈 画一个大圈把它们都圈起来',
  //       distractorTextForTTS: '画一个大圈把它们都圈起来',
  //       innerActivitiesWhenDistractorClicked: '画个大圈像个家！但要比多少，最好是画线把它们一对一连起来，这样最清楚。',
  //       weight: 9
  //     },
  //     {
  //       id: 'cm2-3',
  //       text: '🐰 一个萝卜对一个兔子，最公平',
  //       textForTTS: '一个萝卜对一个兔子，最公平',
  //       innerActivitiesWhenFail: '哦，就是一个对着一个放好，像每个小兔子都有一个自己的胡萝卜！',
  //       distractorText: '🐰 一个兔子对着两个萝卜',
  //       distractorTextForTTS: '一个兔子对着两个萝卜',
  //       innerActivitiesWhenDistractorClicked: '这样对兔子来说太幸福啦，但是对别的兔子不公平哦！“一一对应”要一个对一个才行。',
  //       weight: 8
  //     },
  //     {
  //       id: 'cm2-4',
  //       text: '👟 像穿鞋子，一只脚穿一只鞋',
  //       textForTTS: '像穿鞋子，一只脚穿一只鞋',
  //       innerActivitiesWhenFail: '这个方法就像穿鞋子，不多也不少，一只脚配一只鞋！',
  //       distractorText: '👟 一只脚上穿两只鞋',
  //       distractorTextForTTS: '一只脚上穿两只鞋',
  //       innerActivitiesWhenDistractorClicked: '哎呀，这样走路会摔跤的！一只脚只能穿一只鞋，刚刚好，这就是“一一对应”啦。',
  //       weight: 7
  //     }
  //   ]
  // },

  // --- 阶段二：应用方法，辨析三种结果 ---
  // {
  //   id: 'compare-result-more-3',
  //   question: '比完之后，什么情况是“多”？',
  //   questionForTTS: '比完之后，什么情况是“多”？',
  //   knowledgePoints: [
  //     {
  //       id: 'crm3-1',
  //       text: '🍎 连线后，有孤单剩下的就是“多”',
  //       textForTTS: '连线后，有孤单剩下的就是“多”',
  //       innerActivitiesWhenFail: '啊哈，我懂了！那个没有朋友，孤零零剩下的，就是“多”的一方！',
  //       distractorText: '🍎 所有东西都连上了线',
  //       distractorTextForTTS: '所有东西都连上了线',
  //       innerActivitiesWhenDistractorClicked: '如果所有东西都正好连上线，没有剩下，那它们就不是“多”，而是“一样多”啦！',
  //       weight: 10
  //     },
  //     {
  //       id: 'crm3-2',
  //       text: '🛋️ 椅子比小朋友多，因为有空椅子',
  //       textForTTS: '椅子比小朋友多，因为有空椅子',
  //       innerActivitiesWhenFail: '哦！小朋友都坐下了还有空椅子，说明椅子“多”出来了！',
  //       distractorText: '🛋️ 每个小朋友都有椅子坐',
  //       distractorTextForTTS: '每个小朋友都有椅子坐',
  //       innerActivitiesWhenDistractorClicked: '如果每个小朋友都有椅子坐，不多也不少，那就是“一样多”，不是椅子多哦。',
  //       weight: 9
  //     },
  //     {
  //       id: 'crm3-3',
  //       text: '✅ “多”的一方是胜利者！',
  //       textForTTS: '“多”的一方是胜利者！',
  //       innerActivitiesWhenFail: '太棒了，“多”的一方就像是游戏里的赢家！',
  //       distractorText: '😭 “多”的一方很难过',
  //       distractorTextForTTS: '“多”的一方很难过',
  //       innerActivitiesWhenDistractorClicked: '不会的，“多”的一方在比数量的游戏里是胜利者，应该高兴才对呀！',
  //       weight: 6
  //     },
  //     {
  //       id: 'crm3-4',
  //       text: '5个比3个多，因为5在后面',
  //       textForTTS: '5个比3个多，因为5在后面',
  //       innerActivitiesWhenFail: '我数数也知道，5比3大，所以5个就是多！',
  //       distractorText: '3个比5个多，因为3小',
  //       distractorTextForTTS: '3个比5个多，因为3小',
  //       innerActivitiesWhenDistractorClicked: '不对哦，数字越大，表示数量越多。5比3大，所以5个比3个多。',
  //       weight: 8
  //     }
  //   ]
  // },
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