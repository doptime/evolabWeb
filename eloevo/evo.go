package eloevo

import (
	"context"
	"fmt"
	"io"
	"os"
	"slices"
	"strings"
	"sync"
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/elo"
	"github.com/doptime/eloevo/models"
	"github.com/doptime/redisdb"
	"github.com/samber/lo"
	"golang.design/x/clipboard"
)

var AgentElo = agent.NewAgent(template.Must(template.New("evo").Parse(`
You are Business plan evaluator there are two proposals:

## PlanA
{{.PlanA}}

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

var keyProjects1 = redisdb.HashKey[string, string](redisdb.WithKey("NicheMarketOpportunity"))
var keyProjects2 = redisdb.HashKey[string, string](redisdb.WithKey("NicheMarketOpportunityQwen25-72B"))
var keyProjectsAll = redisdb.HashKey[string, string](redisdb.WithKey("NicheMarketOpportunityAll"))

var keyElos = redisdb.HashKey[string, *elo.Elo](redisdb.WithKey("Elos"))

var keyEloMatch = redisdb.HashKey[string, string](redisdb.WithKey("EloMatches"))

func MergeOppotunities() {

	var OptunityDescription map[string]string = make(map[string]string)
	OptunityDescription1, _ := keyProjects1.HGetAll()
	OptunityDescription2, _ := keyProjects2.HGetAll()
	for k, v := range OptunityDescription1 {
		OptunityDescription[k] = v
	}
	for k, v := range OptunityDescription2 {
		OptunityDescription[k] = v
	}
	keyProjectsAll.HMSet(OptunityDescription)
}

var OptunityDescription map[string]string
var Elos map[string]*elo.Elo

func LoadEvoTable() {
	var keyProjectsAll = redisdb.HashKey[string, string](redisdb.WithKey("NicheMarketOpportunityAll"))
	OptunityDescription, _ = keyProjectsAll.HGetAll()
	Elos, _ = keyElos.HGetAll()
	for k := range OptunityDescription {
		if _, ok := Elos[k]; !ok {
			Elos[k] = &elo.Elo{Id: k, Rating: 1000, Matches: nil}
		}
	}
	keyElos.HMSet(Elos)
}
func init() {
	LoadEvoTable()
}

func EvoMatch() {
	playerA, playerB := elo.Sampling(lo.Values(Elos))
	model := models.EloModels.SelectOne("roundrobin")
	AgentElo.WithModel(model).WithCallback(func(ctx context.Context, inputs string) error {
		matchId := redisdb.NanoId(8)
		inda, indb := strings.LastIndex(inputs, "PlanA"), strings.LastIndex(inputs, "PlanB")
		if inda < 0 {
			inda = strings.Index(inputs, "Plan A")
		}
		if indb < 0 {
			indb = strings.Index(inputs, "Plan B")
		}
		if inda < 0 || indb < 0 {
			return nil
		}
		keyEloMatch.HSet(matchId, inputs)
		AWin := inda > indb
		if AWin {
			elo.UpdateRatings(playerA, playerB, matchId, 1)
		} else {
			elo.UpdateRatings(playerA, playerB, matchId, 0)
		}
		keyElos.HSet(playerA.Id, playerA)
		keyElos.HSet(playerB.Id, playerB)
		return nil

	}).Call(context.Background(), map[string]any{
		"PlanA": OptunityDescription[playerA.Id],
		"PlanB": OptunityDescription[playerB.Id],
	})

}
func PrintEloWinnerTop100() {
	ElosSlices := lo.Values(Elos)
	//sort by rating
	slices.SortFunc(ElosSlices, func(a, b *elo.Elo) int {
		return (a.Rating - b.Rating)
	})
	slices.Reverse(ElosSlices)
	var sb strings.Builder
	for i, player := range ElosSlices {
		sb.WriteString(fmt.Sprintf("%d. %s %d\n%s", i+1, player.Id, player.Rating, OptunityDescription[player.Id]))
	}
	//copy to cliboard
	clipboard.Write(clipboard.FmtText, []byte(sb.String()))
	fileOut := "EloWinnerSorted.md"
	writer, _ := os.Create(fileOut)
	io.WriteString(writer, sb.String())

}

func EloInParallel() {
	const numThreads = 32
	//const numThreads = 3
	const numCallsPerThread = 4000

	var wg sync.WaitGroup
	wg.Add(numThreads)

	for i := 0; i < numThreads; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < numCallsPerThread; j++ {
				EvoMatch()
			}
		}()
	}
	wg.Wait()
}
