package models

import (
	"fmt"
	"math"
	"math/rand/v2"
	"time"
)

type ModelList struct {
	Name         string
	SelectCursor int
	Models       []*Model
}

var EloModels = ModelList{
	Name: "EloModels",
	Models: []*Model{
		//NewModel(EndPoint8007, ApiKey, NamePhi4),
		//NewModel(EndPoint8008, ApiKey, NamePhi4),
		NewModel(EndPoint8007, ApiKey, NameQwQ32BLocal),
		//NewModel(EndPoint8009, ApiKey, NameQwQ32BLocal),
		//NewModel(EndPoint8010, ApiKey, NameQwQ32BLocal),
		//NewModel(EndPoint8008, ApiKey, "/home/deaf/UwU-7B-Instruct-Q8_0.gguf"),
		//NewModel(EndPoint8009, ApiKey, "/home/deaf/UwU-7B-Instruct-Q8_0.gguf"),
	},
}
var lastPrintAverageResponseTime time.Time = time.Now()

func PrintAverageResponseTime() {
	go func() {
		time.Sleep(1 * time.Second)
		if time.Since(lastPrintAverageResponseTime) < 10*time.Second {
			return
		}
	}()
	lastPrintAverageResponseTime = time.Now()
	for _, model := range EloModels.Models {
		model.mutex.RLock()
		fmt.Printf("Model %s: %v\n", model.Name, model.avgResponseTime)
		model.mutex.RUnlock()
	}
}

func (list *ModelList) SelectOne(policy string) *Model {
	if len(list.Models) == 0 {
		return nil
	}
	PrintAverageResponseTime()
	// Calculate weights for each model
	weights := make([]float64, len(list.Models))
	var sum float64
	fatestIndex := 0
	fatestResponseTime := int64(99999999999)
	for i, model := range list.Models {
		model.mutex.RLock()
		avgTime := model.avgResponseTime
		if avgTime.Microseconds() < fatestResponseTime {
			fatestResponseTime = avgTime.Microseconds()
			fatestIndex = i
		}
		model.mutex.RUnlock()
		weights[i] = math.Sqrt(1 / float64(avgTime.Microseconds()))
		sum += weights[i]
	}

	if policy == "random" {
		// Select model based on weights
		randNum := rand.Float64()
		var cumulativeWeight float64

		for i, weight := range weights {
			cumulativeWeight += (weight / sum)
			if randNum < cumulativeWeight {
				return list.Models[i]
			}
		}
		fmt.Println("No model selected! use last model")
		// Fallback to last model if no selection was made
		return list.Models[len(list.Models)-1]
	} else if policy == "roundrobin" {
		selectIndex := list.SelectCursor % len(list.Models)
		if fatestIndex == selectIndex && rand.Float64() < 0.1 {
			return list.Models[fatestIndex]
		} else {
			list.SelectCursor += 1
			return list.Models[selectIndex]
		}
	}
	return list.Models[0]
}
