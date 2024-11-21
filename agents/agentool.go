package agents

import (
	"bytes"
	"context"
	"fmt"
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
	if err != nil {
		fmt.Println("Error creating chat completion:", err)
		return err
	}
	// Process each choice in the response
	for _, choice := range resp.Choices {
		for _, toolcall := range choice.Message.ToolCalls {
			HandleSingleFunctionCall(toolcall.Function.Name, toolcall.Function.Arguments)
		}
	}

	return nil
}
