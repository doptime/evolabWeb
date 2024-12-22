package agents

import (
	"github.com/doptime/evolab/utils"
)

type SaveToFile struct {
	Filename string `json:"filename,omitempty" description:"Filename of output"`
	Content  string `json:"content,omitempty" description:"The content string to save"`
}

func saveToFile(param *SaveToFile) {
	if param.Filename == "" || param.Content == "" {
		return
	}
	utils.StringToFile(param.Filename, param.Content)

}

var SaveStringToFile = NewTool[*SaveToFile]("SaveToFile", "Save string to localfile", saveToFile)
