
## 1. 项目原型概述
EvoLab 是一个基于人工智能的"世界模拟器"平台，采用文字作为信息表征,旨在通过模拟和自组织的方式解决问题和完成工作。

交互：
该平台的参与者由人类和ToolAgent组成。
人类用户通过 EvoRealm 输入问题域，并通过 Query 提出具体问题。
除了人类用户输入的问题外，其他回答原则上由 ToolAgent 提供。
问题解决标准：一个 Query 被标记为 Solved 时，表示问题已成功解决。


典型用例:
- 讨论小学课程的编排
- 套如何设计廉价可靠，易于控制的50kg载荷的物流无人机的各个部件
- 讨论完善开发一个后端开发框架。




## 2. EvoLab模拟器系统架构 
### 2.1  主要组件 - 问题域
[问题域(EvoRealm)]
创建容器：人类用户通过主题（Topic）创建一个问题域容器，对特定内容具有偏好。	

type EvoRealm struct {
	Topic           string `msgpack:"t" json:"topic"` 
	CreatedAt         int64 `msgpack:"c" `
    Popularity        float64
	QueryIds []string `msgpack:"Queries"`
}

### 2.2  主要组件 - 主题提取器
[[主题提取器(Query)]]
说明: 
创建与定义：
	Query创建由人类负发起。Query定义了模拟器期望的输出。
	世界是一个意图化的世界。意图通过 Question 定义。由ToolAgents尝试提供相应的答案来实现求解.

动态追加问题：
用户对模拟器的意图通常难以预先确定。所以需要动态地增加Question. 但至少需要一个Query, Pondor才能开始工作。
一个EvoRealm 下包含多个Question
	
type Query struct {
	Question string `msgpack:"q"`	//人类或机器提出的问题
	From     string //LLM名称或人类用户名
	PonderState map[ model string ] state string	//主题提取器生成的内容=f(Talks,求解器输出)
}

功能: Query 提供了生成器(Ponder) 试图回答的问题。

### 2.3  主要组件 - AnswerTalks
// 信息（Talk）被组织为模块化的结构Talks。并在不同的输出主题（Query）下面被组织为不同的Answer。
// Files 是模拟器中的Talk的一种。Files 对应计算机上的物理文件。
type Talk struct {
	//case file: f/Path... ; other case: chars(TalkId) ∈ {alphanumeric}
	TalkId string	
	Content string
    Dependencies []string `msgpack:"d" json:"dependencies"` // 引用的 TalkIds	
	Utility string //utility is used for context pick up
}
var KeyTalk = redisdb.HashKey[TalkId string, Talk string]()

type Answer struct {
    TalksIDs []string
	SolveState string
}
var KeyAnswer = redisdb.HashKey["{{EvoRealmId}}:{{InquryId}}", *Answer]()


### 2.3  主要组件 - 模拟器(EvoOS)
[LLMContext]

[[模拟器(EvoOS)]]
功能说明：
模拟器是一个包含多种工具个体的操作系统，模拟器通过ToolAgents 在上下文操作中 实现 更新 AnswerTalks  用于解决 Query 并管理整个模拟过程。

工具个体（Tool Agents）：

定义：工具个体是 PonderPipelineOS 中的基本运行单元，类似于微服务或插件。
特性：
对等性：所有工具个体都是平等的，包括中央调度工具。
存在边界：工具个体应该是全局性的，而不是Realm specific？
自组织：工具个体通过合适的规则进行自组织和协作。
可扩展性：可以通过发明和调整工具来满足新的需求。
type ToolAgent struct {
	Id int64
	WorkingBoundary string //"realm" or "global", "global" is default
	Model string		//LLM model name. "Qwen14B" as default
	Duty  string //what to do
	Prompt    string //prompt implementation of Duty
	FunctionCalls []string //function calls
}
func (a *ToolAgent) Default() *ToolAgent {
	a.Id = a.Id | time.Now().UnixNano()
	if a.Model = ""{
		a.Model ="Qwen14B"
	}
	if a.WorkingBoundary = ""{
		a.WorkingBoundary = "global"
	}
	return a
}

必要的基础性工具个体：

工具个体评价器（ToolAgent Evaluator）
var ToolEvaluator = ToolAgent{
	Duty: `1. 提供模拟世界的评估：
   - 评价什么样的工具个体如何支持了系统的主要输出性能
   - 评价工具个体的如何导致了系统性能的劣化
2. 提供面向部分工具个体的反馈：
   - 生成需要强化的工具个体的反馈报告
   - 生成需要弱化的工具个体的反馈报告`,
	Prompt:   "evaluate other tools' performance",
}
var KeyTalk = redisdb.HashKey["{{unixtime}}" string as field, "FeedbackMemo" string as value]("ToolAgentEvaluations:{{ToolAgentId}}")

工具个体管理器（ToolAgent Manager）
var ToolAgentManager = ToolAgent{
	Duty: `工具生命周期与进化管理:
 1. 生命周期管理: 如果需要全新的功能，则创建ToolAgent。如果ToolAgent不被需要，则删除。
 2. 基于性能的迭代优化: 根据工具评价器的反馈，分析工具性能数据; 识别优化机会,调整工具的逻辑和功能; 提出改进的替代版本 
 3. 基于自组织协调的迭代优化: 优化工具间的协作模式; 调整工具组合策略; 实现工具集的整体进化; `,
	Prompt:   "manage tools' lifecycle",
}


智能上下文管理与优化：

  
调度器(Ponder Pipeline OS)
var PonderPipelineOS = ToolAgent{
	Duty: `1. Query和上下文分析：
   - 理解Query的深层语义和依赖关系
   - 评估上下文相关性和重要性
   - 评估上下文冲突和歧义或者是缺乏明确性的部分
   - 识别关键信息和约束条件.
2. 任务分解. 使用多个 Model（模型）协同工作. 
   - Query 分解为多个子任务,下一个子任务是什么。
   - 根据下一个子任务，分析接下来应该哪一个的工具个体，以 Pipeline 的方式完成 Query 的求解。
3. 选择上下文
   - 根据 Query 的内容和模拟世界的状态，选择合适的工具个体和适用工具个体的上下文，以便交付工具个体运行。`,
	Prompt:   "run tools in pipeline",
}


Talk Generator（Talk 生成器）
var TalkGenerator = ToolAgent{
    Duty:   "在现有路径不足以解决 Query 时，生成新的 Talks。通过多次迭代观察 EvoRealm 的输出和现有 Talks，生成新信息、意见或问题，为后续不同模型的回答做准备。",
    Prompt: "Iteratively generate new Talks when existing paths are insufficient to answer the Query. Observe EvoRealm's outputs and current Talks to create new information, opinions, or questions to support future model responses.",
}

 
Talk Modularizer（Talk 模块化修改器）
var TalkModularizer = ToolAgent{
    Duty:   `修改现有的 Talks，确保 Talks 的模块化和层次性，以更好地回答所有 Query。
1. Talks 模块化：
	维护高内聚低耦合，遵循 MECE 原则。管理 Talks 的组合关系，确保回答 Query 时的逻辑自洽。
2. 上下文消融：
	清理错误，无用的或有更好替代的Talks。
3. 记忆管理：
	维护关键上下文的持久性存储
	`,
    Prompt: "Organize Talks to ensure modularity and hierarchy. Maintain high cohesion and low coupling following the MECE principle. Manage the relationships between Talks to ensure logical consistency when answering Queries.",
}


Query Solver（查询解决器）
var QuerySolver = ToolAgent{
    Duty:   "处理和解决 Query，通过引用现有的 Talks 形成模块化回答。Talk的内容要求是模块化的，高内聚低耦合。相互独立，完全穷尽（MECE）。确保每一步骤引用一个或多个 Talks，更新相应的 Answer.TalkIds 。在Answer.SolveState中评价问题是否已解决(SolveState)。SolveState允许的值包括 ’uncompleted’ ’canBeImproved’ ’FullySolved’ ",
    Prompt: "Use existing Talks to generate a multi-step answer for the Query. Reference relevant Talks in each step and update AnswerTalkIds and AswTalkIds accordingly. Mark Answer.Solved as true if no further improvements are needed.",
}





