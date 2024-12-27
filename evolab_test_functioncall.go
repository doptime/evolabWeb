package evolab

import (
	"text/template"

	"github.com/doptime/evolab/agents"
)

var AgentFunctioncallTest = agents.NewAgent(template.Must(template.New("question").Parse(`
请调用所提供的FunctionTool, 把“Hello World” 输出到test.text 文件中。
`)), agents.SaveStringToFile.Tool)
