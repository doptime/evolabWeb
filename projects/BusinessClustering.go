package projects

import (
	"context"
	"fmt"
	"math/big"
	"slices"
	"text/template"

	"github.com/cespare/xxhash/v2"
	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/elo"
	"github.com/doptime/eloevo/models"
	"github.com/doptime/eloevo/prototype"
	"github.com/doptime/eloevo/tool"
	"github.com/doptime/redisdb"
	"github.com/samber/lo"
)

// {"Id":"H3URX2jY","BusinessClusters":{"AI-Driven Public Policy Analysis":2500,"AI-Driven Fashion & Wearable Tech":5200,"AI in Public Services & Governance":2500,"Advanced Materials & Nanotechnology":24000,"Virtual & Digital Asset Management":15200,"AI-Driven Customer Experience":6200,"AI-Driven Agricultural & Farm Management":16100,"AI in Waste Management & Circular Economy":45000,"Green Energy & Renewable Tech":124000,"AI-Driven Tourism & Hospitality":5500,"AI-Driven Automotive & Mobility Solutions":6800,"AI in Disaster Management & Safety":2500,"AI-Driven Supply Chain & Inventory Optimization":7500,"AI-Driven Urban Planning & Development":5000,"AI in Climate & Environmental Science":124000,"AI in Energy & Utilities":124000,"AI-Driven Analytics & Big Data":22500,"AI-Driven Real Estate & Architecture":9100,"AI-Driven Fraud Detection & Compliance":7300,"AI Core Technologies":45000,"AI in Agriculture & Food Tech":16100,"Extended Reality (XR) & Virtual Worlds":9800,"Health Informatics & Telemedicine":41000,"AI in Legal & Compliance":11100,"AI in Telecommunications & Networks":9900,"Digital Payment Systems & Fintech":89000,"AI-Driven Cultural & Heritage Preservation":3600,"AI in Media & Entertainment":2000,"Smart Manufacturing & Industry 4.0":34000,"Space Commerce & Satellite Tech":10500,"AI-Driven Risk Management & Insurance":4800,"AI-Driven Legal Document Analysis":7900,"AI-Driven Journalism & Media Analysis":3200,"AI in Manufacturing & Industry 4.0":34000,"AI in Marketing & Advertising":6200,"AI in Blockchain & Digital Assets":94100,"Neural Interfaces & Bioelectronics":9300,"Smart Home & IoT Solutions":5800,"AI in Education & EdTech":21000,"AI-Driven Personalized Learning":21000,"AI-Driven Sports & Fitness Tech":5200,"AI-Driven Public Safety & Defense Systems":2500,"AI in Water & Environmental Tech":6500,"AI-Driven Mining & Resources":9200,"AI-Driven Disaster Response Systems":2500,"AI-Driven Security & Surveillance Systems":2500,"AI in Transportation & Logistics":15000,"Drone & Autonomous Systems":38000,"Smart Agriculture & Farming Tech":16500,"Smart Transportation & Urban Mobility":13300,"AI-Driven Media & Content Creation":3200,"Quantum Computing & Sensing":10000,"Smart Energy & Grid Management":9900,"Synthetic Biology & Bioengineering":6700,"AI-Driven Public Infrastructure Management":8900,"AI in Retail & E-commerce":15000,"AI in Cultural Preservation & Heritage":3600,"AI in Robotics & Automation":42000,"Hydrogen & Clean Energy Solutions":34200,"AI-Driven Telecom & Network Optimization":9900,"AI-Driven Customer Support & Chatbots":5800,"AI in Healthcare & Biotech":45000,"AI in Smart Cities & Urban Tech":27500,"Cybersecurity Infrastructure & Quantum Security":38000,"AI-Driven Virtual Asset Trading":15200,"AI-Driven Climate & Environmental Modeling":7200,"AI in Finance & Banking":22500,"AI in Cybersecurity & Digital Defense":38000,"Biotech & Medical Innovations":54000,"AI-Driven Emergency Response":2500,"AI-Driven Energy Efficiency Solutions":9500}}
type BusinessClusterItem struct {
	Id     string  `description:"Id, string, unique"`
	Score  float64 `msgpack:"Elo" description:"-"`
	Market int64   `description:"Market, integer, Market size in million dollars"`
	Item   string  `description:"Item,string" msgpack:"ClusterDescription"`
}

func (u *BusinessClusterItem) GetId() string {
	return u.Id
}
func (u *BusinessClusterItem) Quantile(delta ...float64) float64 {
	if eloDelta := append(delta, 0)[0]; eloDelta != 0 {
		u.Score += 0.2 * eloDelta
		keyBusinessClustering.HSet(u.Id, u)
	}
	return u.Score
}

var keyBusinessClustering = redisdb.HashKey[string, *BusinessClusterItem](redisdb.WithRds("projects"), redisdb.WithKey("BusinessClusteringByItem"))

// 为什么Qwen能自我改进推理，Llama却不行 https://mp.weixin.qq.com/s/OvS61OrDp6rB-R5ELg48Aw
// 并且每次就一个确切的改进方向进行深度分析，反代的深度分析第一性原理之上的需求，深度创新以做出实质的改进。要痛恨泛泛而谈的内容，重复空洞的内容，因为现在是在开发世界级的工具。
var AgentBusinessClustering = agent.NewAgent(template.Must(template.New("utilifyFunction").Parse(`
现在我们要对世界上的商业活动进行分类 (创建商业活动的类目)（注意，不是创建具体的商业项目）。

要关注类目的分布的覆盖性,能够覆盖世界上绝大多数的商业活动，并且按照重要性排序。

我们的最终目标是寻找在AI时代具有长期市场重要性的商业活动类目。

这是现有的商业活分类方案 ：
{{range  $index, $item := .ItemList}}
"Id":"{{$item.Id}}"
"Item":"{{$item.Item}}"
{{end}}

ToDo:
步骤1. 对现有的选项进行思考和评估：
	1、对回溯或在检测到错误进行显式修改；
	2、验证或系统地检查中间结果；
	3、子目标设定，即将复杂问题分解为可管理的步骤
	4、逆向思考，即在目标导向的推理问题中，从期望的结果出发，逐步向后推导，找到解决问题的路径。

{{if gt .TotoalNodes 90}}
步骤2. 根据上面的讨论. 将现有方案Item排序。
	- 选出必须淘汰的方案条目，比如冗余，劣质，条目，形成淘汰列表ItemsShouldRemoveFromSolutionSorted，按淘汰优先级别列出。
	- 选出好的方案条目，形成解决方案列表ItemsShouldKeptInSolutionSorted，按保留优先级列出。
最后调用FunctionCall:SolutionRefine 保存排序结果。
{{else}}
步骤2. 在讨论的基础上，进一步提出一个更好的Item。
整个提出的过程采用测度论作为基础。我们先按照补全直觉，提出一个假想的需要场景，看看是否能够在在条目中找到相应的类别条目。从而对现有的分类进行改进或新增。
对Item同样按步骤1改进后，调用FunctionCall:NewBusinessClusterItem 保存新的方案。
{{end}}

`))).WithToolCallLocked().WithTools(tool.NewTool("SolutionRefine", "Save sorted Items, Items represented as Id list.", func(model *prototype.SolutionRefine) {
	if model == nil || len(model.ItemsShouldKeptInSolutionSorted) == 0 {
		return
	}
	all, _ := keyBusinessClustering.HGetAll()
	sortedElos := elo.ToQuantileSlice(all).Sort()
	p1 := sortedElos.TakeByIds(model.ItemsShouldKeptInSolutionSorted...)
	slices.Reverse(model.ItemsShouldRemoveFromSolutionSorted)
	p3 := sortedElos.TakeByIds(model.ItemsShouldRemoveFromSolutionSorted...)
	p2, _ := lo.Difference(sortedElos, p1)
	p2, _ = lo.Difference(p2, p3)
	list := lo.Uniq(append(append(p1, p2...), p3...))

	elo.UpdateQuantile(list...)

})).WithTools(tool.NewTool("NewBusinessClusterItem", "create a new NewBusinessCluster Item", func(model *BusinessClusterItem) {
	model.Id = big.NewInt(int64(xxhash.Sum64String(model.Item))).Text(62)[:6]
	model.Score = 1 - 0.15
	keyBusinessClustering.HSet(model.Id, model)
}))

func BusinessClusteringExploration() {
	// var businessCluster = map[string]uint{
	// 	"AI-Driven Public Policy Analysis":                2500,
	// 	"AI-Driven Fashion & Wearable Tech":               5200,
	// 	"AI in Public Services & Governance":              2500,
	// 	"Advanced Materials & Nanotechnology":             24000,
	// 	"Virtual & Digital Asset Management":              15200,
	// 	"AI-Driven Customer Experience":                   6200,
	// 	"AI-Driven Agricultural & Farm Management":        16100,
	// 	"AI in Waste Management & Circular Economy":       45000,
	// 	"Green Energy & Renewable Tech":                   124000,
	// 	"AI-Driven Tourism & Hospitality":                 5500,
	// 	"AI-Driven Automotive & Mobility Solutions":       6800,
	// 	"AI in Disaster Management & Safety":              2500,
	// 	"AI-Driven Supply Chain & Inventory Optimization": 7500,
	// 	"AI-Driven Urban Planning & Development":          5000,
	// 	"AI in Climate & Environmental Science":           124000,
	// 	"AI in Energy & Utilities":                        124000,
	// 	"AI-Driven Analytics & Big Data":                  22500,
	// 	"AI-Driven Real Estate & Architecture":            9100,
	// 	"AI-Driven Fraud Detection & Compliance":          7300,
	// 	"AI Core Technologies":                            45000,
	// 	"AI in Agriculture & Food Tech":                   16100,
	// 	"Extended Reality (XR) & Virtual Worlds":          9800,
	// 	"Health Informatics & Telemedicine":               41000,
	// 	"AI in Legal & Compliance":                        11100,
	// 	"AI in Telecommunications & Networks":             9900,
	// 	"Digital Payment Systems & Fintech":               89000,
	// 	"AI-Driven Cultural & Heritage Preservation":      3600,
	// 	"AI in Media & Entertainment":                     2000,
	// 	"Smart Manufacturing & Industry 4.0":              34000,
	// 	"Space Commerce & Satellite Tech":                 10500,
	// 	"AI-Driven Risk Management & Insurance":           4800,
	// 	"AI-Driven Legal Document Analysis":               7900,
	// 	"AI-Driven Journalism & Media Analysis":           3200,
	// 	"AI in Manufacturing & Industry 4.0":              34000,
	// 	"AI in Marketing & Advertising":                   6200,
	// 	"AI in Blockchain & Digital Assets":               94100,
	// 	"Neural Interfaces & Bioelectronics":              9300,
	// 	"Smart Home & IoT Solutions":                      5800,
	// 	"AI in Education & EdTech":                        21000,
	// 	"AI-Driven Personalized Learning":                 21000,
	// 	"AI-Driven Sports & Fitness Tech":                 5200,
	// 	"AI-Driven Public Safety & Defense Systems":       2500,
	// 	"AI in Water & Environmental Tech":                6500,
	// 	"AI-Driven Mining & Resources":                    9200,
	// 	"AI-Driven Disaster Response Systems":             2500,
	// 	"AI-Driven Security & Surveillance Systems":       2500,
	// 	"AI in Transportation & Logistics":                15000,
	// 	"Drone & Autonomous Systems":                      38000,
	// 	"Smart Agriculture & Farming Tech":                16500,
	// 	"Smart Transportation & Urban Mobility":           13300,
	// 	"AI-Driven Media & Content Creation":              3200,
	// 	"Quantum Computing & Sensing":                     10000,
	// 	"Smart Energy & Grid Management":                  9900,
	// 	"Synthetic Biology & Bioengineering":              6700,
	// 	"AI-Driven Public Infrastructure Management":      8900,
	// 	"AI in Retail & E-commerce":                       15000,
	// 	"AI in Cultural Preservation & Heritage":          3600,
	// 	"AI in Robotics & Automation":                     42000,
	// 	"Hydrogen & Clean Energy Solutions":               34200,
	// 	"AI-Driven Telecom & Network Optimization":        9900,
	// 	"AI-Driven Customer Support & Chatbots":           5800,
	// 	"AI in Healthcare & Biotech":                      45000,
	// 	"AI in Smart Cities & Urban Tech":                 27500,
	// 	"Cybersecurity Infrastructure & Quantum Security": 38000,
	// 	"AI-Driven Virtual Asset Trading":                 15200,
	// 	"AI-Driven Climate & Environmental Modeling":      7200,
	// 	"AI in Finance & Banking":                         22500,
	// 	"AI in Cybersecurity & Digital Defense":           38000,
	// 	"Biotech & Medical Innovations":                   54000,
	// 	"AI-Driven Emergency Response":                    2500,
	// 	"AI-Driven Energy Efficiency Solutions":           9500,
	// }
	// for k, v := range businessCluster {
	// 	idStr := fmt.Sprintf("%x", xxhash.Sum64String(k))
	// 	keyBusinessClustering.HSet(idStr, &BusinessClustering{Id: idStr, Score: 10000, Market: int64(v), ClusterDescription: k})
	// }
	const MaxThreads = 24
	MaxThreadsSemaphore := make(chan struct{}, MaxThreads)

	for i, TotalTasks := 0, 1000*1000; i < TotalTasks; i++ {
		MaxThreadsSemaphore <- struct{}{} // Acquire a spot in the semaphore
		best, _ := keyBusinessClustering.HGetAll()
		listSorted := elo.ToQuantileSlice(lo.Values(best)).Sort()
		//print the lefts
		for i, v := range listSorted {
			fmt.Println("IndustryRank", i+1, v.GetId(), "Quantile1k", int(1000*v.Quantile()), v.(*BusinessClusterItem).Item)
		}

		for _, v := range listSorted {
			fmt.Print(",\"", v.(*BusinessClusterItem).Item, "\"")
		}
		//remove the worst 1
		if worst := listSorted[len(listSorted)-1]; worst.Quantile() > 0.90 {
			keyBusinessClustering.ConcatKey("Expired").HSet(worst.GetId(), worst)
			keyBusinessClustering.HDel(worst.GetId())
			listSorted = listSorted[:len(listSorted)-1]
		}

		param := map[string]any{
			"ItemList": listSorted,
			//[]*models.Model{models.FuseO1, models.DeepSeekR132B}[i%2],
			//"Model":       []*models.Model{models.FuseO1, models.DeepSeekR132B}[i%2],
			"Model":       models.DeepSeekR132B,
			"TotoalNodes": len(best),
		}
		go func(param map[string]any) {
			defer func() { <-MaxThreadsSemaphore }()
			err := AgentBusinessClustering.Call(context.Background(), param)
			if err != nil {
				fmt.Printf("Agent call failed: %v\n", err)
			}
		}(param)
	}
	// Wait for all the goroutines to finish)
	for i := 0; i < MaxThreads; i++ {
		MaxThreadsSemaphore <- struct{}{}
	}

}
