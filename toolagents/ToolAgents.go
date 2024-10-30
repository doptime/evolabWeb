package toolagents

import (
	"fmt"

	"github.com/doptime/evolab/functioncalls"
	"github.com/tmc/langchaingo/tools"
)

type ToolAgent struct {
	Id              string
	WorkingBoundary string       //"realm" or "global", "global" is default
	Model           string       //LLM model name. "Qwen14B" as default
	DutyPrompt      string       //prompt implementation of Duty of the ToolAgent
	FunctionCalls   []tools.Tool //langchaingo tool calls
}

func NewToolAgent(id string, a *ToolAgent) *ToolAgent {
	a.Id = id
	a.Model = map[bool]string{true: a.Model, false: "Qwen14B"}[a.Model != ""]
	a.WorkingBoundary = map[bool]string{true: a.WorkingBoundary, false: "global"}[a.WorkingBoundary != ""]
	return a
}

var EvoLabOS = NewToolAgent("EvoLabOS", &ToolAgent{
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
})

func EvoLabOSCallback(params map[string]interface{}) error {
	purpose, ok := params["Purpose"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid parameter 'Purpose'")
	}
	fmt.Println("TalkModularizerFuncCallBack: Purpose:", purpose)
	return nil
}

var TalkGenerator = NewToolAgent("TalkGenerator", &ToolAgent{
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
})

func TalkGeneratorCallback(params map[string]interface{}) error {
	purpose, ok := params["Purpose"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid parameter 'Purpose'")
	}
	fmt.Println("TalkModularizerFuncCallBack: Purpose:", purpose)
	return nil
}

func init() {
	functioncalls.RegisterCallback("TalkGeneratorFunc", TalkGeneratorCallback)
	functioncalls.RegisterCallback("EvoLabOS", EvoLabOSCallback)

}
