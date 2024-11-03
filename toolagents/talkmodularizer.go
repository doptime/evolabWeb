package toolagents

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/doptime/evolab/message"
	"github.com/doptime/evolab/models"
	"github.com/doptime/evolab/toolcall"
)

var TalkModularizerParam = &toolcall.Tool{
	Name:        "TalkModularizer",
	Description: "Func for TalkModularizer",
	Parameters: toolcall.Parameters{
		Type: "object",
		Properties: map[string]toolcall.Property{
			"Purpose": {Type: "string", Description: "Purpose of this Talk Node"},
		},
		Required: []string{"Purpose"},
	},
}
var TalkModularizer = NewDefaultToolAgent(&ToolAgent{
	Id:        "TalkModularizer",
	ToolParam: TalkModularizerParam,
}).RegisterCallback(func(params map[string]interface{}) error {

	var DutyPrompt = `作为 Talk 模块化修改器，你的模板是进行Talks的模块化和消融，以便更好地回答 Query。

;目标意图:{{Purpose}}
	
;当前上下文:{{Context}}
你的主要职责是：
1. **Talks 模块化**：组织和维护 Talks，使其高内聚低耦合，确保 Talks 集合遵循 MECE 原则。管理 Talks 的组合关系，确保在回答 Query 时逻辑自洽。
2. **Talks 消融**：识别并删除错误、无用或有更好替代的 Talks。
3. **更新依赖关系**：确保每个模块化的 Talk 引用一个或多个相关的 Talks，更新相应的 Talk.Dependencies。Query Talks 根节点，模块化的 Talks 应形成一个多根节点的树。
4. **重新评价问题解决状态**：在 Talk.SolveState 中评估问题是否已解决。SolveState 允许的值包括 'uncompleted'、'canBeImproved'、'FullySolved'。
5. **记忆管理**：调用 FunctionCalls，维护关键上下文的持久性存储。
请确保所有的调整和更新都有助于更好地回答 Query，并提高系统的整体效率。`
	var toolcalls = []*toolcall.Tool{}
	//var ToolsToCall = []*toolcall.Tool{}
	purpose, ok := params["Purpose"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid parameter 'Purpose'")
	}
	prompt := strings.Replace(DutyPrompt, "{{Purpose}}", purpose, -1)

	allTalks, err := KeyTalk.HGetAll()
	if err != nil {
		return err
	}
	allTalksStr, _ := json.Marshal(allTalks)
	prompt = strings.Replace(prompt, "{{Context}}", string(allTalksStr), -1)

	_, err = models.ModelQwen32B.AskLLM(0.7, false, message.UserMsg(prompt), message.Function(toolcalls))
	fmt.Println("TalkModularizerFuncCallBack: Purpose:", purpose)
	return nil
},
)
