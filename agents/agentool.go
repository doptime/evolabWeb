package agents

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"text/template"

	"github.com/doptime/evolab/models"
	openai "github.com/sashabaranov/go-openai"
)

var SharedMemory = map[string]any{}
var SharedMemorySaveTM = map[string]int64{}

// GoalProposer is responsible for proposing goals using an OpenAI model,
// handling function calls, and managing callbacks.
type Agentool struct {
	Model    models.Model
	Prompt   *template.Template
	Tools    []openai.Tool
	CallBack func(ctx context.Context, inputs string) error
}

func NewAgent(llm models.Model, prompt *template.Template, tools ...openai.Tool) *Agentool {
	return &Agentool{
		Model:  llm,
		Prompt: prompt,
		Tools:  tools,
	}
}

// ProposeGoals generates goals based on the provided file contents.
// It renders the prompt, sends a request to the OpenAI model, and processes the response.
func (a *Agentool) Call(ctx context.Context, memories ...map[string]any) error {
	// Render the prompt with the provided files content and available functions
	var params = map[string]any{}
	for k, v := range SharedMemory {
		params[k] = v
	}
	for _, memory := range memories {
		for k, v := range memory {
			params[k] = v
		}
	}
	// var ToolChoices = []openai.ToolChoice{}
	// for _, tool := range a.Tools {
	// 	ToolChoices = append(ToolChoices, openai.ToolChoice{
	// 		Type:     "function",
	// 		Function: openai.ToolFunction{Name: tool.Function.Name},
	// 	})
	// }
	// ToolChoice: ToolChoices,

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
	// Process each choice in the response
	var toolCalls []openai.ToolCall
	for _, choice := range resp.Choices {
		toolCalls = append(toolCalls, choice.Message.ToolCalls...)
	}
	if len(toolCalls) == 0 && len(resp.Choices) > 0 {
		rsp := resp.Choices[0].Message.Content
		items := strings.Split(rsp, "<tool_call>")
		for i := 1; i < len(items)-1; i++ {
			toolcallString := items[i]
			type FunctionCall struct {
				Name string `json:"name,omitempty"`
				// call function with arguments in JSON format
				Arguments map[string]any `json:"arguments,omitempty"`
			}
			tool := FunctionCall{Arguments: map[string]any{}}
			toolcall := openai.ToolCall{Function: openai.FunctionCall{}}
			err := json.Unmarshal([]byte(toolcallString), &tool)
			if err == nil {
				argument, _ := json.Marshal(tool.Arguments)
				toolcall.Type, toolcall.Function.Name, toolcall.Function.Arguments = "function", tool.Name, string(argument)
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
