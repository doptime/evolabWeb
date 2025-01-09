package evolab

import (
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/tools"
)

var AgentFunctioncallTest = agent.NewAgent(template.Must(template.New("question").Parse(`
请调用所提供的FunctionTool, 把“Hello World” 输出到test.text 文件中。
`)), tools.SaveStringToFile.Tool)
