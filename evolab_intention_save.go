package evolab

import (
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
)

var EvoLabIntentionSavePrompt = template.Must(template.New("question").Parse(`You are an world-class AGI System. 你的目标是改进目标系统. 目标系统的文件在下方提供。 系统的意图同样在下方提供。在之前的系统调用当中，你已经完成了对意图的分析工作。现在需要整理总结之前的工作，通过调用FunctionCall把工作结果持到文件，以便实完成目标意图。
;This is Intention of System
{{.Intention}}

;This is output of Previous work:
{{.IntentionDiveIn}}

;This are Files in the directory:
{{range .Files}}
{{.}}
{{end}}

`))
var AgentIntentionSave = agents.NewAgent(models.ModelQwen32B, EvoLabIntentionSavePrompt, agents.SaveStringToFile.Tool)
