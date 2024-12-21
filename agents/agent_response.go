package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	openai "github.com/sashabaranov/go-openai"
	"golang.design/x/clipboard"
)

func (a *Agent) GetResponse(req openai.ChatCompletionRequest) (resp openai.ChatCompletionResponse, err error) {

	// Send the request to the OpenAI API
	if a.msgDeFile != "" {
		filename := getLocalFileName(a.msgDeFile)
		data, err := os.ReadFile(filename)
		if err != nil {
			fmt.Println("Error reading file:", err)
		}
		err = json.Unmarshal(data, &resp)
		return resp, err
	}
	if a.msgDeCliboard {
		textbytes := clipboard.Read(clipboard.FmtText)
		if len(textbytes) == 0 {
			return resp, fmt.Errorf("no data in clipboard")
		}
		msg := openai.ChatCompletionMessage{
			Role:    "assistant",
			Content: string(textbytes),
		}
		resp = openai.ChatCompletionResponse{
			Choices: []openai.ChatCompletionChoice{
				{
					Message: msg,
				},
			},
		}
		return resp, nil
	}
	ctx := context.Background()
	//not load from file yet, then send request to openai
	if len(req.Messages) > 0 {
		resp, err = a.Model.Client.CreateChatCompletion(ctx, req)
	}

	if a.msgDeFile != "" && len(resp.Choices) > 0 {
		msgpackbytes, err := json.Marshal(resp.Choices[0])
		if err == nil {
			saveToFile(&SaveToFile{Filename: a.msgDeFile, Content: string(msgpackbytes)})
		}
	}
	return resp, err
}
