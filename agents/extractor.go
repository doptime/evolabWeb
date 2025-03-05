package agents

import (
	"context"
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/models"
	"github.com/doptime/eloevo/tool"
)

var aExtractScenario = agent.NewAgent(template.Must(template.New("structExtractor").Parse(`
仔细理解原始输入的格式. 并从原始输入中提取目标结构体。主要其中变量名称有可能有大小写空格等差异。如果有多个结构体，请多次调用ExtractDataStructure函数。
这是原始输入：
{{.Text}}
`)))

func ExtractStruct[v any](text string, callback func(param v)) {
	var toolExtratorSenario = tool.NewTool("ExtractDataStructure", "Extract Data Structure from Text", callback)
	aExtractScenario.Clone().WithTools(toolExtratorSenario).WithModel(models.ModelQwen14B)
	aExtractScenario.Call(context.Background(), map[string]any{"Text": text})
}
