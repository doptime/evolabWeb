package evolab

import (
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
)

var EvoLabIntentionSavePrompt = template.Must(template.New("question").Parse(`
你是一个世界级的AGI系统，目标是改进指定的目标系统。以下是相关信息：

1. **目标系统文件**：
   目标系统的文件列表如下，你可以在这些文件中查找与改进相关的内容。
   {{range .Files}}
   {{.}}
   {{end}}

2. **目标系统意图**：
   以下是目标系统当前的意图。你已经在之前的系统调用中分析过这个意图。
   {{.Intention}}

3. **前期工作总结**：
   以下是你在之前工作中分析和处理的内容。你需要整理并总结这些信息，以便最终改进目标系统的意图。
   {{.IntentionDiveIn}}

4. **下一步操作**：
   现在，请调用提供的 FunctionCall / tool_call 以保存并整理结果到文件中，为提交最终版本的目标系统意图解决方案做好准备。   
   如果找不到更合适的目标名称时，可以把回答保存在.purposedone文件中。

`))
var AgentIntentionSave = agents.NewAgent(models.ModelQwen32B, EvoLabIntentionSavePrompt, agents.SaveStringToFile.Tool)
