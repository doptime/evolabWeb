package agents

import (
	"github.com/doptime/evolab/utils"
	"github.com/doptime/redisdb"
)

type SaveToFile struct {
	Filename string `json:"filename,omitempty" description:"Filename of output"`
	Content  string `json:"content,omitempty" description:"The content string to save"`
}

func saveToFile(param *SaveToFile) {
	if param.Filename == "" || param.Content == "" {
		return
	}
	utils.StringToFile(param.Filename, param.Content)

}

var SaveStringToFile = NewTool[*SaveToFile]("SaveToFile", "Save string to localfile", saveToFile)

type SaveToRedisHashKey struct {
	Key   string `json:"key,omitempty" description:"Key of redis hash"`
	Field string `json:"field,omitempty" description:"Field of redis hash"`
	Value string `json:"value,omitempty" description:"The content string to save"`
}

func saveToRedisHashKey(param *SaveToRedisHashKey) {
	if param.Key == "" || param.Field == "" || param.Value == "" {
		return
	}
	redisdb.HashKey[string, string](redisdb.WithKey(param.Key)).HSet(param.Field, param.Value)

}

var SaveStringToRedisHashKey = NewTool[*SaveToRedisHashKey]("SaveToRedisHashKey", "Save String to Redis Hash Key", saveToRedisHashKey)
