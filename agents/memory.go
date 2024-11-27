package agents

import (
	"encoding/json"
	"time"

	"github.com/cespare/xxhash/v2"
	"github.com/doptime/redisdb"
)

var SharedMemory = map[string]any{}

var keySaveMemory = redisdb.HashKey[string, any](redisdb.WithKey("SharedMemoryForLearnMathSite"))

func init() {
	SharedMemory["InterviewSessions"] = []interface{}{}

	SharedMemory["InterviewObservations"] = []string{}

	_sharedMemory, err := keySaveMemory.HGetAll()
	if err == nil {
		for k, v := range _sharedMemory {
			SharedMemory[k] = v
		}
	}
}
func AutoSaveSharedMemory() {
	SharedMemoryjson, _ := json.Marshal(SharedMemory)
	var lstSaveHash = xxhash.Sum64(SharedMemoryjson)
	for {
		time.Sleep(1000)
		SharedMemoryjson, _ = json.Marshal(SharedMemory)
		hashOfSharedMemory := xxhash.Sum64(SharedMemoryjson)
		if lstSaveHash != hashOfSharedMemory {
			lstSaveHash = hashOfSharedMemory
			keySaveMemory.HMSet(SharedMemory)
		}
	}
}

var SharedMemorySaveTM = map[string]int64{}

func SaveToShareMemory(MemoryCacheKey string, param interface{}) {
	if len(MemoryCacheKey) == 0 {
		return
	}
	//短期内调用的追加为slice
	unixNow := time.Now().UnixMilli()
	lastTm, ok := SharedMemorySaveTM[MemoryCacheKey]
	if ok && unixNow-lastTm < 1000 {
		_value, ok := SharedMemory[MemoryCacheKey].([]interface{})
		if ok {
			SharedMemory[MemoryCacheKey] = append(_value, param)
		} else {
			SharedMemory[MemoryCacheKey] = []interface{}{SharedMemory[MemoryCacheKey], param}
		}
	} else {
		SharedMemory[MemoryCacheKey] = param
	}
	SharedMemorySaveTM[MemoryCacheKey] = unixNow
}
