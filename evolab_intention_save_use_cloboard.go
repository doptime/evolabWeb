package evolab

import (
	"text/template"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
)

var BlankTemplete = template.Must(template.New("question").Parse(``))
var AgentIntentionSaveUseSourceClipboard = agents.NewAgent(models.ModelDefault, BlankTemplete, agents.SaveStringToFile.Tool).WithMsgDeClipboard()
