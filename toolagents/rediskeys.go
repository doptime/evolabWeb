package toolagents

import "github.com/doptime/redisdb"

type Talk struct {
	//case file: f/Path...; case query: q/nanoid...; case others: chars(TalkId) ∈ {alphanumeric}
	TalkId       string
	Content      string
	Purpose      string   //Purpose is used for describe what is expected to realiza of this Talk. used for context pick up
	SolveState   string   //SolveState is used for describe the state of the Talk. either ’uncompleted’ ’canBeImproved’ ’FullySolved’
	Dependencies []string `msgpack:"d"` // 引用的 TalkIds
}

var KeyTalk = redisdb.HashKey[string, *Talk](redisdb.WithKey("Talks:distribution"))
