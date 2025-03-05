package main

import (
	"strings"

	"github.com/doptime/eloevo/agents"
	"github.com/doptime/eloevo/evotests"
	"github.com/doptime/eloevo/projects"
)

type TestStruct struct {
	Name string `case:"lower" trim:"left"`
	Age  int    `min:"18" max:"60"`
}

func main() {
	//agents.AgentFunctioncallTest.WithModel(models.FuseO1).Call(context.Background(), map[string]any{})
	//go memory.AutoSaveSharedMemory()
	//argsString := strings.Join(os.Args, " ")
	argsString := "RationalCognitionFrameworkExploration"

	if strings.Contains(argsString, "GenBusinessPlanParallel") {
		projects.GenBusinessPlanParallel()
	} else if strings.Contains(argsString, "AntiAgingExploration") {
		evotests.AntiAgingExploration()
		return
	} else if strings.Contains(argsString, "RationalCognitionFrameworkExploration") {
		projects.RationalCognitionFrameworkExploration()
		return
	} else if strings.Contains(argsString, "clustering") {
		agents.Clustering()
		return
	} else if strings.Contains(argsString, "GenTestSenarioParallel") {
		//agents.GenRequirementParallel()
		evotests.GeTestSenarioParallel()
		return
	} else if strings.Contains(argsString, "GenTestModel") {
		//agents.GenRequirementParallel()
		evotests.GenModelParallel()
		return
	} else if strings.Contains(argsString, "EvoUtilityFunctionExploration") {
		//projects.EvoUtilityFunctionExploration()
		projects.RefineEvaluationSchemas()
		return
	}

}
