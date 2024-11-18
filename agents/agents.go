package agents

import (
	"text/template"

	"github.com/doptime/evolab/models"
)

type GoalResponse struct {
	Goal            string
	HowToAchieve    string
	AssociatedFiles []string
}

var GoalTool = NewTool("GoalSaver", "save the goal proposed", func(rsp *GoalResponse) (interface{}, error) {
	return rsp, nil
})

var goalPrompt = template.New(`You are a goal proposer of a code refactor System.
	你必须严格依照原始的内容来提出目标建议。你提出的目标需要求可以通过明确的，清晰的几个步骤就可以被完成。
You should propose goals to perform refactor, the goal you propose should strictly based on the original content. The goals you propose should be achievable through a few clear modifications to the Original Contents

{{.Files}}.

Analyze goals and how to achieve goals and what are the associated files. Finally, call function "GoalSaver" for each goal to save the goal.

{{.GoalTools}}

To add multiple goals, you can invoke the "GoalSaver" function multiple times as needed.
`)

var GoalProposer = NewAgent("GoalProposer", models.ModelQwen32B, goalPrompt, GoalTool.Tool)

// var GoalSensorPrompt = template.New(`You are a goal sensor. You should sensor the goal {{.goal}}. Then write your sensored opinion to /goalSensorOpinion.
// Analyze & Response goal using the following format:
// Analyze:  ...
// GoalSensorOpinion: ...
// `)
var GoalSencor = NewAgent("GoalProposer", models.ModelQwen32B, goalPrompt,
	NewTool("GoalProposer", "save the goal proposed", func(rsp *GoalResponse) (interface{}, error) {
		return rsp, nil
	}).Tool)

var codeRefactorPrompt = template.New(`You are a code refactoring expert. 
	Analyze the data structure and refactor the code according to {{.goal}}.
	
{{.Contexts}}
	
	Think step by step about:
	1. Code structure and organization
	2. Best practices and patterns
	3. Performance implications
	4. Error handling
	5. Code readability


	
	Analyze & Response goal using the following format:
FilePath: ...
RefactoredCode: ...`)

type codeRefactorResponse struct {
	FilePath       string
	RefactoredCode string
}

var CodeRefactor = NewAgentool[*codeRefactorResponse]("codeRefactored", "refactor code in files", models.ModelQwen32B, codeRefactorPrompt)
