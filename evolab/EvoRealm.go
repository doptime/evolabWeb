package evolab

import "github.com/doptime/doptime/db"

type EvoRealm struct {
	Id              string
	Topic           string
	Up, Down, Shown int64
	Created         int64
	Popularity      float64

	InquiryIds []string `msgpack:"qp"`
}

var KeyEvoRealm = db.HashKey[string, *EvoRealm]()
