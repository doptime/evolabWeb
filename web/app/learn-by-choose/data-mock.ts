// data-mock.ts
// This file provides mock data that conforms to the new, more detailed data structure.

export interface KnowledgePoint {
  id: string; // e.g., 'chao-1"

  text: string; // e.g., '热潮" - this is the CORRECT answer
  textForTTS: string;  //text 的面向发音而非面向视觉的 轻度优化，取消标点符号，保留语义，尽量忠实text。
  innerActivitiesWhenFail: string; // psychological feedback when user fails to select this correct answer

  // 干扰项是错误的，不应该被选择或点击。尽管如此，它从其它视角提供了乐趣，对问题的反面的洞察.
  distractorText: string; // e.g., '热潮" is NOT about this - CLEAR incorrect alternative
  distractorTextForTTS: string;
  innerActivitiesWhenDistractorClicked: string; // feedback when incorrect option is clicked

  weight: number; // 1-10
}

export interface Topic {
  id: string; // e.g., 'chao"     
  question: string; // e.g., '潮" the actual question
  questionForTTS: string; // question 的面向发音而非面向视觉的 轻度优化，取消标点符号，保留语义，尽量忠实question。
  knowledgePoints: KnowledgePoint[]; // Array of 4
}


export const mockTopics_CompareQuantitiesDeepDive: Topic[] = [
  // --- 阶段一：建立核心概念和方法 ---
  {
    id: 'compare-intro-1',
    question: '"比一比"是在做什么游戏？',
    questionForTTS: '"比一比"是在做什么游戏？',
    knowledgePoints: [
      {
        id: 'ci1-1',
        text: '👀 就是看两堆东西，谁的本领大', // CORRECT ANSWER
        textForTTS: '就是看两堆东西，谁的本领大',
        innerActivitiesWhenFail: '哦，原来"比一比"就是看谁多谁少呀，像个小侦探！',
        distractorText: '🎨 是在给东西涂上漂亮的颜色', // CLEARLY WRONG
        distractorTextForTTS: '是在给东西涂上漂亮的颜色',
        innerActivitiesWhenDistractorClicked: '涂颜色真好玩！不过"比一比"不是画画哦，是看谁的数量多，谁的数量少。',
        weight: 10
      },
      {
        id: 'ci1-2',
        text: '🤔 想想看：需要几堆东西才能比？', // CORRECT ANSWER
        textForTTS: '想想看：需要几堆东西才能比？',
        innerActivitiesWhenFail: '哎呀，一堆东西没法比！我需要至少两堆才能开始游戏！',
        distractorText: '☝️ 一堆东西自己就能比', // CLEARLY WRONG
        distractorTextForTTS: '一堆东西自己就能比',
        innerActivitiesWhenDistractorClicked: '自己和自己怎么比呢？"比一比"游戏需要两个或更多的小伙伴一起玩才行哦！',
        weight: 9
      },
      {
        id: 'ci1-3',
        text: '🍎 和 🍌，苹果和香蕉可以比', // CORRECT ANSWER
        textForTTS: '苹果和香蕉可以比',
        innerActivitiesWhenFail: '对哦，我可以比苹果和香蕉，也可以比小狗和小猫！',
        distractorText: '🙅‍♂️ 只有长得一样的才能比', // CLEARLY WRONG
        distractorTextForTTS: '只有长得一样的才能比',
        innerActivitiesWhenDistractorClicked: '虽然苹果和香蕉长得不一样，但我们可以比它们的数量！比多少，和长相没关系哦。',
        weight: 7
      },
      {
        id: 'ci1-4',
        text: '❓ 会产生"多、少、一样多"三种结果', // CORRECT ANSWER
        textForTTS: '会产生"多、少、一样多"三种结果',
        innerActivitiesWhenFail: '原来比完之后有三种可能，真好玩，我想知道都是什么！',
        distractorText: '🏆 比完之后，肯定有一个是赢家', // CLEARLY WRONG
        distractorTextForTTS: '比完之后，肯定有一个是赢家',
        innerActivitiesWhenDistractorClicked: '有时候是有一个赢家，但如果它们"一样多"，那就是平手啦，两个都是赢家！',
        weight: 6
      }
    ]
  },
  {
    id: 'compare-method-2',
    question: '怎么用"一一对应"这个好方法来比呢？',
    questionForTTS: '怎么用"一一对应"这个好方法来比呢？',
    knowledgePoints: [
      {
        id: 'cm2-1',
        text: '🤝 让它们"手拉手"排好队', // CORRECT ANSWER
        textForTTS: '让它们手拉手排好队',
        innerActivitiesWhenFail: '哇，原来就是给它们找朋友呀，一个拉一个，真有趣！',
        distractorText: '🎲 把它们随便堆在一起', // CLEARLY WRONG
        distractorTextForTTS: '把它们随便堆在一起',
        innerActivitiesWhenDistractorClicked: '堆在一起就看不清楚啦！让它们"手拉手"排好队，一个对一个，才不会弄混哦。',
        weight: 10
      },
      {
        id: 'cm2-2',
        text: '✏️ 在两个东西中间画一条线连起来', // CORRECT ANSWER
        textForTTS: '在两个东西中间画一条线连起来',
        innerActivitiesWhenFail: '我可以用画画的方式，给它们俩连上线，这样就不会弄错了！',
        distractorText: '🌈 画一个大圈把它们都圈起来', // CLEARLY WRONG
        distractorTextForTTS: '画一个大圈把它们都圈起来',
        innerActivitiesWhenDistractorClicked: '画个大圈像个家！但要比多少，最好是画线把它们一对一连起来，这样最清楚。',
        weight: 9
      },
      {
        id: 'cm2-3',
        text: '🐰 一个萝卜对一个兔子，最公平', // CORRECT ANSWER
        textForTTS: '一个��卜对一个兔子，最公平',
        innerActivitiesWhenFail: '哦，就是一个对着一个放好，像每个小兔子都有一个自己的胡萝卜！',
        distractorText: '🐰 一个兔子对着两个萝卜', // CLEARLY WRONG
        distractorTextForTTS: '一个兔子对着两个萝卜',
        innerActivitiesWhenDistractorClicked: '这样对兔子来说太幸福啦，但是对别的兔子不公平哦！"一一对应"要一个对一个才行。',
        weight: 8
      },
      {
        id: 'cm2-4',
        text: '👟 像穿鞋子，一只脚穿一只鞋', // CORRECT ANSWER
        textForTTS: '像穿鞋子，一只脚穿一只鞋',
        innerActivitiesWhenFail: '这个方法就像穿鞋子，不多也不少，一只脚配一只鞋！',
        distractorText: '👟 一只脚上穿两只鞋', // CLEARLY WRONG
        distractorTextForTTS: '一只脚上穿两只鞋',
        innerActivitiesWhenDistractorClicked: '哎呀，这样走路会摔跤的！一只脚只能穿一只鞋，刚刚好，这就是"一一对应"啦。',
        weight: 7
      }
    ]
  },

  //--- 阶段二：应用方法，辨析三种结果 ---
  {
    id: 'compare-result-more-3',
    question: '比完之后，什么情况是"多"？',
    questionForTTS: '比完之后，什么情况是"多"？',
    knowledgePoints: [
      {
        id: 'crm3-1',
        text: '🍎 连线后，有孤单剩下的就是"多"', // CORRECT ANSWER
        textForTTS: '连线后，有孤单剩下的就是"多"',
        innerActivitiesWhenFail: '啊哈，我懂了！那个没有朋友，孤零零剩下的，就是"多"的一方！',
        distractorText: '🍎 所有东西都连上了线', // CLEARLY WRONG
        distractorTextForTTS: '所有东西都连上了线',
        innerActivitiesWhenDistractorClicked: '如果所有东西都正好连上线，没有剩下，那它们就不是"多"，而是"一样多"啦！',
        weight: 10
      },
      {
        id: 'crm3-2',
        text: '🛋️ 椅子比小朋友多，因为有空椅子', // CORRECT ANSWER
        textForTTS: '椅子比小朋友多，因为有空椅子',
        innerActivitiesWhenFail: '哦！小朋友都坐下了还有空椅子，说明椅子"多"出来了！',
        distractorText: '🛋️ 每个小朋友都有椅子坐', // CLEARLY WRONG
        distractorTextForTTS: '每个小朋友都有椅子坐',
        innerActivitiesWhenDistractorClicked: '如果每个小朋友都有椅子坐，不多也不少，那就是"一样多"，不是椅子多哦。',
        weight: 9
      },
      {
        id: 'crm3-3',
        text: '✅ "多"的一方是胜利者！', // CORRECT ANSWER (but subtle)
        textForTTS: '"多"的一方是胜利者！',
        innerActivitiesWhenFail: '太棒了，"多"的一方就像是游戏里的赢家！',
        distractorText: '😭 "多"的一方很难过', // CLEARLY WRONG
        distractorTextForTTS: '"多"的一方很难过',
        innerActivitiesWhenDistractorClicked: '不会的，"多"的一方在比数量的游戏里是胜利者，应该高兴才对呀！',
        weight: 6
      },
      {
        id: 'crm3-4',
        text: '5个比3个多，因为5在后面', // CORRECT ANSWER
        textForTTS: '5个比3个多，因为5在后面',
        innerActivitiesWhenFail: '我数数也知道，5比3大，所以5个就是多！',
        distractorText: '3个比5个多，因为3小', // CLEARLY WRONG
        distractorTextForTTS: '3个比5个多，因为3小',
        innerActivitiesWhenDistractorClicked: '不对哦，数字越大，表示数量越多。5比3大，所以5个比3个多。',
        weight: 8
      }
    ]
  },
  {
    id: 'compare-symbol-greater-9',
    question: '这个张大嘴的">"符号是什么？',
    questionForTTS: '这个张大嘴的"大于"符号是什么？',
    knowledgePoints: [
      {
        id: 'csg9-1',
        text: '🐊 它叫"大于号"，像鳄鱼的大嘴', // CORRECT ANSWER
        textForTTS: '它叫"大于号"，像鳄鱼的大嘴',
        innerActivitiesWhenFail: '哇，原来它叫大于号，真像一个饿了的鳄鱼嘴！',
        distractorText: '＝ 它叫"等于号"，是两条横线', // CLEARLY WRONG
        distractorTextForTTS: '它叫"等于号"，是两条横线',
        innerActivitiesWhenDistractorClicked: '等于号是两条直直的线，表示两边一样多。这个张着大嘴的符号叫"大于号"哦！',
        weight: 10
      },
      {
        id: 'csg9-2',
        text: '😋 嘴巴总是朝着更大、更多的数字', // CORRECT ANSWER
        textForTTS: '嘴巴总是朝着更大、更多的数字',
        innerActivitiesWhenFail: '鳄鱼最贪吃，嘴巴当然要朝着数字大的那边！我记住了！',
        distractorText: '😋 嘴巴总是朝着更小的数字', // CLEARLY WRONG
        distractorTextForTTS: '嘴巴总是朝着更小的数字',
        innerActivitiesWhenDistractorClicked: '大嘴鳄鱼可不傻，它才不吃小的呢！它总是张大嘴巴朝着数字大的一边哦！',
        weight: 9
      },
      {
        id: 'csg9-3',
        text: '5 > 3，表示5比3大', // CORRECT ANSWER
        textForTTS: '5 大于 3，表示5比3大',
        innerActivitiesWhenFail: '哦，这个就是说，5比3要大！我会读了！',
        distractorText: '5 > 3，表示3比5大', // CLEARLY WRONG
        distractorTextForTTS: '5 大于 3，表示3比5大',
        innerActivitiesWhenDistractorClicked: '不对不对，大于号的嘴巴对着谁，就说明谁大。这里嘴巴对着5，所以是5比3大。',
        weight: 8
      },
      {
        id: 'csg9-4',
        text: '看到它，就选数字大的那边', // CORRECT ANSWER
        textForTTS: '看到它，就选数字大的那边',
        innerActivitiesWhenFail: '以后玩游戏，看到大于号，我就知道要选大数字！',
        distractorText: '看到它，就选数字小的那边', // CLEARLY WRONG
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
        text: '🧒 小明的糖少，因为5比8小！', // CORRECT ANSWER - 包含明确答案
        textForTTS: '小明的糖少，因为5比8小！',
        innerActivitiesWhenFail: '对啦！小明糖少，因为5比8小！',
        distractorText: '🧒 小红的糖少，因为8比5大', // CLEARLY WRONG
        distractorTextForTTS: '小红的糖少，因为8比5大',
        innerActivitiesWhenDistractorClicked: '不对哦，8比5大，所以小红的糖更多，不是更少呢。',
        weight: 10
      },
      {
        id: 'cwp12-2',
        text: '🍬 要比数字大小：5和8比，5小', // CORRECT ANSWER - 包含解题思路
        textForTTS: '要比数字大小：5和8比，5小',
        innerActivitiesWhenFail: '没错！先找到两个数字，再比大小就能知道答案啦！',
        distractorText: '🍬 比名字大小："小明"和"小红"', // CLEARLY WRONG
        distractorTextForTTS: '比名字大小："小明"和"小红"',
        innerActivitiesWhenDistractorClicked: '比的是糖的数量，不是名字的长短哦！我们要看数字大小。',
        weight: 9
      },
      {
        id: 'cwp12-3',
        text: '✅ 答案：小明的糖少！', // CORRECT ANSWER - 直接给出答案
        textForTTS: '答案：小明的糖少！',
        innerActivitiesWhenFail: '太棒了！小明的糖少，这就是正确答案！',
        distractorText: '✅ 答案：小红的糖少', // CLEARLY WRONG
        distractorTextForTTS: '答案：小红的糖少',
        innerActivitiesWhenDistractorClicked: '这个答案错了哦！再想想看，谁手里的糖数字比较小呢？',
        weight: 10
      },
      {
        id: 'cwp12-4',
        text: '🧮 用手指：5根手指代表小明的糖，8根代表小红', // CORRECT ANSWER - 可视化方法
        textForTTS: '用手指：5根手指代表小明的糖，8根代表小红',
        innerActivitiesWhenFail: '好主意！伸出手指数一数，就知道谁少了！',
        distractorText: '🧮 把糖混在一起数总数', // CLEARLY WRONG
        distractorTextForTTS: '把糖混在一起数总数',
        innerActivitiesWhenDistractorClicked: '混在一起就不能比谁多谁少啦！我们要分别数出每个人的糖。',
        weight: 8
      }
    ]
  },
  {
    id: 'compare-word-problem-extra-13',
    question: '教室里有3张课桌，5把椅子，课桌比椅子少几把？',
    questionForTTS: '教室里有3张课桌，5把椅子，课桌比椅子少几把？',
    knowledgePoints: [
      {
        id: 'cwpe13-1',
        text: '💭 课桌少：5-3=2把，课桌少2把', // CORRECT ANSWER - 包含计算
        textForTTS: '课桌少：5减3等于2把，课桌少2把',
        innerActivitiesWhenFail: '聪明！用减法就能算出来课桌比椅子少多少了！',
        distractorText: '💭 椅子少：3-5=-2，椅子少2把', // CLEARLY WRONG
        distractorTextForTTS: '椅子少：3减5等于负2，椅子少2把',
        innerActivitiesWhenDistractorClicked: '这里不能出现负数哦！课桌比椅子少，应该用大数减小数。',
        weight: 10
      },
      {
        id: 'cwpe13-2',
        text: '🔢 找到答案：课桌比椅子少2把', // CORRECT ANSWER - 直接答案
        textForTTS: '找到答案：课桌比椅子少2把',
        innerActivitiesWhenFail: '对啦！这就是正确答案！课桌比椅子少2把！',
        distractorText: '🔢 找到答案：椅子比课桌少2把', // CLEARLY WRONG
        distractorTextForTTS: '找到答案：椅子比课桌少2把',
        innerActivitiesWhenDistractorClicked: '看清楚问题问的是什么哦！问题问的是课桌比椅子少几把，不是椅子比课桌。',
        weight: 10
      },
      {
        id: 'cwpe13-3',
        text: '📝 用线段画：课桌画3段，椅子画5段，差2段', // CORRECT ANSWER - 可视化
        textForTTS: '用线段画：课桌画3段，椅子画5段，差2段',
        innerActivitiesWhenFail: '画线段的方法很棒！一眼就能看出课桌比椅子少2段！',
        distractorText: '📝 用线段画：都画一样多的线段', // CLEARLY WRONG
        distractorTextForTTS: '用线段画：都画一样多的线段',
        innerActivitiesWhenDistractorClicked: '如果画得一样多，就看不出谁多谁少啦！要按实际数量画。',
        weight: 8
      },
      {
        id: 'cwpe13-4',
        text: '✅ 我会解！课桌少2把！', // CORRECT ANSWER - 肯定回答
        textForTTS: '我会解！课桌少2把！',
        innerActivitiesWhenFail: '太厉害了！你已经掌握了这种题目！课桌确实少2把！',
        distractorText: '❌ 这个太难了，不会', // CLEARLY WRONG
        distractorTextForTTS: '这个太难了，不会',
        innerActivitiesWhenDistractorClicked: '别灰心！用画图和数数的方法就能做出来啦！',
        weight: 9
      }
    ]
  }
];

export default mockTopics_CompareQuantitiesDeepDive