package elo

import (
	"math"

	"github.com/samber/lo"
)

// Elo 表示每个玩家的状态，包括评分、比赛次数和唯一标识符
type BElo interface {
	Id() string
	Rating(delta int) int
}

const BatchD = 400

// ExpectedScore 计算玩家 A 相对于玩家 B 的预期胜率
func ExpectedScore(RatingA int, RatingB int) float64 {
	return 1 / (1 + math.Pow(10, float64(RatingA-RatingB)/float64(BatchD)))
}

// BatchUpdateRatings updates Elo ratings for a list of winners and players
func BatchUpdateRatings(winners []BElo, players []BElo, matchId string) {
	// Create a map for quick lookup of winners
	winnerMap := lo.SliceToMap(winners, func(m BElo) (string, struct{}) { return m.Id(), struct{}{} })

	// Identify the losers
	losers := lo.Filter(players, func(m BElo, _ int) bool {
		_, exists := winnerMap[m.Id()]
		return !exists
	})

	// No updates needed if there are no losers
	if len(losers) == 0 {
		return
	}

	// Initialize maps to store expected and actual scores
	expectedScores := make(map[string]float64, len(players))
	actualScores := make(map[string]float64, len(players))

	// Calculate expected and actual scores for each player
	for _, winner := range winners {
		for _, loser := range losers {
			// Aggregate expected scores for both winner and loser
			expectedScores[winner.Id()] += ExpectedScore(winner.Rating(0), loser.Rating(0))
			expectedScores[loser.Id()] += ExpectedScore(loser.Rating(0), winner.Rating(0))

			// Set actual scores based on win/loss
			actualScores[winner.Id()] += 1.0
		}
	}

	// Update ratings for each player
	for _, player := range players {
		expected, actual := expectedScores[player.Id()], actualScores[player.Id()]
		var numComparisons float64

		if _, isWinner := winnerMap[player.Id()]; isWinner {
			// Winner compares against all losers
			numComparisons = float64(len(losers))
		} else {
			// Loser compares against all winners
			numComparisons = float64(len(winners))
		}

		// Avoid division by zero
		if numComparisons == 0 {
			continue
		}

		// Calculate rating change
		k := 20
		delta := (actual/numComparisons - expected/numComparisons) * float64(k)
		deltaInt := int(math.Round(delta))

		// Update the player's rating
		player.Rating(deltaInt)
	}
}
