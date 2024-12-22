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
	Model            models.Model
	Prompt           *template.Template
	Tools            []openai.Tool
	msgToMemKey      string
	fileToMem        *FileToMem
	msgDeFile        string
	msgToFile        string
	msgDeCliboard    bool
	memDeCliboardKey string
	toolsInPrompt    bool
	copyPromptOnly   bool
	CallBack         func(ctx context.Context, inputs string) error
}

func NewAgent(llm models.Model, prompt *template.Template, tools ...openai.Tool) *Agent {
	return &Agent{
		Model:  llm,
		Prompt: prompt,
		Tools:  tools,
	}
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
		Tools: a.Tools,
	}

	if a.toolsInPrompt && len(a.Tools) > 0 {
		tools, _ := json.Marshal(map[string]any{"functions": lo.Map(a.Tools, func(tool openai.Tool, i int) *openai.FunctionDefinition {
			return tool.Function
		})})
		req.Messages[0].Content = req.Messages[0].Content + "\n" + string(tools)
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
	// Process each choice in the response
	type FunctionCall struct {
		Name string `json:"name,omitempty"`
		// call function with arguments in JSON format
		Arguments any `json:"arguments,omitempty"`
	}
	var toolCalls []*FunctionCall
	for _, choice := range resp.Choices {
		for _, toolcall := range choice.Message.ToolCalls {
			functioncall := &FunctionCall{
				Name:      toolcall.Function.Name,
				Arguments: toolcall.Function.Arguments,
			}
			toolCalls = append(toolCalls, functioncall)
		}
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
			if i := strings.Index(toolcallString, "{"); i > 0 {
				toolcallString = toolcallString[i:]
			}
			if i := strings.LastIndex(toolcallString, "}"); i > 0 && i < len(toolcallString)-1 {
				toolcallString = toolcallString[:i+1]
			}
			tool := FunctionCall{Name: "", Arguments: map[string]any{}}
			//openai.FunctionCall 中的Arguments是string类型.直接unmrshal 会报错
			err := json.Unmarshal([]byte(toolcallString), &tool)
			if err == nil && tool.Name != "" && tool.Arguments != nil {
				toolCalls = append(toolCalls, &tool)
			}
		}
	}

	for _, toolcall := range toolCalls {
		tool, ok := ToolMap[toolcall.Name]
		if !ok {
			return fmt.Errorf("error: function not found in FunctionMap")
		}
		tool.HandleFunctionCall(toolcall.Arguments)
	}

	return nil
}
