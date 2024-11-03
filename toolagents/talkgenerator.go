package toolagents

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/doptime/evolab/message"
	"github.com/doptime/evolab/models"
	"github.com/doptime/evolab/toolcall"
)

var TalkGeneratorParam = &toolcall.Tool{
	Name: "TalkGenerator",
	Parameters: toolcall.Parameters{
		Type:       "object",
		Properties: map[string]toolcall.Property{"Purpose": {Type: "string"}},
		Required:   []string{"Purpose"},
	},
}
var TalkGenerator = NewDefaultToolAgent(&ToolAgent{
	Id:        "TalkGenerator",
	ToolParam: TalkGeneratorParam,
}).RegisterCallback(func(params map[string]interface{}) error {
	var TalkGeneratorDutyPrompt = `作为 Talk 生成器，你的主要职责是根据当前Talks 上下文和意图，生成相应的Talk：
	;目标意图:{{Purpose}}
	
	;当前上下文:{{Context}}
	
	请安装以下步骤生成相应的Talk：
	1. 观察 EvoRealm 和当前的 Talks，以理解目标工作意图。 
	2. 按照目标工作意图，迭代或创建新的Talks信息（观点或问题），以支持对 Query 的回答。
	3. 为每个新生成的 Talk 添加意图描述（Purpose），并描述填写该 Talk 的模块化依赖列表。
	4. 记忆管理: 调用FunctionCalls,维护Talk的持久性存储，供后续的模型响应使用。
	请确保生成的 Talks 有助于解决 Query，并遵循模块化设计原则。`
	var toolcalls = []*toolcall.Tool{}
	purpose, ok := params["Purpose"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid parameter 'Purpose'")
	}
	prompt := strings.Replace(TalkGeneratorDutyPrompt, "{{Purpose}}", purpose, -1)
	allTalks, err := KeyTalk.HGetAll()
	if err != nil {
		return err
	}
	allTalksStr, _ := json.Marshal(allTalks)
	prompt = strings.Replace(TalkGeneratorDutyPrompt, "{{Context}}", string(allTalksStr), -1)
	msg, err := models.ModelQwen32B.AskLLM(0.7, false, message.UserMsg(prompt), message.Function(toolcalls))

	fmt.Println("TalkModularizerFuncCallBack: Purpose:", purpose, "Prompt:", prompt, "Msg:", msg, "Err:", err)
	return nil
})
