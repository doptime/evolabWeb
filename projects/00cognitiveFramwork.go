package projects

import (
	"context"
	"fmt"
	"slices"
	"sync"
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/elo"
	"github.com/doptime/eloevo/mixincached"
	"github.com/doptime/eloevo/models"
	"github.com/doptime/eloevo/tool"
	"github.com/doptime/redisdb"
	"github.com/samber/lo"
)

// UtilityFunction = exp(WeightMarketSizeln(MarketSize) + 0.18ln(MarketGrowthRate) + 0.22ln(ExpectedReturn) + 0.10ln(TechnicalFeasibility) + 0.15ln(InnovationPotential) + 0.080ln(ResourceAllocation) - 0.12ln(ProjectRisk + 1) - 0.080ln(CompetitionIntensity) - 0.10ln(ImplementationDifficulty) + 0.060ln(TimeToMarket) + 0.040ln(TeamExperience) + 0.050ln(PolicySupport))
type RationalCognitiveFramework struct {
	Id    string
	Items map[string]string
}

func (u *RationalCognitiveFramework) GetId() string {
	return u.Id
}
func (u *RationalCognitiveFramework) Elo(delta ...int) int {
	var eloDelta int = append(delta, 0)[0]
	return mixincached.WithElo("projects", "RationalCognitiveFramework", 1000).Elo(u.Id, float64(eloDelta))
}

var RationalCognitionFrameworkDefault = &RationalCognitiveFramework{
	Id: "default",
	Items: map[string]string{
		"效用函数": "用于评估项目的效用函数，完成理论认知范式",
		"相关要素": "考虑问题时候，需要引入的用来定义问题的要素",
		"实际局限": "在执行的时候会遇到的局限，这是从前往后的，具有行动导向的认知范式",
		"理论局限": "在执行的时候会遇到的局限，这是从后往前的，第一性原理认知范式",
		"改进方案": "提出一个新的认知范式，用于替代现有的认知范式",
	},
}

type ItemsSorted struct {
	ItemsRefById []string `description:"Items sorted. Referenced by Items Id"`
}

var keyRationalCognitionFramework = redisdb.HashKey[string, *RationalCognitiveFramework](redisdb.WithRds("projects"))

var AgentUtilityFrameGen = agent.NewAgent(template.Must(template.New("utilifyFunction").Parse(`
现在我们要演进理性认知的一般范式。
这里我们有一些期望：
1. 如果一个认知范式需要进一步深入讨论一些课题。那么这个范式应该允许显性的引入这些课题，并使得这些课题在后续的迭代当中，被逐渐深入地讨论。
2. 有时候，有些主题包含一些特殊的要素，比如ToDoList,或Agenda . 那么在目标范式结构中，应当允许当主题更加明确之后，这些要素已经被当前认知范式的所允许，或者说动态补充，尽管这些要素在现在的一般范式当中并未展开。

这是现有的若干理性认知的一般范式 ：
{{range  $index, $item := .RationalCognitionFrameworks}}
第{{$index}}个认知范式：
	Id:{{$item.Id}}
	Items:
	{{range $key, $value := $item.Items}}
		{{$key}}:{{$value}}
	{{end}}

{{end}}



ToDoList:
1. 现在请你仔细讨论这些方案，识别出现有的认知范式的优势和缺陷. 将他们从最好到最坏排序(用Id列表表示)。
2. 在继承现有方案的优势基础上，尝试提出一个更好的，新的理性认知范式。请充分利用Item 是一个Map,可以容纳无限的描述和无限层级的描述，来使得结构最可演进。
3. 调用FunctionCall:SaveItemsSorted 保存排序结果。
4. 调用FunctionCall:RationalCognitiveFramework 保存新的方案。
`))).WithToolCallLocked().WithTools(tool.NewTool("SaveItemsSorted", "Save sorted Items, Items represented as Id list.", func(model *ItemsSorted) {
	if model == nil || len(model.ItemsRefById) == 0 {
		return
	}
	all, _ := keyRationalCognitionFramework.HGetAll()
	var values []elo.Elo
	for _, v := range all {
		if slices.Contains(model.ItemsRefById, v.Id) {
			values = append(values, v)
		}
	}
	elo.BatchUpdateRanking(values...)
	if len(all) > 16 {
		//remove the worst 10% of the projects
		playersOrderByElo := lo.Keys(all)
		//sort the players by elo
		slices.SortFunc(playersOrderByElo, func(i, j string) int {
			return all[i].Elo() - all[j].Elo()
		})

		//remove the worst 2
		mapToRemove := lo.SliceToMap(playersOrderByElo[:2], func(v string) (string, *RationalCognitiveFramework) { return v, all[v] })
		keyRationalCognitionFramework.ConcatKey("Expired").HMSet(mapToRemove)
		keyRationalCognitionFramework.HDel(playersOrderByElo[:2]...)

		slices.Reverse(playersOrderByElo)
		for i, v := range playersOrderByElo[0:min(10, len(playersOrderByElo))] {
			fmt.Println("Best Model,top ", i+1, v, "Elo", all[v].Elo())
		}
	}

})).WithTools(tool.NewTool("RationalCognitiveFramework", "Extract RationalCognitiveFramework struct from previous response", func(model *RationalCognitiveFramework) {
	if len(model.Items) == 0 {
		return
	}
	model.Id = redisdb.NanoId(8)
	keyRationalCognitionFramework.HSet(model.Id, model)

}))

func RationalCognitionFrameworkExploration() {
	const numThreads = 1
	const numCallsPerThread = 1000 * 1000 / numThreads

	keyRationalCognitionFramework.HSet(RationalCognitionFrameworkDefault.Id, RationalCognitionFrameworkDefault)
	var wg sync.WaitGroup
	wg.Add(numThreads)

	for i := 0; i < numThreads; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < numCallsPerThread; j++ {
				best, _ := keyRationalCognitionFramework.HGetAll()
				values := lo.Values(best)[:min(6, len(best))]
				param := map[string]any{"RationalCognitionFrameworks": lo.Shuffle(values)}
				err := AgentUtilityFrameGen.WithModel(models.ModelDeepSeekR132B).Call(context.Background(), param)
				if err != nil {
					fmt.Printf("Agent call failed: %v\n", err)
				}
			}
		}()
	}
	wg.Wait()
}
