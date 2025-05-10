package prototype

type ItemsSorted struct {
	ItemsRefById []string       `description:"Items sorted. Referenced by Items Id"`
	Extra        map[string]any `msgpack:"-" json:"-" description:"Extra, call parameter of Agent"`
}

type SolutionRefine struct {
	ItemsShouldKeptInSolutionSorted     []string `description:"Items that should be kept in solution, sorted by importance,best first. Referenced by Items Id"`
	ItemsShouldRemoveFromSolutionSorted []string `description:"Items that should be remove in solution, sorted by importance, worst first. Referenced by Items Id"`
}
