
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
[EvoRealm]
type EvoRealm struct {
	Topic           string `msgpack:"t" json:"topic"` 
	CreatedAt         int64 `msgpack:"c" `
	QueryTalkIds []string `msgpack:"Queries"`
}
EvoRealm 定义了主题和该主题下的相关问题
1. EvoRealm 包含一个Topic，通过Topic定义了对特定内容具有偏好。
2. EvoRealm 包含一个QueryTalks.	QueryTalks由人类负发起。
	QueryTalks定义了EvoRealm期望的输出: 世界是一个意图化的世界。意图通过 QueryTalks 定义。整个系统围绕QueryTalks的模块化构建而设计。
	动态追加问题：用户对模拟器的意图通常难以预先确定。所以需要动态地增加QueryTalks. 但系统至少需要一个QueryTalk, Pondor才能开始工作。
一个EvoRealm 下包含多个Question
	

### 2.2  主要组件 - AnswerTalks
// 信息（Talk）被组织为模块化的结构Talks。并在不同的输出主题（Query）下面被组织为不同的Answer。
// Files 是模拟器中的Talk的一种。Files 对应计算机上的物理文件。
type Talk struct {	
	TalkId string	//case file: f/Path...; case created by user: u/.../nanoid; case others: chars(TalkId) ∈ {alphanumeric}
	Content string
	Purpose string //Purpose is used for describe what is expected to realiza of this Talk. used for context pick up
	SolveState string //SolveState is used for describe the state of the Talk. either ’uncompleted’ ’canBeImproved’ ’FullySolved’
    Dependencies []string `msgpack:"d"` // 引用的 TalkIds	
}

//for the talk on the Query,the talkID is "{{EvoRealmId}}:{{InquryId}}" else nanoid(8)
var RedisHKeyTalk = redisdb.HashKey[TalkId string as field, FeedbackMemo *Talk]("Talk")
...


### 2.3  EvoOS主要组件 
EvoOS是由多种工具个体组成的"世界模拟器"平台。EvoOS采用文字作为信息表征,旨在通过模拟和自组织的方式解决问题和完成工作。
工具个体是EvoOS的基本组成单位，包括中央调度工具在内都是工具个体。 工具个体通过合适的规则进行自组织和协作. 系统预先创建的工具个体是全局性的，但也可以通过增加Realm Specific Tool Agents来满足新的需求。

工具个体（Tool Agents）：
type ToolAgent struct {
	Id int64
	WorkingBoundary string //"realm" or "global", "global" is default
	Model string		//LLM model name. "Qwen14B" as default
	DutyPrompt    string //prompt implementation of Duty of the ToolAgent
	FunctionCalls []tools.Tool //langchaingo tool calls
}
func NewToolAgent(id string,a *ToolAgent) *ToolAgent {
	a.Id = id
	a.Model = map[bool]string{true: a.Model, false: "Qwen14B"}[a.Model != ""]
	a.WorkingBoundary = map[bool]string{true: a.WorkingBoundary, false: "global"}[a.WorkingBoundary != ""]
	return a
}



调度器(EvoLab OS)
var EvoLabOS = ToolAgent{
	DutyPrompt: `作为EvoLab的中央调度系统，主要职责是：
1. 现状评估: Query 和回答Query的Talks的深层语义和依赖关系进行分析。
   - 识别未解决的需求和缺失的环节
   - 评估解决方案的完整性和一致性
   - 评估不明确需要明晰的地方
2. 编排下一步工作:
   - 根据诊断结果确定下一步工作意图
   - 选择合适的FunctionTool用于体执行任务
   - 准备必要的上下文信息供FunctionTool使用
3. 使用工作意图，上下文信息作为参数，调用FunctionTool`,
	FunctionCalls:[]tools.Tool{functioncalls.TalkGeneratorFunc,functioncalls.TalkModularizerFunc}
}



Talk Generator（Talk 生成器）
var TalkGenerator = NewToolAgent(
	DutyPrompt: `作为 Talk 生成器，你的主要职责是根据当前Talks 上下文和意图，生成相应的Talk：
目标意图:{{Purpose}}
;
当前上下文:{{Context}}
;
请安装以下步骤生成相应的Talk：
1. 观察 EvoRealm 和当前的 Talks，以理解目标工作意图。 
2. 按照目标工作意图，迭代或创建新的Talks信息（观点或问题），以支持对 Query 的回答。
3. 为每个新生成的 Talk 添加意图描述（Purpose），并描述填写该 Talk 的模块化依赖列表。
4. 记忆管理: 调用FunctionCalls,维护Talk的持久性存储，供后续的模型响应使用。
请确保生成的 Talks 有助于解决 Query，并遵循模块化设计原则。`,
	FunctionCalls:[]tools.Tool{RedisHKeyTalk_HMSet}
}

 
Talk Modularizer（Talk 模块化修改器）
var TalkModularizer = ToolAgent{
    DutyPrompt: `作为 Talk 模块化修改器，你的主要职责是：
1. **Talks 模块化**：组织和维护 Talks，使其高内聚低耦合，确保 Talks 集合遵循 MECE 原则。管理 Talks 的组合关系，确保在回答 Query 时逻辑自洽。
2. **Talks 消融**：识别并删除错误、无用或有更好替代的 Talks。
3. **更新依赖关系**：确保每个模块化的 Talk 引用一个或多个相关的 Talks，更新相应的 Talk.Dependencies。Query Talks 根节点，模块化的 Talks 应形成一个多根节点的树。
4. **重新评价问题解决状态**：在 Talk.SolveState 中评估问题是否已解决。SolveState 允许的值包括 'uncompleted'、'canBeImproved'、'FullySolved'。
5. **记忆管理**：调用 FunctionCalls，维护关键上下文的持久性存储。
请确保所有的调整和更新都有助于更好地回答 Query，并提高系统的整体效率。`,
	FunctionCalls:[]tools.Tool{RedisHKeyTalk_HMSet}
}
