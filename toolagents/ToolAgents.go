package toolagents

import (
	"github.com/doptime/evolab/toolcall"
)

type ToolAgent struct {
	Id              string
	WorkingBoundary string //"realm" or "global", "global" is default
	Model           string //LLM model name. "Qwen14B" as default
	ToolParam       *toolcall.Tool
	Run             toolcall.ToolCallback
}

func (a *ToolAgent) RegisterCallback(f toolcall.ToolCallback) *ToolAgent {
	toolcall.RegisterCallback(a.Id, f)
	a.Run = f
	return a
}

func NewDefaultToolAgent(a *ToolAgent) *ToolAgent {
	a.Model = map[bool]string{true: a.Model, false: "Qwen14B"}[a.Model != ""]
	a.WorkingBoundary = map[bool]string{true: a.WorkingBoundary, false: "global"}[a.WorkingBoundary != ""]
	return a
}
