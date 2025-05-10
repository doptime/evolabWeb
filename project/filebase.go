package project

import "github.com/google/uuid"

type Model struct {
	ID           uuid.UUID
	PathName     string
	Version      int
	Dependencies map[string]*Model
	Metadata     map[string]any
}
type ModelInterface interface {
	FileContent(revision ...string) string
	DesignIdeas() []string
	TechNotation() []string
	FeedBacks() []string
}
