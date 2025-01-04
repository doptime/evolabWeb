package main

import (
	"context"
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
	//argsString := strings.Join(os.Args, " ")
	argsString := "niche"
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
		//evolab.GenNicheMarketOpportunity()
		evolab.GenNicheMarketOpportunityParallel()

	}

}
