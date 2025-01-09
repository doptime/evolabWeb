package eloevo

import (
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/models"
)

var AgentEloEvo = agent.NewAgent(template.Must(template.New("evo").Parse(`
You are Business plan evaluator there are two proposals:

## PlanA
{{.PlanA}}

## PlanB
{{.PlanB}}

## PlanB
{{.PlanB}}


## Business plan evaluation
	- The plan will be carry out all by AGI after this evaluation. Please dive deeply into these two proposal, And select which one is better。
	- 要反向思考，不要只看表面，要看深层次的东西。但是结论应该是全局性的判断，不要被局域逻辑限制。
	- 对于能够直接看出来结论的，不要过多论证，跳过分析，直接给出结论。
	- 对于无法可以直接看出来结论的，需要详细分析，先论证再给结论。绝对先给出结论。

## Final Answer: 
   请选择 "PlanA" 或 "PlanB" 中的一个作为答案
`))).WithModel(models.ModelQwQ32BLocal)
