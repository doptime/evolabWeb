package elo

import "math/rand/v2"

// Sampling 改进后的采样函数，采用加权随机选择
func Sampling(players []*Elo) (*Elo, *Elo) {
	if len(players) < 2 {
		return nil, nil // 至少需要两个选手参赛
	}

	// 计算每个玩家的权重
	var totalWeight float64
	weights := make([]float64, len(players))
	for i, player := range players {
		// 权重可以根据评分和比赛次数进行调整
		weight := float64(player.Rating) / float64(len(player.Matches)+1) // 避免除以零
		weights[i] = weight
		totalWeight += weight
	}

	// 归一化权重
	for i := range weights {
		weights[i] /= totalWeight
	}

	// 加权随机选择第一个玩家
	player1Index := weightedRandomChoice(weights)

	// 选择第二个玩家，确保不与第一个玩家相同
	player2Index := player1Index
	for player2Index == player1Index {
		player2Index = weightedRandomChoice(weights)
	}

	return players[player1Index], players[player2Index]
}

// weightedRandomChoice 根据权重进行加权随机选择
func weightedRandomChoice(weights []float64) int {
	r := rand.Float64()
	var cumulativeWeight float64
	for i, weight := range weights {
		cumulativeWeight += weight
		if r <= cumulativeWeight {
			return i
		}
	}
	return len(weights) - 1
}
