package evolab

import (
	"context"
	"sync"
	"text/template"
	"time"

	"github.com/doptime/evolab/agents"
	"github.com/doptime/evolab/models"
)

var AgentGenNicheMarketOpportunity = agents.NewAgent(template.Must(template.New("question").Parse(`
请作为一位创新思维专家,生成一个在AGI时代可能出现的利基应用领域及其盈利机会.

{{.Now}}

约束条件:

高度随机与多样化:
在生成任务的首段，展开与任务无直接关联的启发性思路.这些思路可以来源于不同的工作角色需求、跨行业的上下游需求、或新兴技术的发展趋势.确保这些思路具有高度随机性和不可预测性，以引导生成多样化的机会.
差异化与独特性:
由于任务将被上百万次地抽样运行，生成的每个机会必须彼此独特，避免重复.可以通过随机组合不同的行业、技术和市场需求来实现.
实现与测试的简易性:
市场机会应以软件产品的形式呈现,且具备微型化特征.若涉及编码,代码量应控制在30K行以内,以确保易于实现和测试.
具体与可操作:
每次仅生成一个具体的市场机会,确保内容详实且具备实际操作性,便于后续的评估和实施.
生成内容需覆盖以下方面:

启发性思路:描述一个与生成任务无直接关联的随机思路或场景,引发新的思考方向.

行业或领域:列出适用的行业或领域.
面向国家:列出适用的国家.
面向地域:列出适用的国家.
面向受众:列出适用的受众(人群/上下游/应用),如果有的话.

技术应用:针对该行业,提出AGI可以应用的具体技术.

NicheMarketOpportunityName:为该市场机会命名.

市场需求:识别该应用领域内未满足的市场需求或痛点,说明AGI如何有效解决这些问题.

创新点:提出AGI应用的独特创新点,突出与现有解决方案的区别.

潜在盈利模式:设计可行的盈利模式,如订阅服务、按使用付费、广告收入等.
   `))).WithModel(models.ModelDeepseek).WithMsgContentToRedisHashField("NicheMarketOpportunity", "NicheMarketOpportunityName")

func GenNicheMarketOpportunity() (err error) {
	var inputsParams = map[string]any{
		"Now": "当前时间" + time.Now().Format("2006-01-02 15:04:05"),
	}
	return AgentGenNicheMarketOpportunity.Call(context.Background(), inputsParams)
}

// GenNicheMarketOpportunityParallel calls GenNicheMarketOpportunity 1000 times in 16 parallel threads.
func GenNicheMarketOpportunityParallel() {
	const numThreads = 4
	const numCallsPerThread = 40

	var wg sync.WaitGroup
	wg.Add(numThreads)

	for i := 0; i < numThreads; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < numCallsPerThread; j++ {
				GenNicheMarketOpportunity()
			}
		}()
	}
	wg.Wait()
}
