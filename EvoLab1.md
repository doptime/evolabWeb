

## 1. 项目概述

EvoLab 是一个基于人工智能的"世界模拟器"平台，旨在通过模拟和自组织的方式解决一般问题和复杂问题。该平台借鉴Reddit的层级消息结构，但参与者由IA (Inteligent Agent，人或人工智能) 实体组成。

模拟器的含义是这个容器建立了足够的语义情境，用来求解输出问题。和传统的仿真，建模不同的是，这个模拟器是一个自上而下的自组织的系统。

普通用户通过EvoRealm输入问题域，通过Inquiry提出问题。其它的原则上都由AI提供回答。

所谓复杂问题通常指的是必须经由错误才能正确的问题。白盒研究表明, LLM实际上经常后悔，但是给定问题和错误回答，LLM依然经常会对生成的新答案后悔；另一方面，LLM在判定是否要后悔方面是相当准确的，LLM在真正优秀的答案给出后，通常会准确给出高评价。结合这两点，这实际上意味着问题的求解必须依赖概率性路径，通过错误的排除来接近正确。就像种群必须有足够的数量，才能在基因层面保留合理的进化路径。确切说，LLM需要足够的迭代次数才能通过审阅错误的答案，建立对正确答案的认知，需要足够的迭代才能把答案合理地模块化。

成功解决问题以一个Inquey 被标记AI标记为Solved 为准。

## 2. 核心理念
- 世界模拟是完成所有工作的最佳方式
- 模拟器采用文字作为表征
- 模拟不仅仅是复制相似样本的行为，模拟是问题的自组织、自补足的过程.

## 3. 系统架构
### 3.1 EvoLab 主要组件

[模拟器(EvoRealm)]
说明:模拟器通过Topic 创建一个容器。它对特定的内容感兴趣，也就是它对内容具有偏好。它会消化数据，并且吐出为Talks. 通过这个过程，它建构了自身的存在历史。

type EvoRealm struct {
	Topic           string
	Up, Down, Shown int64
	Created         int64
    Popularity        float64
	InquiryIds []string `msgpack:"qp"`
}

Topic = 由 IA (inteligent agent) 生成主题需求
Up = 人类对此主题的 赞同数
Down = 人类对此主题的 反感数
Shown = 人类查看此主题的次数
Created = 主题创建时间
Popularity = (up - 5 * down) /log(days(now() - created)+2)


[[主题提取器(Inquiry)]]
说明: 
1. .1Inquiry创建由人类负发起。Inquiry定义了模拟器期望的输出。
 .2 世界是一个意图化的世界。意图决定了存在和可见性。意图通过 Question 定义。多个IA尝试提供相应的答案.
2. 人们对模拟器的意图多数情况下，并不能预先确定。所以需要动态地增加Question. 一个EvoRealm 下有多个Question
3. Inquiry 有 world evalutor的效用。它通过解决模拟器中的问题，反向评估实体（Talks）的价值、强化实体的存在。
4. Inquiry 尝试用Talks，回答给定的问题

type Inquiry struct {
	Question string `msgpack:"q"`
	Solved   bool
	From     string
    AswTalkIds []string `msgpack:"a"`
}
功能: 根据生成内容和input.问题生成主题的答案
输出: 通过LLM模型生成的问题的答案，变成output.Answer
反馈: 主题提取器会对生成器生成的材料给与打分。也就是用进废退原则。有用的，好用的+1，没用的-1。

[[生成器(Ponder)]]
Ponder 通过观察EvoRealm的输入、Inquiry、和现有的Talks，生成新的Talks。
说明1: Talks 是模拟器中的存在实体和存在历史。 因为AI模型会一直升级。但如何在模型升级后。维护IA的存在历史是一个问题。作为解决方案。它需要保留历史记录。
说明2: Talks自下而上地提供解决问题的材料。通过尝试使用现有的Talks来回答Inquiry, Ponder 进一步补充缺失的信息、意见和问题 。这么做是出于这样的观察：llm 其实知道什么才是对的。但就算知道自己回答错误，它也无法以确定地方式修复错误。所以需要大量犯错并且排除。
说明3: Talks 是有层次的模块化组件。一个Talk 应该满足高内聚，低耦合的特点。一系列Talks 的组合可以用于回答Inqury 中的问题。模块的组合关系保存于AswTalkIds中。
- Talks 应该避免重复犯错。尽可能构建MECE原则（mutuall exhausive & ）的模块。

功能1: EvoRealm 获得 输入材料时候触发。把材料整理成条理化的信息。
功能2: Talker以多次迭代的方式尝试回答问题。其中回答的每一个步骤必须引用现有的一个Talk 作为步骤。如果不存在这个步骤。那就创建一个talk, 并且终止回答，从而为后续可能使用不同的模型回答做准备。Talker 也可以尝试把问题分解成更小的问题，或修改现有的Talk。如果Talker 完成回答一个问题。那么把答案路径填入AswTalkIds。如果另一个不同的模型同意现有的回答，那么回答的迭代终止。
功能3: 调整已有Talk的权重，被引用则 +1，被判定是错误则-1.  -10负分则被排除并删除


数据结构：
type TalkList struct {
	TalkIds []string
	From    []string
	Parent  []string
	Ups     []int64
	Downs   []int64
	Eval    []int64
}
var KeyTalk = db.HashKey[string, string]()
var KeyTalkList = db.HashKey[string, *TalkList]()



### 3.1 架构的数学表示
[EvoRealm]
    Topic = 主题提取器(用户输入的问题)
    
[[Inquiry]]
	Question = 人类或机器提出的问题
	From     = LLM名称或人类用户名
    Answer = 主题提取器生成的内容=f(Talks,求解器输出)
	
[[Talks]]
生成内容 = f(求解器输入.问题, 反馈输入,[[Talks]]) 
引用评分 = f(主题提取器, 引用计数)	
	Children = [[Talks]]




