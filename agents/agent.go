package agents

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"

	"github.com/doptime/evolab/mem"
	"github.com/doptime/evolab/models"
	openai "github.com/sashabaranov/go-openai"
)

// GoalProposer is responsible for proposing goals using an OpenAI model,
// handling function calls, and managing callbacks.
type Agent struct {
	Model                models.Model
	Prompt               *template.Template
	Tools                []openai.Tool
	SaveResponseToMemory string
	CallBack             func(ctx context.Context, inputs string) error
}

func NewAgent(llm models.Model, prompt *template.Template, tools ...openai.Tool) *Agent {
	return &Agent{
		Model:  llm,
		Prompt: prompt,
		Tools:  tools,
	}
}
func (a *Agent) WithSaveResponseToLocalMemory(memoryKey string) *Agent {
	a.SaveResponseToMemory = memoryKey
	return a
}
func (a *Agent) WithCallback(callback func(ctx context.Context, inputs string) error) *Agent {
	a.CallBack = callback
	return a
}

// ProposeGoals generates goals based on the provided file contents.
// It renders the prompt, sends a request to the OpenAI model, and processes the response.
func (a *Agent) Call(ctx context.Context, memories ...map[string]any) (err error) {
	// Render the prompt with the provided files content and available functions
	var params = map[string]any{}
	for k, v := range mem.SharedMemory {
		params[k] = v
	}
	for _, memory := range memories {
		for k, v := range memory {
			params[k] = v
		}
	}
	var promptBuffer bytes.Buffer
	if err := a.Prompt.Execute(&promptBuffer, params); err != nil {
		fmt.Printf("Error rendering prompt: %v\n", err)
		return err
	}

	// Create the chat completion request with function calls enabled
	req := openai.ChatCompletionRequest{
		Model: a.Model.ModelName,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: promptBuffer.String(),
			},
		},
		Tools: a.Tools,
	}

	// Send the request to the OpenAI API
	resp, err := a.Model.Client.CreateChatCompletion(ctx, req)
	fmt.Println("resp:", resp)
	if err != nil {
		fmt.Println("Error creating chat completion:", err)
		return err
	}
	if a.CallBack != nil {
		a.CallBack(ctx, resp.Choices[0].Message.Content)
	}
	if a.SaveResponseToMemory != "" && len(memories) > 0 {
		memories[0][a.SaveResponseToMemory] = resp.Choices[0].Message.Content
	}
	// Process each choice in the response
	var toolCalls []openai.ToolCall
	for _, choice := range resp.Choices {
		toolCalls = append(toolCalls, choice.Message.ToolCalls...)
	}
	if len(toolCalls) == 0 && len(resp.Choices) > 0 {
		rsp := resp.Choices[0].Message.Content
		rsp = strings.ReplaceAll(rsp, "<tool>", "<tool_call>")
		rsp = strings.ReplaceAll(rsp, "<tools>", "<tool_call>")
		items := strings.Split(rsp, "<tool_call>")
		//case json only
		if len(items) > 3 {
			items = items[1 : len(items)-1]
		}
		for _, toolcallString := range items {
			type FunctionCall struct {
				Name string `json:"name,omitempty"`
				// call function with arguments in JSON format
				Arguments any `json:"arguments,omitempty"`
			}
			if i := strings.Index(toolcallString, "{"); i > 0 {
				toolcallString = toolcallString[i:]
			}
			if i := strings.LastIndex(toolcallString, "}"); i > 0 && i < len(toolcallString)-1 {
				toolcallString = toolcallString[:i+1]
			}
			tool := FunctionCall{Arguments: map[string]any{}}
			toolcall := openai.ToolCall{Type: "function", Function: openai.FunctionCall{}}
			//openai.FunctionCall 中的Arguments是string类型.直接unmrshal 会报错
			if err := json.Unmarshal([]byte(toolcallString), &tool); err == nil && tool.Name != "" && tool.Arguments != nil {
				argument, _ := json.Marshal(tool.Arguments)
				toolcall.Function.Name, toolcall.Function.Arguments = tool.Name, string(argument)
				toolCalls = append(toolCalls, toolcall)
			}
		}
	}

	for _, toolcall := range toolCalls {

		tool, ok := ToolMap[toolcall.Function.Name]
		if !ok {
			return fmt.Errorf("error: function not found in FunctionMap")
		}
		tool.HandleFunctionCall(toolcall.Function.Arguments)
	}

	return nil
}
