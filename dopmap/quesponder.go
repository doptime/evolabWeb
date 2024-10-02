package dopmap

type Ponder struct {
	Answer string
	From   string
}
type Quesponder struct {
	Question string
	Answers  []*Ponder
}
