package evolab

import "github.com/doptime/redisdb"

type EvoRealm struct {
	Id         string
	Topic      string
	Up, Down   int64
	Shown      int64
	Created    int64 `mod:"unixtime=ms"`
	Popularity float64

	QueryIds []string `msgpack:"Queries"`
}

var KeyEvoRealm = redisdb.HashKey[string, *EvoRealm](redisdb.WithAsWebData())

func EnableEvoLabe() {

}
