package dopmap

type Dopmap struct {
	Topic           string
	Created         int64
	Up, Down, Shown int64
	Themes          []*Quesponder
	Talks           []*TalkId
}
