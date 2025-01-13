package main

import (
	"context"
	"strings"

	"github.com/doptime/eloevo/agents"
	"github.com/doptime/eloevo/eloevo"
)

type TestStruct struct {
	Name string `case:"lower" trim:"left"`
	Age  int    `min:"18" max:"60"`
}

func main() {
	//go memory.AutoSaveSharedMemory()
	//argsString := strings.Join(os.Args, " ")
	argsString := "GenRequiarallel"
	if strings.Contains(argsString, "niche") {
		agents.GenNicheMarketOpportunityParallel()
	} else if strings.Contains(argsString, "elo") {
		eloevo.PrintEloWinnerTop100()
		eloevo.EloInParallel()
		return
	} else if strings.Contains(argsString, "clustering") {
		agents.Clustering()
		return
	} else if strings.Contains(argsString, "GenRequirementParallel") {
		//agents.GenRequirementParallel()
		agents.GenRequirementParallel()
		return
	}
	agents.AgentFunctioncallTest.Call(context.Background(), map[string]any{})
}
