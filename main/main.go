package main

import (
	"context"
	"strings"

	evolab "github.com/doptime/eloevo"
	"github.com/doptime/eloevo/eloevo"
	"github.com/doptime/eloevo/models"
)

type TestStruct struct {
	Name string `case:"lower" trim:"left"`
	Age  int    `min:"18" max:"60"`
}

func main() {
	//go mem.AutoSaveSharedMemory()
	//argsString := strings.Join(os.Args, " ")
	argsString := "elo"
	if strings.Contains(argsString, "modification2f") {
		evolab.AgentModification2File.WithModel(models.ModelQwen32B).
			WithMsgToFile("Beforecommittofile.json").
			WithFileToMem("IntentionSolved.md", "modifications").Call(context.Background(), map[string]any{})
	} else if strings.Contains(argsString, "accomplish") {
		evolab.AgentIntentionAccomplish.WithModel(models.ModelDeepseek).WithMsgContentToFile("accomplishContent.md").
			WithMsgToFile("accomplish.md").Call(context.Background(), map[string]any{})

	} else if strings.Contains(argsString, "goalgen") {
		evolab.AgentIntentionGen.WithModel(models.ModelQwenQvq72BLocal).
			WithMsgToFile("goalgen.json").Call(context.Background(), map[string]any{})
	} else if strings.Contains(argsString, "niche") {
		evolab.GenNicheMarketOpportunityParallel()
	} else if strings.Contains(argsString, "elo") {
		eloevo.PrintEloWinnerTop100()
		eloevo.EloInParallel()
		return
	}
}
