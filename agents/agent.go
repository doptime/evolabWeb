package agents

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"text/template"

	"github.com/doptime/evolab/mem"
	"github.com/doptime/evolab/models"
	"github.com/doptime/evolab/utils"
	"github.com/samber/lo"
	openai "github.com/sashabaranov/go-openai"
	"golang.design/x/clipboard"
)

type FileToMem struct {
	File string `json:"file"`
	Mem  string `json:"mem"`
}

// GoalProposer is responsible for proposing goals using an OpenAI model,
// handling function calls, and managing callbacks.
type Agent struct {
	Model                       models.Model
	Prompt                      *template.Template
	Tools                       []openai.Tool
	msgToMemKey                 string
	fileToMem                   *FileToMem
	msgDeFile                   string
	msgToFile                   string
	msgContentToFile            string
	redisKey, reidisFieldPrefix string
	msgDeCliboard               bool
	memDeCliboardKey            string
	functioncallParser          func(resp openai.ChatCompletionResponse) (toolCalls []*FunctionCall)

	toolsInPrompt  bool
	copyPromptOnly bool
	CallBack       func(ctx context.Context, inputs string) error
}

func NewAgent(prompt *template.Template, tools ...openai.Tool) (a *Agent) {
	a = &Agent{
		Model:  models.ModelDefault,
		Prompt: prompt,
		Tools:  tools,
	}
	a.WithToolcallParser(nil)
	return a
}
func (a *Agent) WithFileToMem(filename, memoryKey string) *Agent {
	a.fileToMem = &FileToMem{File: filename, Mem: memoryKey}
	return a
}
func (a *Agent) WithMsgToMem(memoryKey string) *Agent {
	a.msgToMemKey = memoryKey
	return a
}
func (a *Agent) WithMsgDeFile(filename string) *Agent {
	a.msgDeFile = filename
	return a
}
func (a *Agent) WithMsgToFile(filename string) *Agent {
	a.msgToFile = filename
	return a
}
func (a *Agent) WithMsgContentToFile(filename string) *Agent {
	a.msgContentToFile = filename
	return a
}
func (a *Agent) WithMsgContentToRedisHashField(Key, FieldPrefix string) *Agent {
	a.redisKey = Key
	a.reidisFieldPrefix = FieldPrefix
	return a
}
func (a *Agent) WithMsgDeClipboard() *Agent {
	a.msgDeCliboard = true
	return a
}
func (a *Agent) WithMemDeClipboard(memoryKey string) *Agent {
	a.memDeCliboardKey = memoryKey
	return a
}
func (a *Agent) WithToolsInPrompt() *Agent {
	a.toolsInPrompt = true
	return a
}
func (a *Agent) WithModel(Model models.Model) *Agent {
	a.Model = Model
	return a
}

func (a *Agent) WithCallback(callback func(ctx context.Context, inputs string) error) *Agent {
	a.CallBack = callback
	return a
}
func (a *Agent) CopyPromptOnly() *Agent {
	a.copyPromptOnly = true
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
	if a.memDeCliboardKey != "" {
		textbytes := clipboard.Read(clipboard.FmtText)
		if len(textbytes) == 0 {
			fmt.Println("no data in clipboard")
			return nil
		}
		params[a.memDeCliboardKey] = string(textbytes)
	}
	if a.fileToMem != nil {
		resp, err := utils.FileToResponse(a.fileToMem.File)
		if err == nil {
			params[a.fileToMem.Mem] = resp.Choices[0].Message.Content
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
		MaxTokens: 8192,
		Tools:     a.Tools,
	}

	if a.toolsInPrompt && len(a.Tools) > 0 {
		functioncallprompt := `For each function call, return a json object with function name and arguments within <tool_call></tool_call>\n`
		tools, _ := json.Marshal(map[string]any{"functions": lo.Map(a.Tools, func(tool openai.Tool, i int) *openai.FunctionDefinition {
			return tool.Function
		})})
		req.Messages[0].Content = req.Messages[0].Content + "\n" + functioncallprompt + string(tools)
	}

	if a.copyPromptOnly {
		fmt.Println("copy prompt to clipboard", req.Messages[0].Content)
		clipboard.Write(clipboard.FmtText, []byte(req.Messages[0].Content))
		return nil
	}
	resp, err := a.GetResponse(req)
	fmt.Println("resp:", resp)
	if err != nil {
		fmt.Println("Error creating chat completion:", err)
		fmt.Println("req:", req.Messages[0].Content)
		return err
	}
	if a.CallBack != nil {
		a.CallBack(ctx, resp.Choices[0].Message.Content)
	}
	if a.msgToMemKey != "" && len(memories) > 0 {
		memories[0][a.msgToMemKey] = resp.Choices[0].Message.Content
	}

	if a.redisKey != "" && a.reidisFieldPrefix != "" && len(resp.Choices) > 0 {
		field := utils.ExtractTagValue(resp.Choices[0].Message.Content, a.reidisFieldPrefix, false)
		if field != "" {
			saveToRedisHashKey(&SaveToRedisHashKey{Key: a.redisKey, Field: field, Value: resp.Choices[0].Message.Content})
		}
	}

	var toolCalls []*FunctionCall = a.functioncallParser(resp)
	for _, toolcall := range toolCalls {
		tool, ok := ToolMap[toolcall.Name]
		if !ok {
			return fmt.Errorf("error: function not found in FunctionMap")
		}
		tool.HandleFunctionCall(toolcall.Arguments)
	}

	return nil
}
