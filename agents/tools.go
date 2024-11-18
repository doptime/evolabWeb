package agents

import (
	"io"
	"os"
)

type FileSaverParam struct {
	Path    string `json:"path" description:"path of file to save"`
	Content string `json:"content" description:"content of file to save"`
}

var ToolFileSaver = NewTool("fileSaver", "save file to the director, create or overwrite.", func(params *FileSaverParam) (interface{}, error) {
	//file save logic
	fileWriter, err := os.Open(params.Path)
	if err != nil {
		return "", err
	}
	defer fileWriter.Close()
	io.WriteString(fileWriter, params.Content)

	return "", nil
})

type FileRemoveParam struct {
	Path string `json:"path" description:"path of file to save"`
}

var ToolFileRemover = NewTool("fileRemover", "remove file in the director.", func(params *FileRemoveParam) (interface{}, error) {
	//file save logic
	os.Remove(params.Path)

	return "", nil
})
