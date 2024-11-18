package evolab

import "github.com/doptime/redisdb"

type Query struct {
	Question string
	From     string
	//with key the model name, value the state
	PonderState map[string]string
}

var KeyQuery = redisdb.HashKey[string, *Query](redisdb.WithAsWebData())
