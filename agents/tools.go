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

func getLocalFileName(filename string) string {
	for _, c := range config.EvoRealms {
		if ind := strings.Index(filename, c.Name); ind == 0 {
			filename = strings.Replace(filename, c.Name, c.RootPath, 1)
		}
	}
	if filename[0] != '/' {
		filename = strings.TrimRight(config.DefaultRealmPath(), "/") + "/" + filename
	}
	return filename
}
func saveToFile(param *SaveToFile) {
	if param.Filename == "" || param.Content == "" {
		return
	}
	filename := getLocalFileName(param.Filename)
	file, err := os.Create(filename)
	if err != nil {
		return
	}
	defer file.Close()
	io.WriteString(file, param.Content)

}

var SaveStringToFile = NewTool[*SaveToFile]("SaveToFile", "Save string to localfile", saveToFile)
