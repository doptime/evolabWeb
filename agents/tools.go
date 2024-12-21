package agents

import (
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/doptime/evolab/config"
)

type SaveToFile struct {
	Filename string `json:"filename,omitempty" description:"Filename of output"`
	Content  string `json:"content,omitempty" description:"The content string to save"`
}

func getLocalFileName(filename string) string {
	if strings.Contains(filename, ".Now") {
		//replace .Now with time format "yyyy-MM-dd-HH-mm"
		var timeFormat = "2006-01-02-15-04"
		filename = strings.Replace(filename, ".Now", "."+time.Now().Format(timeFormat), 1)
	}
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
	fmt.Println("A file saved: ", filename)

}

var SaveStringToFile = NewTool[*SaveToFile]("SaveToFile", "Save string to localfile", saveToFile)
