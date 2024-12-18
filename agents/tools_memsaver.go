package agents

import "github.com/doptime/evolab/mem"

type FileNames struct {
	Category string   `json:"category,omitempty" description:"Category of files"`
	Files    []string `json:"filenames,omitempty" description:"Filenames"`
}

func WithFiles(param *FileNames) {
	if len(param.Files) == 0 || param.Category == "" {
		return
	}
	mem.SharedMemory[param.Category] = param.Files

}

var StoreFilenamesToMemory = NewTool("PickFileNames", "Save the picked out files", WithFiles)
