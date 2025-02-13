package main

import (
	"strings"

	"github.com/doptime/eloevo/agents"
	"github.com/doptime/eloevo/elo"
	"github.com/doptime/eloevo/evoloop"
)

type TestStruct struct {
	Name string `case:"lower" trim:"left"`
	Age  int    `min:"18" max:"60"`
}

func main() {
	//agents.AgentFunctioncallTest.WithModel(models.FuseO1).Call(context.Background(), map[string]any{})
	//go memory.AutoSaveSharedMemory()
	//argsString := strings.Join(os.Args, " ")
	argsString := "GenTestSenarioParallel"
	if strings.Contains(argsString, "niche") {
		agents.GenNicheMarketOpportunityParallel()
	} else if strings.Contains(argsString, "elo") {
		elo.PrintEloWinnerTop100()
		elo.EloInParallel()
		return
	} else if strings.Contains(argsString, "clustering") {
		agents.Clustering()
		return
	} else if strings.Contains(argsString, "GenTestSenarioParallel") {
		//agents.GenRequirementParallel()
		evoloop.GeTestSenarioParallel()
		return
	} else if strings.Contains(argsString, "GenTestModel") {
		//agents.GenRequirementParallel()
		evoloop.GenModelParallel()
		return
	}
}
