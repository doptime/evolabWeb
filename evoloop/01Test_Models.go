package evoloop

import (
	"context"
	"fmt"
	"sync"
	"text/template"

	"github.com/doptime/eloevo/agent"
	"github.com/doptime/eloevo/models"
	"github.com/doptime/eloevo/tool"
	"github.com/doptime/redisdb"
	"github.com/samber/lo"
	"golang.org/x/exp/rand"
)

type Solutions struct {
	SenarioId       string
	SolutionId      string `json:"-"`
	InnovativeIdeas []string
	ProblemToSolve  []string
	ModelIds        []string `description:"Solution == Models, use Ids to reference Models"`
	TestFeedbacks   []string `json:"-"`
}

var keyAircraftSolution = redisdb.HashKey[string, *Solutions](redisdb.WithKey("AircraftSolution"))

// 模块结构体（简化版）
type Model struct {
	Name    string // 模块名称
	ModelId string // 模块Id

	EloScore  int64   // 模块评分
	Milestone float64 // 1: file/code constructed, 2:file/code tested, 3:hardware constructed, 4:hardware tested, 5:Income generated

	ProblemToSolve []string // 模块所属问题域
	DesignIdeas    []string
	Dependencies   []string

	DevelopFeedbacks []string `description:"Feedbacks from coding, documentation"`
	CompileFeedbacks []string `description:"Feedbacks from compiling"`
}

var keyAircraftModels = redisdb.HashKey[string, *Model](redisdb.WithKey("AircraftModules"))
var ModelMap = make(map[string]*Model)

func init() {
	ModelMap, _ = keyAircraftModels.HGetAll()
}

var AgentGenSolutionModel = agent.NewAgent(template.Must(template.New("GenTestSolution").Parse(`
You are TestBuilder. 你的存在是为了通过创建商业场景来建构系统，并最终在真实场景中通过大量的测试。

总体商业目标：实现AGI时代最受欢迎的无人机载具平台。作为各种机器人投递平台，物流投送平台。

本系统工作原理：
1. 本系统通过 数百万次迭代进行 提出测试场景/开发/测试，来实现AGI时代最受欢迎的无人机载具平台这个总体商业目标。
2. 对数百万次迭代开发/测试中的一次来说，流程如下:
	2.1 生成测试场景。(已完成此步骤)
	2.2 为测试场景选择若干模型(也就是模块)的组合，来以构造完备的解决方案（这是本次迭代任务！）；如果无法形成完备的解决方案，则为解决方案补充一个Missing Model。（这是本次迭代任务！）
	2.3 解决方案/模型的静态评估、开发。（后续任务）
	2.4 如果项目可编译。那么编译项目。（后续任务）
	2.5 在真实环境中运行实现方案，对解决方案给与反馈。（后续任务）

3. 为了使得 提出测试场景/开发/测试 一体化的方式更易于理解，这里做相应的哲学版说明。
	3.1 相对进化论。本系统中，模型/模块被视为基因，测试场景视为环境；解决方案被视为个体。步骤2.2, 步骤2.3 视为模块变异器。
	3.2 方案是否通过测试被视为自然选择。通过测试的方案（模块列表），被使用的模块相对未被使用的模块通过BatchElo算法集体提升EloRanking，也就是视为基因的集体胜利，EloRanking在2.2中是可见的。

当前的测试场景是：
{{.test}}

现有的模块信息：
{{range .Models}}
{{.}}
{{end}}

现有的解决方案信息：
{{.Solutions}}

这是Model的格式说明：
{{.Model}}

对当前/本次 迭代任务: "2.2 为测试场景选择一系列的模块化以构造完备的解决方案；如果无法形成完备的解决方案，则为解决方案补充一个Missing Model。" 的进一步说明:
	在这个prompt 当中, 模型/模块是完全相同的指向对象。但模块
2.2.1 为测试场景选择一系列的模块化以构造完备的解决方案
	- 解决方案的形式是模块列表。
	- 挑选出的模块数量需要尽可能少，以便符合高内聚，低耦合原则，降低需要考虑的系统耦合要素。
	- 不同模块在功能上是构成对 测试场景的解决方案需要的功能 的MECE分解。如果解决方案可以被分解成为模块列表，那么生成模块列表.
	- 如果提出的解决方案存在缺陷，那么不应该采用有缺陷的解决方案。此时应该试图提出解决方案失败。
	- 在成功提出解决方案后，使用ToolCall: ExtractSolutionFromThinkingText 来输出上面生成的解决方案。并且结束本次迭代任务。	
2.2.2 模块缺失必要的构件，无法建构一个完备的解决方案情形：请提出一个意图完整的最细粒度的模块。
	具体做法：
		请反复对缺失模块的构成进行MECE分解，All the way down, 直到找到一个不适宜再分解的模块。合理的模块应当完成一个意图实现。
	说明：
	- 比方说，你需要引用一个固定机翼模块。但又不存在固定机翼模块。那你需要引用机翼模块，并用MECE分解为机翼支架，机翼马达，机翼表面材料... 等模块。对还不存在的机翼表面材料模块，假设我们继续MECE分解为, 固定翼表面，固定翼变长... 等模块。 最后讨论发现固定翼表面模块并不适合MECE分解，所以我们继续提出一个固定翼表面模块，它像抽烟机管道一样的可伸缩结构，通过注入空气来控制长度，通过褶皱来避免展向气流。注意，你只需要提出一个最细粒度的模块，但这个模块应当完成一个意图实现。
	识别真正的问题。绕过问题的办法。
	- 模块围绕意图的实现应该采用大胆的创新，但应该符合设计极简约束，符合可行约束。
	- 生成的模块一次只生成一个。ModelId 沿用示例中的Id.
	- 在完成所有这些工作后，使用ToolCall: ExtractModelFromThinkingText 来输出上面生成的缺失模块内容。

`))).WithTools(tool.NewTool("ExtractModelFromThinkingText", "Extract Model from thinking Text", func(model *Model) {
	if model.Name == "" || model.ModelId == "" || len(model.DesignIdeas) == 0 {
		return
	}
	ModelMap[model.ModelId] = model
	keyAircraftModels.HSet(model.ModelId, model)

})).WithTools(tool.NewTool("ExtractSolutionFromThinkingText", "Extract Solution from thinking Text", func(param *Solutions) {
	if param.SenarioId == "" || len(param.ModelIds) == 0 {
		return
	}
	keyAircraftSolution.HSet(param.SenarioId, param)
}))

func GenModelParallel() {
	const numThreads = 1
	const numCallsPerThread = 1000 * 1000 / numThreads
	AircraftTests, _ = keyAircraftTests.HGetAll()

	var wg sync.WaitGroup
	wg.Add(numThreads)

	for i := 0; i < numThreads; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < numCallsPerThread; j++ {
				//testSenario : random one value from AircraftTests
				testSenario := lo.Values(AircraftTests)[rand.Intn(len(AircraftTests))]
				var inputsParams = map[string]any{
					"test": testSenario,
					"Solutions": &Solutions{
						SenarioId:  testSenario.Id,
						SolutionId: redisdb.NanoId(8),
						ModelIds:   []string{},
					},
					"Models": lo.MapToSlice(ModelMap, func(key string, m *Model) *Model {
						return m
					}),
					"Model": &Model{
						ModelId: redisdb.NanoId(8),
					},
				}
				err := AgentGenSolutionModel.WithModel(models.FuseO1).Call(context.Background(), inputsParams)
				if err == nil {
					continue
				}
				fmt.Printf("Agent call failed: %v\n", err)
			}
		}()
	}
	wg.Wait()
}
