package agents

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"text/template"

	"github.com/doptime/evolab/models"
	openai "github.com/sashabaranov/go-openai"
)

// GoalProposer is responsible for proposing goals using an OpenAI model,
// handling function calls, and managing callbacks.
type Agentool[v any] struct {
	Name        string
	Description string
	Model       models.Model
	Prompt      *template.Template
	Tools       []openai.Tool
	CallBack    func(ctx context.Context, inputs string) error
}

func NewAgentool[v any](Name string, Description string, llm models.Model, prompt *template.Template) *Agentool[v] {
	tool := NewTool[v](Name, Description, func(param v) (interface{}, error) {
		return nil, nil
	})
	return &Agentool[v]{
		Name:        Name,
		Description: Description,
		Model:       llm,
		Prompt:      prompt,
		Tools:       []openai.Tool{tool.Tool},
	}
}

// ProposeGoals generates goals based on the provided file contents.
// It renders the prompt, sends a request to the OpenAI model, and processes the response.
func (a *Agentool[v]) Call(ctx context.Context, param map[string]any) error {
	// Render the prompt with the provided files content and available functions
	var params = map[string]any{}
	for k, v := range param {
		params[k] = v
	}
	for k, v := range SharedMemory {
		params[k] = v
	}

	var promptBuffer bytes.Buffer
	if err := a.Prompt.Execute(&promptBuffer, params); err != nil {
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
		Tools:        a.Tools,
		FunctionCall: "auto", // Let the model decide which function to call
	}

	// Send the request to the OpenAI API
	resp, err := a.Model.Client.CreateChatCompletion(ctx, req)
	if err != nil {
		return err
	}

	// Process each choice in the response
	for _, choice := range resp.Choices {
		if choice.Message.FunctionCall != nil {

			// Handle function call
			functionName := choice.Message.FunctionCall.Name
			arguments := choice.Message.FunctionCall.Arguments

			// Parse arguments JSON
			var args map[string]interface{}
			if err := json.Unmarshal([]byte(arguments), &args); err != nil {
				log.Printf("Error parsing arguments for function %s: %v", functionName, err)
				continue
			}
			ret, err := HandleSingleFunctionCall(functionName, args)
			if err == nil {
				SharedMemory[functionName] = ret
			}
			return err

		} else {
			// Handle regular message from the model
			log.Printf("LLM Response: %s", choice.Message.Content)
		}
	}

	return nil
}
