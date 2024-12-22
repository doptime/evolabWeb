package main

import (
	"context"
	"os"
	"strings"

	"github.com/doptime/evolab"
)

type TestStruct struct {
	Name string `case:"lower" trim:"left"`
	Age  int    `min:"18" max:"60"`
}

func main() {
	//go mem.AutoSaveSharedMemory()
	args := os.Args
	argsString := strings.Join(args, " ")
	if strings.Contains(argsString, "2filereq") {
		evolab.AgentSaveToFileRequest.Call(context.Background(), map[string]any{})
	} else if strings.Contains(argsString, "2file") {
		evolab.AgentIntentionSaveUseSourceClipboard.Call(context.Background(), map[string]any{})
	} else if strings.Contains(argsString, "req") {
		evolab.AgentIntentionSolve.Call(context.Background(), map[string]any{})
	} else if strings.Contains(argsString, "2f") || true {
		evolab.AgentModificationSaveToFile.
			//WithMemDeClipboard("modifications")
			WithMsgToFile("doc_modifications.md").Call(context.Background(), map[string]any{})
	}

}
