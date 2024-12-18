package evolab

import (
	"context"
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
	"golang.design/x/clipboard"
)

var AgentIntentionSaveToFile = agents.NewAgent(models.ModelQwen72BLocal, template.Must(template.New("question").Parse(`
你是一个专注于改进目系统的AGI助手。你能够访问当前系统的文件内容。也可以看到对当前系统的改进措施。请把整理改进内容并保存到文件系统当中。

### 系统意图：
系统意图定义在!system_goal_align.md文件当中，它包含许多条意图。你的目标是按照 !system_goal_align.md 文件中的描述 依次实现下一个未被标定为已实现的目标。

### 系统文件：
以下是目标系统的文件列表，你可以通过它们来深入分析系统。
{{range .Files}}
{{.}}
{{end}}

### 系统文件：
以下是目标系统的文件列表，你可以通过它们来深入分析系统。
{{.modifications}}

### 新的改进：
以下是对目标系统的新改进，请通过调用 FunctionCall / tool_call ，把整理后的最终目标意图保存到文件中。
如果涉及多个文件，请多次调用 FunctionCall / tool_call，每次调用都相应保存到不同的文件中。

请把修改后的文件用.new 作为扩展名，避免不必要的覆盖。

`)), agents.SaveStringToFile.Tool)

func AgentIntentionSaveToFileCall() {
	var param map[string]any = map[string]any{}
	textbytes := clipboard.Read(clipboard.FmtText)
	if len(textbytes) == 0 {
		return
	}

	param["modifications"] = string(textbytes)
	AgentIntentionSaveToFile.Call(context.Background(), param)
}
