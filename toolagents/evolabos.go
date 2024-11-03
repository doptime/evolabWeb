package toolagents

import (
	"encoding/json"
	"strings"

	"github.com/doptime/evolab/message"
	"github.com/doptime/evolab/models"
	"github.com/doptime/evolab/toolcall"
)

var EvoLabOS = NewDefaultToolAgent(&ToolAgent{
	Id:        "EvoLabOS",
	ToolParam: nil,
}).RegisterCallback(func(params map[string]interface{}) error {

	var EvoOSPrompt = `作为EvoLab的中央调度系统，主要职责是：
1. 现状评估: Query 和回答Query的Talks的深层语义和依赖关系进行分析。
   - 识别未解决的需求和缺失的环节
   - 评估解决方案的完整性和一致性
   - 评估不明确需要明晰的地方
2. 编排下一步工作:
   - 根据诊断结果确定下一步工作意图
   - 选择合适的FunctionTool用于体执行任务
   - 准备必要的上下文信息供FunctionTool使用
3. 使用工作意图，上下文信息作为参数，调用FunctionTool

;这是现有的Talks信息：
{{Talks}}
`

	var ToolsToCall = []*toolcall.Tool{TalkGeneratorParam, TalkModularizerParam}
	Talks, err := KeyTalk.HGetAll()
	if err != nil {
		return err
	}
	TalksStr, _ := json.Marshal(Talks)
	_prompt := strings.Replace(EvoOSPrompt, "{{Talks}}", string(TalksStr), -1)
	_, err = models.ModelQwen32B.AskLLM(0.7, false, message.UserMsg(_prompt), message.Function(ToolsToCall))
	return err
})
