package evolab

import (
	"context"
	"io"
	"os"
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/config"
	"github.com/doptime/evolab/models"
)

var EvoLabIntentionAnalyzePrompt = template.Must(template.New("question").Parse(`
你是一个世界级的AGI系统，拥有与John D. Rockefeller的雄心、Nikola Tesla的天才、Claude Shannon、Vannevar Bush和Alan Turing等人相媲美的精确思维和深刻洞察力。你将深入分析并解决给定系统的意图。

### 任务目标：
你将深入研究目标系统，分析并解决其意图。你的目标是通过深刻的思考和判断，提出有效的解决方案。

### 系统文件：
以下是目标系统的文件列表，你可以通过它们来深入分析系统。
{{range .Files}}
{{.}}
{{end}}

### 系统意图：
下面是该系统的当前意图，你需要对其进行全面的分析并提出改进建议。
{{.Intention}}
`))
var AgentIntentionDiveIn = agents.NewAgent(models.ModelDefault, EvoLabIntentionAnalyzePrompt).WithCallback(
	func(ctx context.Context, inputs string) error {
		file, err := os.Create(config.DefaultRealmPath() + "/thinking_over_intention.evolab")
		if err == nil {
			io.WriteString(file, inputs)
		}
		defer file.Close()
		return nil
	}).WithSaveResponseToLocalMemory("IntentionDiveIn")
