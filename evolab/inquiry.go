package evolab

import "github.com/doptime/redisdb"

type Inquiry struct {
	Question string `msgpack:"q"`
	From     string
	//with key the model name, value the state
	PonderState map[string]string
}

var KeyInquiry = redisdb.HashKey[string, *Inquiry]()
