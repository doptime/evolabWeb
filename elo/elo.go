package elo

import (
	"math"
	"math/rand/v2"
)

// 外部定义的常数 D，偏差常量（通常为 400）
const D = 400

// Elo 表示每个玩家的状态，包括评分、比赛次数和唯一标识符
type Elo struct {
	Id      string // 玩家唯一标识符
	Rating  int    // 当前评分
	Matches int    // 参与的比赛次数
}

// NewElo 创建一个新的 Elo 对象
// 初始评分为 1500，比赛次数为 0
func NewElo(id string, rating int) *Elo {
	return &Elo{Id: id, Rating: rating, Matches: 0}
}

// AdjustK 根据比赛次数动态调整 K 值
// 初始 K 值为 40，比赛达到 20 次时降为 10，使用余弦函数变化
func (e *Elo) AdjustK() int {
	if e.Matches >= 20 {
		return 10
	}
	// 使用余弦函数平滑调整 K 值，范围在 40 到 10 之间
	return int(10 + 30*math.Cos(float64(e.Matches)/20*math.Pi/2))
}

// ExpectedScore 计算玩家 A 相对于玩家 B 的预期胜率
func (e *Elo) ExpectedScore(opponent *Elo) float64 {
	return 1 / (1 + math.Pow(10, float64(opponent.Rating-e.Rating)/float64(D)))
}

// UpdateRatings 根据比赛结果更新两个玩家的评分
// scoreA 为玩家 A 的比赛结果：胜利为 1.0，平局为 0.5，失败为 0.0
func UpdateRatings(playerA, playerB *Elo, scoreA float64) (*Elo, *Elo) {
	// 动态调整两个玩家的 K 值
	kA := playerA.AdjustK()
	//kB := playerB.AdjustK()

	// 计算两个玩家的预期胜率
	expectedA := playerA.ExpectedScore(playerB)

	// 根据比赛结果计算评分变化
	deltaA := int(float64(kA) * (scoreA - expectedA))
	deltaB := -deltaA // 两个玩家的评分变化量相等但方向相反

	// 更新评分
	playerA.Rating += deltaA
	playerB.Rating += deltaB

	// 更新比赛次数
	playerA.Matches++
	playerB.Matches++

	// 返回更新后的玩家对象
	return playerA, playerB
}

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
		weight := float64(player.Rating) / float64(player.Matches+1) // 避免除以零
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
