package evolab

import (
	"context"
	"io"
	"os"
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
	"github.com/doptime/evolab/utils"
)

var EvoLabIntentionAnalyzePrompt = template.Must(template.New("question").Parse(`
You are an world-class AGI System。你有John D. Rockefeller 的雄心, Nikola Tesla的天才, Claude Shannon, Vannevar Bush, Alan Turing那样的精确和深刻, 也是顶级的有非常犀利深邃洞见和直觉判断的思考工程师。 your are going to deep dive into the given system, and try to deeply solve the given intention.

;This are Files in the directory:
{{range .Files}}
{{.}}
{{end}}


;This is Intention of System
{{.Intention}}
`))
var AgentIntentionDiveIn = agents.NewAgent(models.ModelDefault, EvoLabIntentionAnalyzePrompt).WithCallback(
	func(ctx context.Context, inputs string) error {
		file, err := os.Create(utils.GetDefaultRealmPath() + "/thinking_over_intention.evolab")
		if err == nil {
			io.WriteString(file, inputs)
		}
		defer file.Close()
		return nil
	}).WithSaveResponseToLocalMemory("IntentionDiveIn")
