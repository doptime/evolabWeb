package projects

import (
	"context"
	"fmt"
	"math"
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/elo"
	"github.com/doptime/eloevo/mixincached"
	"github.com/doptime/eloevo/models"
	"github.com/doptime/eloevo/prototype"
	"github.com/doptime/eloevo/tool"
	"github.com/doptime/redisdb"
	"github.com/mroth/weightedrand"
	"github.com/samber/lo"
)

type BusinessPlansGen struct {
	Id               string         `description:"Id, string, unique"`
	BusinessPlans    []string       `description:"BusinessPlans, array, with 16 string elements, each element is a business plan"`
	KeyConsideration string         `description:"KeyConsideration, string, key consideration for this business utility function"`
	Extra            map[string]any `msgpack:"-" json:"-" description:"Extra, call parameter of Agent"`
}

func (u *BusinessPlansGen) GetId() string {
	return u.Id
}
func (u *BusinessPlansGen) Elo(delta ...int) int {
	var eloDelta int = append(delta, 0)[0]
	return mixincached.WithElo("Catalogs", "BusinessPlansGen", 1000).Elo(u.Id, float64(eloDelta))
}

var keyBusinessPlansGen = redisdb.HashKey[string, *BusinessPlansGen](redisdb.WithRds("Catalogs"))

// 为什么Qwen能自我改进推理，Llama却不行 https://mp.weixin.qq.com/s/OvS61OrDp6rB-R5ELg48Aw
// 并且每次就一个确切的改进方向进行深度分析，反代的深度分析第一性原理之上的需求，深度创新以做出实质的改进。要痛恨泛泛而谈的内容，重复空洞的内容，因为现在是在开发世界级的工具。

//这是现在确定的用来评估单个商业项目的商业效用函数 BusinessUtility: "exp(0.35*ln(MarketSize) + 0.30*ln(MarketGrowthRate) + 0.10*ln(ExpectedReturn) + 0.25*ln(TechnicalFeasibility) + 0.20*ln(InnovationPotential) + 0.12*ln(ResourceAllocation) + 0.19*ln(AIAdoptionSynergy) + 0.09*ln(AIAdaptability) + 0.15*ln(DataQuality) + 0.30*ln(EthicalAlignment) + 0.20*ln(SustainabilityImpact) -0.50*ln(ProjectRisk+1) -0.40*ln(CompetitionIntensity) -0.25*ln(ImplementationDifficulty) -0.15*ln(TimeToMarket) +0.25*ln(TeamExperience) +0.23*ln(PolicySupport))"

var AgentBusinessPlansGen = agent.NewAgent(template.Must(template.New("utilifyFunction").Parse(`
你是集 “创业生态架构师”、“技术趋势预言家”、“商业模式创新专家” 三位一体的连续创业家。你将运用动态认知框架，深入分析商业领域 “{{.Topic}}”，旨在生成一个既有战略深度又具备创新活力的创业项目矩阵。

目标是通过 “寻找未被满足的市场需求”、“发现技术创新带来的机会”、“预测未来趋势”等办法，找出商业领域(Industry) "{{.Topic}}"下大约30-60个的创业项目。
预期这些创业项目/BusinessPlans在接下来的世界中，在商业领域"{{.Topic}}"能够产生最大化的联合的商业效用。
最终目的是获得在该领域创业需要的高价值、前瞻性的创业项目矩阵。


这是现有的方案选项 ：
{{range  $index, $item := .ItemList}}
第{{$index}}个方案选项：
Id:{{$item.Id}}
BusinessPlans:{{range $ind, $value := $item.BusinessPlans}}
{{$ind}}:{{$value}}{{end}}
KeyConsideration:{{$item.KeyConsideration}}
{{end}}

待办 (ToDo): 增强流程 (Enhancement Process)
步骤1. 对现有的工作进行思考和评估：
	1、对回溯或在检测到错误进行显式修改（例如，「这种方法行不通，因为...」）；
	2、验证或系统地检查中间结果（例如，「让我们通过... 来验证这个结果」）；
	3、子目标设定，即将复杂问题分解为可管理的步骤（例如，「要解决这个问题，我们首先需要...」）；
	4、逆向思考，即在目标导向的推理问题中，从期望的结果出发，逐步向后推导，找到解决问题的路径。（例如，「要达到 75 的目标，我们需要一个能被... 整除的数字」）。 

{{if gt .TotoalNodes 9}}
步骤2. 根据上面的讨论. 将现有方案选项从最好到最坏排序(用Id列表表示)。调用FunctionCall:SaveItemsSorted 保存排序结果。
{{end}}

{{if lt .TotoalNodes 10}}
步骤2. 在讨论的基础上，进一步提出一个更好的，新的方案草稿。新的方案，先使用Bullet notes 来整合其它方案形成草稿方案。然后对草稿同样按步骤1改进后，调用FunctionCall:NewBusinessPlans 保存新的方案。
{{end}}
`))).WithToolCallLocked().WithTools(tool.NewTool("SaveItemsSorted", "Save sorted Items, Items represented as Id list.", func(model *prototype.ItemsSorted) {

	if model == nil || len(model.ItemsRefById) == 0 {
		return
	}
	key := keyBusinessPlansGen.ConcatKey(model.Extra["Topic"].(string))
	all, _ := key.HGetAll()
	sortedElos := elo.ToSlice(all).Sort().Reverse()
	elo.BatchUpdateRanking(sortedElos.TakeByIds(model.ItemsRefById...)...)

	for _, v := range lo.Filter(sortedElos, func(v elo.Elo, i int) bool { return v.Elo() < 996 }) {
		key.ConcatKey("Expired").HSet(v.GetId(), v)
		key.HDel(v.GetId())
	}
	for i, v := range sortedElos[0:min(10, len(sortedElos))] {
		fmt.Println("Best Model,top ", i+1, v.GetId(), "Elo", v.Elo())
	}
}), tool.NewTool("NewBusinessPlans", "create New BusinessPlans", func(model *BusinessPlansGen) {
	model.Id = redisdb.NanoId(8)
	key := keyBusinessPlansGen.ConcatKey(model.Extra["Topic"].(string))
	key.HSet(model.Id, model)
}))

func BusinessPlansGenExploration() {
	// Create a new weighted chooser
	chooser, _ := weightedrand.NewChooser(lo.MapToSlice(businessCluster, func(item string, weight uint) weightedrand.Choice {
		return weightedrand.Choice{Item: item, Weight: uint(math.Sqrt(float64(weight)))}
	})...)
	const MaxThreads = 1
	MaxThreadsSemaphore := make(chan struct{}, MaxThreads)

	for i, TotalTasks := 0, 1000*1000; i < TotalTasks; i++ {
		MaxThreadsSemaphore <- struct{}{} // Acquire a spot in the semaphore
		go func() {
			industry := chooser.Pick().(string)
			defer func() { <-MaxThreadsSemaphore }()
			key := keyBusinessPlansGen.ConcatKey(industry)
			best, _ := key.HGetAll()
			//put new nodes to the top
			NodesWithPriority := lo.Filter(lo.Values(best), func(v *BusinessPlansGen, i int) bool {
				return v.Elo() > 996 && v.Elo() < 1004
			})
			selected := lo.Union(NodesWithPriority, lo.Values(best))
			lo.Shuffle(selected[len(NodesWithPriority):])
			param := map[string]any{
				"Topic":    industry,
				"ItemList": selected[:min(4, len(selected))],
				//"Model":    models.LoadbalancedPick(models.FuseO1, models.DeepSeekR132B),
				//"Model":    models.LoadbalancedPick(models.FuseO1, models.DolphinR1Mistral24B),
				"Model":       models.Phi4,
				"TotoalNodes": len(best),
			}
			err := AgentBusinessPlansGen.WithModel(models.Qwq32B).Call(context.Background(), param)
			if err != nil {
				fmt.Printf("Agent call failed: %v\n", err)
			}
		}()
	}
	// Wait for all the goroutines to finish)
	for i := 0; i < MaxThreads; i++ {
		MaxThreadsSemaphore <- struct{}{}
	}

}

var IndustryList = []string{"AI in Smart Cities & Urban Tech", "AI-Driven Analytics & Big Data", "AI-Driven Media & Content Creation", "Cybersecurity Infrastructure & Quantum Security", "Virtual & Digital Asset Management", "AI-Driven Real Estate & Architecture", "Advanced Materials & Nanotechnology", "AI in Healthcare & Biotech", "AI in Finance & Banking", "Smart Home & IoT Solutions", "Extended Reality (XR) & Virtual Worlds", "Digital Payment Systems & Fintech", "AI in Waste Management & Circular Economy", "AI in Energy & Utilities", "AI in Media & Entertainment", "AI in Retail & E-commerce", "AI-Driven Agricultural & Farm Management", "AI-Driven Risk Management & Insurance", "AI in Water & Environmental Tech", "Health Informatics & Telemedicine", "AI-Driven Sports & Fitness Tech", "AI-Driven Urban Planning & Development", "AI in Transportation & Logistics", "AI-Driven Public Infrastructure Management", "AI-Driven Virtual Asset Trading", "Space Commerce & Satellite Tech", "AI in Marketing & Advertising", "AI-Driven Telecom & Network Optimization", "AI-Driven Public Safety & Defense Systems", "AI-Driven Supply Chain & Inventory Optimization", "AI in Blockchain & Digital Assets", "AI-Driven Tourism & Hospitality", "Synthetic Biology & Bioengineering", "生物技术与医疗创新", "AI in Disaster Management & Safety", "Drone & Autonomous Systems", "AI in Climate & Environmental Science", "AI-Driven Emergency Response", "AI Core Technologies", "AI-Driven Legal Document Analysis", "AI in Legal & Compliance", "AI-Driven Fashion & Wearable Tech", "AI-Driven Journalism & Media Analysis", "AI in Manufacturing & Industry 4.0", "Smart Manufacturing & Industry 4.0", "Neural Interfaces & Bioelectronics", "Global E-commerce & Digital Marketing", "AI in Cultural Preservation & Heritage", "AI Applications in Commerce", "Green Energy & Renewable Tech", "AI in Robotics & Automation", "AI-Driven Human Resource Management", "AI in Telecommunications & Networks", "Hydrogen & Clean Energy Solutions", "AI-Driven Automotive & Mobility Solutions", "AI-Driven Climate & Environmental Modeling", "人工智能驱动的商业解决方案", "AI in Education", "Blockchain & Decentralized Finance", "Global Commerce & Cross-Border Trade", "Smart Transportation & Urban Mobility", "AI-Driven Customer Support & Chatbots", "AI-Driven Personalized E-commerce Recommendations", "AI-Driven Precision Agriculture", "AI-Driven Agricultural Optimization", "AI-Driven Climate Action & Sustainability Solutions", "AI-Driven Education Management", "AI in Web3 & Decentralized Finance", "AI-Driven Personalized Learning", "AI in Sustainable Development & Green Technology", "AI驱动的社会治理解决方案", "AI-Driven Public Policy Analysis", "AI in Social Media & Network Analysis", "AI-Driven Energy Efficiency Solutions", "Improved Business Activity Classification", "AI in Social Impact & Governance", "AI in Sustainable Urban Development", "AI in Quantum Computing & Advanced Algorithms", "AI在社会影响和公益项目中的应用", "AI-Driven Green Energy Solutions", "AI-Driven Cross-Industry Solutions", "AI在政策制定和公共管理中的应用", "AI-Driven Smart Transportation Systems", "AI在元宇宙中的应用", "AI在农业中的应用", "AI在环境中的应用", "AI在心理健康科技中的应用", "AI在社交网络和数据分析中的应用", "AI在零售中的应用", "AI在制造中的应用", "AI在气候建模与预测", "AI在金融中的应用", "AI-Driven Collaboration Tools", "人力资源服务", "AI-Driven Circular Economy & Waste Management", "AI在 Legal Services", "AI在能源中的应用"}
var businessCluster = map[string]uint{
	"AI-Driven Public Policy Analysis":                2500,
	"AI-Driven Fashion & Wearable Tech":               5200,
	"AI in Public Services & Governance":              2500,
	"Advanced Materials & Nanotechnology":             24000,
	"Virtual & Digital Asset Management":              15200,
	"AI-Driven Customer Experience":                   6200,
	"AI-Driven Agricultural & Farm Management":        16100,
	"AI in Waste Management & Circular Economy":       45000,
	"Green Energy & Renewable Tech":                   124000,
	"AI-Driven Tourism & Hospitality":                 5500,
	"AI-Driven Automotive & Mobility Solutions":       6800,
	"AI in Disaster Management & Safety":              2500,
	"AI-Driven Supply Chain & Inventory Optimization": 7500,
	"AI-Driven Urban Planning & Development":          5000,
	"AI in Climate & Environmental Science":           124000,
	"AI in Energy & Utilities":                        124000,
	"AI-Driven Analytics & Big Data":                  22500,
	"AI-Driven Real Estate & Architecture":            9100,
	"AI-Driven Fraud Detection & Compliance":          7300,
	"AI Core Technologies":                            45000,
	"AI in Agriculture & Food Tech":                   16100,
	"Extended Reality (XR) & Virtual Worlds":          9800,
	"Health Informatics & Telemedicine":               41000,
	"AI in Legal & Compliance":                        11100,
	"AI in Telecommunications & Networks":             9900,
	"Digital Payment Systems & Fintech":               89000,
	"AI-Driven Cultural & Heritage Preservation":      3600,
	"AI in Media & Entertainment":                     2000,
	"Smart Manufacturing & Industry 4.0":              34000,
	"Space Commerce & Satellite Tech":                 10500,
	"AI-Driven Risk Management & Insurance":           4800,
	"AI-Driven Legal Document Analysis":               7900,
	"AI-Driven Journalism & Media Analysis":           3200,
	"AI in Manufacturing & Industry 4.0":              34000,
	"AI in Marketing & Advertising":                   6200,
	"AI in Blockchain & Digital Assets":               94100,
	"Neural Interfaces & Bioelectronics":              9300,
	"Smart Home & IoT Solutions":                      5800,
	"AI in Education & EdTech":                        21000,
	"AI-Driven Personalized Learning":                 21000,
	"AI-Driven Sports & Fitness Tech":                 5200,
	"AI-Driven Public Safety & Defense Systems":       2500,
	"AI in Water & Environmental Tech":                6500,
	"AI-Driven Mining & Resources":                    9200,
	"AI-Driven Disaster Response Systems":             2500,
	"AI-Driven Security & Surveillance Systems":       2500,
	"AI in Transportation & Logistics":                15000,
	"Drone & Autonomous Systems":                      38000,
	"Smart Agriculture & Farming Tech":                16500,
	"Smart Transportation & Urban Mobility":           13300,
	"AI-Driven Media & Content Creation":              3200,
	"Quantum Computing & Sensing":                     10000,
	"Smart Energy & Grid Management":                  9900,
	"Synthetic Biology & Bioengineering":              6700,
	"AI-Driven Public Infrastructure Management":      8900,
	"AI in Retail & E-commerce":                       15000,
	"AI in Cultural Preservation & Heritage":          3600,
	"AI in Robotics & Automation":                     42000,
	"Hydrogen & Clean Energy Solutions":               34200,
	"AI-Driven Telecom & Network Optimization":        9900,
	"AI-Driven Customer Support & Chatbots":           5800,
	"AI in Healthcare & Biotech":                      45000,
	"AI in Smart Cities & Urban Tech":                 27500,
	"Cybersecurity Infrastructure & Quantum Security": 38000,
	"AI-Driven Virtual Asset Trading":                 15200,
	"AI-Driven Climate & Environmental Modeling":      7200,
	"AI in Finance & Banking":                         22500,
	"AI in Cybersecurity & Digital Defense":           38000,
	"Biotech & Medical Innovations":                   54000,
	"AI-Driven Emergency Response":                    2500,
	"AI-Driven Energy Efficiency Solutions":           9500,
}
