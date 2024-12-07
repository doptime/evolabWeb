package agents

import (
	"io"
	"os"
	"strings"

	"github.com/doptime/evolab/config"
)

type SaveToFile struct {
	Filename string `json:"filename,omitempty" description:"Filename of output"`
	Content  string `json:"content,omitempty" description:"The content string to save"`
}

var SaveStringToFile = NewTool[*SaveToFile]("SaveToFile", "Save string to localfile", func(param *SaveToFile) {
	if param.Filename == "" || param.Content == "" {
		return
	}
	for _, c := range config.EvoRealms {
		if ind := strings.Index(param.Filename, c.Name); ind == 0 {
			param.Filename = strings.Replace(param.Filename, c.Name, c.RootPath, 1)
		}
	}
	if param.Filename[0] != '/' {
		param.Filename = strings.TrimRight(config.DefaultRealmPath(), "/") + "/" + param.Filename
	}
	file, err := os.Create(param.Filename)
	if err != nil {
		return
	}
	defer file.Close()
	io.WriteString(file, param.Content)

})
