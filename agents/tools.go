package agents

import (
	"io"
	"os"
)

type SaveToFile struct {
	Filename string `json:"filename,omitempty" description:"Filename of output"`
	Result   string `json:"command,omitempty" description:"The Result string to save"`
}

var SaveStringToFile = NewTool[*SaveToFile]("SaveStringToFile", "Save string to localfile", func(param *SaveToFile) {
	if param.Filename == "" || param.Result == "" {
		return
	}
	file, err := os.Create(param.Filename)
	if err != nil {
		return
	}
	defer file.Close()
	io.WriteString(file, param.Result)

})
