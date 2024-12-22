package evolab

import (
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
)

var EvoLabIntentionSolvePrompt = template.Must(template.New("question").Parse(`
# 你是一个专注于改进目系统的AGI助手
请仔细分析系统文件和系统的意图. 按照系统的意图更新相关的目标文件：

## 系统意图：
系统意图定义在!system_goal_align.md文件当中，它包含多条意图。你的目标是按照 !system_goal_align.md 文件中的描述 实现未被良好实现的目标。

## 系统文件：
以下是目标系统的文件列表，你可以通过它们来深入分析系统。
{{range .Files}}
{{.}}
{{end}}

`))

var AgentIntentionSolve = agents.NewAgent(models.ModelDefault, EvoLabIntentionSolvePrompt, agents.SaveStringToFile.Tool).
	WithModel(models.ModelQwen32BCoderLocal).
	WithMsgToFile("IntentionSolved.md")
	//.WithMsgDeFile("IntentionSolved.md")
