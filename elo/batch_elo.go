package elo

import (
	"math"

	"github.com/samber/lo"
)

// BatchUpdateRatings 批量更新多个模块的 Elo 评分
// usedModules: 被使用的模块列表
// allModules: 所有模块列表
// matchId: 当前比赛的唯一标识符
func BatchUpdateRatings(usedModules []*Elo, allModules []*Elo, matchId string) {
	// 分离未使用的模块
	usedSet := lo.SliceToMap(usedModules, func(m *Elo) (string, struct{}) { return m.Id, struct{}{} })
	unusedModules := lo.Filter(allModules, func(m *Elo, _ int) bool {
		_, exists := usedSet[m.Id]
		return !exists
	})

	// 如果所有模块都被使用或没有未使用模块，则无需更新
	if len(unusedModules) == 0 {
		return
	}

	// 初始化预期得分和实际得分的映射
	expectedScores := make(map[string]float64, len(allModules))
	actualScores := make(map[string]float64, len(allModules))

	// 预计算所有使用模块与未使用模块之间的预期得分和实际得分
	for _, used := range usedModules {
		for _, unused := range unusedModules {
			expectedUsed := used.ExpectedScore(unused)
			expectedUnused := unused.ExpectedScore(used)

			// 累加预期得分
			expectedScores[used.Id] += expectedUsed
			expectedScores[unused.Id] += expectedUnused

			// 累加实际得分（使用模块胜利，未使用模块失败）
			actualScores[used.Id] += 1.0
			// unused.Id 不需要累加，因为默认是 0
		}
	}

	// 计算每个模块的评分变化并更新
	for _, module := range allModules {
		var expected, actual float64
		var numComparisons float64

		if _, isUsed := usedSet[module.Id]; isUsed {
			// 使用的模块与所有未使用模块进行比较
			expected = expectedScores[module.Id]
			actual = actualScores[module.Id]
			numComparisons = float64(len(unusedModules))
		} else {
			// 未使用的模块与所有使用模块进行比较
			expected = expectedScores[module.Id]
			actual = actualScores[module.Id] // 始终为 0
			numComparisons = float64(len(usedModules))
		}

		// 避免除以零
		if numComparisons == 0 {
			continue
		}

		// 计算评分变化量
		k := module.AdjustK()
		delta := (actual/numComparisons - expected/numComparisons) * float64(k)
		deltaInt := int(math.Round(delta))

		// 更新模块评分
		module.Rating += deltaInt

		// 记录比赛信息
		module.Matches = append(module.Matches, matchId)
		module.Scores = append(module.Scores, actual/numComparisons)
	}
}
