package dopmap

import (
	"github.com/cespare/xxhash/v2"
)

// id of talk is xxhash64 of text
type Talk struct {
	Text       string
	From       string
	Up, Down   int64
	Eval, Show int64
}

func (t *Talk) Id() string {
	return xxhash.Sum64String(t.Text)
}

// id
type TalkId []string
