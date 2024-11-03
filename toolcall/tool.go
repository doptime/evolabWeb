package toolcall

import "encoding/json"

type Tool struct {
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Parameters  Parameters `json:"parameters"`
}

type Parameters struct {
	Type       string              `json:"type"`
	Properties map[string]Property `json:"properties"`
	Required   []string            `json:"required"`
}

type Property struct {
	Type        string `json:"type"`
	Description string `json:"description"`
}

func (f *Tool) String() string {
	//to json
	r, _ := json.Marshal(f)
	return string(r)
}
