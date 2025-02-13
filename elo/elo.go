package elo

import (
	"math"
)

// 外部定义的常数 D，偏差常量（通常为 400）
const D = 400

// Elo 表示每个玩家的状态，包括评分、比赛次数和唯一标识符
type Elo struct {
	Id      string    // 玩家唯一标识符
	Rating  int       // 当前评分
	Matches []string  `json:"-"` // 参与的比赛Id
	Scores  []float64 `json:"-"`
}

// NewElo 创建一个新的 Elo 对象
// 初始评分为 1500，比赛次数为 0
func NewElo(id string, rating int) *Elo {
	return &Elo{Id: id, Rating: rating, Matches: nil}
}

// AdjustK 根据比赛次数动态调整 K 值
// 初始 K 值为 40，比赛达到 20 次时降为 10，使用余弦函数变化
func (e *Elo) AdjustK() int {
	if len(e.Matches) >= 20 {
		return 10
	}
	// 使用余弦函数平滑调整 K 值，范围在 40 到 10 之间
	return int(10 + 30*math.Cos(float64(len(e.Matches))/20*math.Pi/2))
}

// ExpectedScore 计算玩家 A 相对于玩家 B 的预期胜率
func (e *Elo) ExpectedScore(opponent *Elo) float64 {
	return 1 / (1 + math.Pow(10, float64(opponent.Rating-e.Rating)/float64(D)))
}

// UpdateRatings 根据比赛结果更新两个玩家的评分
// scoreA 为玩家 A 的比赛结果：胜利为 1.0，平局为 0.5，失败为 0.0
func UpdateRatings(playerA, playerB *Elo, matchId string, scoreA float64) (*Elo, *Elo) {
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
	playerA.Matches = append(playerA.Matches, matchId)
	playerA.Scores = append(playerA.Scores, scoreA)

	playerB.Matches = append(playerB.Matches, matchId)
	playerB.Scores = append(playerB.Scores, 1.0-scoreA)

	// 返回更新后的玩家对象
	return playerA, playerB
}
