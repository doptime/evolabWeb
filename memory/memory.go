package memory

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/cespare/xxhash/v2"
	"github.com/doptime/eloevo/config"
	"github.com/doptime/redisdb"
	cmap "github.com/orcaman/concurrent-map/v2"
	"github.com/samber/lo"
)

var SharedMemory = map[string]any{}
var FilesInRealms []*config.FileData
var IntentionFiles = cmap.New[*config.FileData]()

var keySaveMemory = redisdb.HashKey[string, any](redisdb.WithKey("SharedMemoryForRedisdb"))

func loadEovoLabIntention() {
	for _, realm := range config.EvoRealms {
		realm := *realm
		//remove .evolab in realm.SkipPath
		realm.SkipDirs = strings.Replace(realm.SkipDirs, ".evolab", "", -1)
		files, err := realm.LoadRealmFiles()
		if err != nil {
			continue
		}
		//keep files in .evolab only
		files = lo.Filter(files, func(file *config.FileData, i int) bool {
			return strings.LastIndex(file.Path, ".evolab") != -1
		})

		for _, intention := range files {
			if strings.LastIndex(intention.Path, ".intention") != -1 && strings.LastIndex(intention.Path, ".intentiondone") == -1 {
				IntentionFiles.Set(intention.Path, intention)
			}
		}
	}
}
func init() {
	var err error
	SharedMemory["Files"] = []*config.FileData{}
	FilesInRealms, err = config.LoadRealmsFiles()
	if err != nil {
		fmt.Println(err)
	}
	SharedMemory["Files"] = FilesInRealms
	loadEovoLabIntention()

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
