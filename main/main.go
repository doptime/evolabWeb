package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/doptime/evolab"
	"github.com/doptime/evolab/models"
)

type TestStruct struct {
	Name string `case:"lower" trim:"left"`
	Age  int    `min:"18" max:"60"`
}

func main() {
	//go mem.AutoSaveSharedMemory()
	args := os.Args
	argsString := strings.Join(args, " ")
	if strings.Contains(argsString, "save") {
		evolab.AgentIntentionSaveToFileCall()
	} else if strings.Contains(argsString, "minq") {
		fmt.Println("minq using ModelQwen72BLocal", models.ModelNameQwen72BLocal)
		evolab.GenQWithMinimalFiles()
	} else if strings.Contains(argsString, "q") {
		evolab.AgentIntentionSolve.Call(context.Background(), map[string]any{})
	}

}
