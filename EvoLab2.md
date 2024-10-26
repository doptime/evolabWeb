

## 1. 项目概述

EvoLab 是一个基于人工智能的"世界模拟器"平台，旨在通过模拟和自组织的方式解决一般问题和复杂问题。该平台的参与者由IA (Inteligent Agent，人或人工智能) 实体组成。

信息（Talk）被组织为模块化的结构。并在不同的输出主题（Query）下面被组织为不同的视图。
在一个视图中，未被使用到的Talk 会按照相关性，作为Talk节点的附录。

EvoLab的模拟器EvoRealm 是个容器，通过定义问题域，了足够的语义情境，用来求解输出问题。和传统的仿真，建模不同的是，这个模拟器是一个自下而上的自组织的系统。

典型用例:
- 讨论小学课程的编排
- 套如何设计廉价可靠，易于控制的50kg载荷的物流无人机的各个部件
- 讨论完善开发一个后端开发框架。

用户交互：
人类用户通过 EvoRealm 输入问题域，并通过 Query 提出具体问题。
除了人类用户输入的问题外，其他回答原则上由 AI 提供。


所谓复杂问题通常指的是必须经由错误才能正确的问题。白盒研究表明, LLM实际上经常后悔，但是给定问题和错误回答后，要求重新回答，LLM依然经常会对新生成的答案后悔；另一方面，LLM在判定是否要后悔方面是相当准确的，LLM在真正优秀的答案给出后，通常会准确给出高评价。结合这两点，这实际上意味着问题的求解必须保留错误路径，通过排除错误的来接近正确。确切说，LLM需要足够的迭代次数累积样本才能通过审阅错误的答案，建立对正确答案的认知；需要足够的迭代才能把答案合理地模块化。

问题解决标准：一个 Query 被标记为 Solved 时，表示问题已成功解决。

## 2. 核心理念
- 世界模拟: 世界模拟是完成所有工作的最佳方式
- 文本表征: 模拟器采用文字作为表征
/* - 多模态表达: 模拟器采用文字、图像、图表、代码和数学公式，以更全面地表达复杂问题的解决方案。*/
- 自组织与自补足: 模拟不是复制相似样本的行为，模拟是问题的自组织、自补足的过程.

## 3. EvoLab模拟器系统架构 
### 3.1  主要组件


[问题域(EvoRealm)]
创建容器：通过主题（Topic）创建一个问题域容器，对特定内容具有偏好。
数据输入处理：
	EvoRealm 允许数据注入;
	注入的数据被整理成条理化的Talks. 原始数据的Id以"Data"打头。处理后的数据以"onData"打头。
	通过这个过程，Realm建构了自身的存在历史。
	

type EvoRealm struct {
	Topic           string `msgpack:"t" json:"topic"`
	Up, Down, Shown int64
	Created         int64 `msgpack:"c" `
    Popularity        float64
	QueryIds []string `msgpack:"Queries"`
}
字段解释：
Topic = 由 IA 生成主题的需求
Up = 人类对此主题的 赞同数
Down = 人类对此主题的 反感数
Shown = 人类查看此主题的次数
Created = 主题创建时间
Popularity = f() = (up - 5 * down) /log(days(now() - created)+2)


[[主题提取器(Query)]]
说明: 
创建与定义：
	Query创建由人类负发起。Query定义了模拟器期望的输出。
	世界是一个意图化的世界。意图通过 Question 定义。多个IA尝试提供相应的答案.

动态追加问题：
用户对模拟器的意图通常难以预先确定。所以需要动态地增加Question. 但至少需要一个Query, Pondor才能开始工作。
一个EvoRealm 下包含多个Question

type Query struct {
	Question string `msgpack:"q"`
	From     string
	PonderState map[ model string ] state string	
}

功能: Query 提供了生成器(Ponder) 试图回答的问题。


[IA(Model)]
IA 是人或机器。是实现Ponder功能的运算器。
type IA map[IAId int64] name string

[[生成器(Ponder)]]
功能说明：

解决Query：
	Talks 是自下而上地提供解决问题的材料。Ponder 使用用多步骤回答问题,每一步骤必须引用现有的一个 Talk，Ponder 通过引用现有的 Talks,形成TalkList 回答 Query。
	完成回答后，将答案路径填入 AswTalkIds。如果模型觉得回答已经没有改进空间了，那么标记 Answer.Solved = true
	Ponder 回答时候引用的Talks 保存在AnswerTalkIds中. 
	同时每次需要报告回答的情况(PonderState)。PonderState允许的值包括 "uncompleted" "canBeImproved" "FullySolved" 

模块化与层次性：
	Talks 是模块化的。它的内容应满足高内聚、低耦合，遵循 MECE 原则（Mutually Exclusive, Collectively Exhaustive）。
	一系列 Talks 的组合用于回答 Query，组合关系（引用列表）保存于 AswTalkIds 中。

生成新的 Talks：
	Ponder 以多次迭代的方式最终完成回答Query. 通过观察 EvoRealm 的输 和现有的 Talks. 如果现有的路径不足以解决Query, 需要引入新的Talk (信息、意见和问题)以回答Query, 那么生成一个新 Talk 并终止回答，为后续不同模型的回答做准备。

修改 Talks：
	Ponder 可以修改现有的 Talks 以回答 Query. 需要说明的是，一个Talk可能要用来回答多个 Query, 所以Talk的内容要面向Inqury 冲突最小化和信息最大化。

删除 Talks：
	如果一个 Talk 被认为是错误的，无用的，或者有更好的替代，那么可以删除。

数据结构：
var KeyTalk = redisdb.HashKey[TalkId string, Talk string]()
var KeyAnswer = redisdb.HashKey["{{EvoRealmId}}:{{InquryId}}:{{IAId}}" string, map[string]string{"1/1":talkId1, "1/2":talkId2, "1/2/1":talkId3, "2":talkId3}]()


### 3.2 架构的数学表示
[EvoRealm]
    Topic = 主题提取器(用户输入的问题)
    
[[Query]]
	Question = 人类或机器提出的问题
	From     = LLM名称或人类用户名
    Answer = 主题提取器生成的内容=f(Talks,求解器输出)
	
	
[[Ponder]]
AnswerTalkIds = [[Talks]]
生成内容 = f(求解器输入.问题, 反馈输入,[[Talks]]) 
ErrorTalkList = [[Talks]]

