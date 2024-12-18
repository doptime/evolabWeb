package evolab

import (
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
)

var EvoLabIntentionSolvePrompt = template.Must(template.New("question").Parse(`
你是一个专注于改进目系统的AGI助手，请分析系统并修改后的内容到文件：

### 系统意图：
系统意图定义在!system_goal_align.md文件当中，它包含许多条意图。你的目标是按照 !system_goal_align.md 文件中的描述 依次实现下一个未被标定为已实现的目标。

### 系统文件：
以下是目标系统的文件列表，你可以通过它们来深入分析系统。
{{range .Files}}
{{.}}
{{end}}

`))

var AgentIntentionSolve = agents.NewAgent(models.ModelQwQ32B, EvoLabIntentionSolvePrompt, agents.SaveStringToFile.Tool).
	WithSaveResponseToLocalFile("IntentionSolved.md").CopyPromptOnly()
