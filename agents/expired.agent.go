package agents

// import (
// 	"context"
// 	"fmt"

// 	"github.com/tmc/langchaingo/chains"
// 	"github.com/tmc/langchaingo/llms"
// 	"github.com/tmc/langchaingo/prompts"
// )

// type Agent struct {
// 	name        string
// 	description string
// 	llm         llms.Model
// 	Tools       []FunctionCall
// 	prompt      *prompts.PromptTemplate
// }

// func (a *Agent) Name() string {
// 	chains.LLMChain(a.llm, a.prompt)
// 	return a.name
// }
// func (a *Agent) Description() string {
// 	return a.description
// }

// func (a *Agent) Call(ctx context.Context, input string) (string, error) {
// 	toolDescriptions := ""
// 	for _, tool := range a.Tools {
// 		toolDescriptions += tool.String() + "\n"
// 	}
// 	if len(toolDescriptions) > 0 {
// 		toolDescriptions = fmt.Sprintf("You have access to the following tools:\n%s\nTo use a tool, please use the following format:\nAction: <tool_name>\nInput: <tool_input>", toolDescriptions)
// 	}
// 	hmessege := llms.MessageContent{Role: llms.ChatMessageTypeHuman,
// 		Parts: []llms.ContentPart{
// 			llms.TextContent{Text: toolDescriptions + a.prompt.Template},
// 		}}

// 	response, err := a.llm.GenerateContent(ctx, []llms.MessageContent{hmessege})
// 	if err != nil {
// 		return "", err
// 	}

// 	fc := response.Choices[0].FuncCall
// 	if fc != nil {
// 		if fun, ok := AgentPool[fc.Name]; ok && fun != nil {
// 			return fun(fc.Arguments)
// 		}
// 	}
// 	return "", nil

// }

// func NewAgent(Name string, description string, llm llms.Model, prompt *prompts.PromptTemplate, tools ...FunctionCall) *Agent {
// 	return &Agent{
// 		name:        Name,
// 		description: description,
// 		llm:         llm,
// 		prompt:      prompt,
// 		Tools:       tools,
// 	}
// }
