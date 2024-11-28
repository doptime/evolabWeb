package config

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	dconfig "github.com/doptime/config"
	"github.com/doptime/evolab/agents"
)

type EvoRealm struct {
	Name      string
	Enable    bool
	RootPath  string
	SkipFiles string
	SkipDirs  string
}

var EvoRealms []*EvoRealm

func (e *EvoRealm) RealmFilename(filename string) string {
	return strings.Replace(filename, e.RootPath, e.Name, -1)
}

// LoadFilesToMemory loads all JSON configuration files from the specified directory into memory.
func (e *EvoRealm) LoadFilesToMemory() error {
	// Check if the directory exists
	info, err := os.Stat(e.RootPath)
	if os.IsNotExist(err) {
		log.Printf("Directory does not exist: %s", e.RootPath)
		return err
	}
	if !info.IsDir() {
		log.Printf("Provided path is not a directory: %s", e.RootPath)
		return err
	}
	if !e.Enable {
		log.Printf("EvoRealm disabled: %s", e.Name)
		return nil
	}

	// Walk through the directory
	err = filepath.Walk(e.RootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			log.Printf("Error accessing path %q: %v\n", path, err)
			return err
		}
		// Skip directories
		skipdirs := strings.Split(e.SkipDirs, ",")
		for _, skipdir := range skipdirs {
			if info.IsDir() && len(e.SkipDirs) > 0 && strings.Contains(path, skipdir) {
				return filepath.SkipDir
			}
		}
		// Skip files
		skipfiles := strings.Split(e.SkipFiles, ",")
		for _, skipfile := range skipfiles {
			if !info.IsDir() && len(e.SkipFiles) > 0 && strings.Contains(path, skipfile) {
				return nil
			}
		}
		realmfilename := e.RealmFilename(path)
		agents.SharedMemory[realmfilename] = append(agents.SharedMemory[realmfilename].([]interface{}), path)
		return nil
	})

	if err != nil {
		log.Printf("Error walking through directory %s: %v", e.RootPath, err)
		return err
	}

	log.Printf("All configuration files loaded successfully from directory: %s", e.RootPath)
	return nil
}

func init() {
	dconfig.LoadItemFromToml("EvoRealms", &EvoRealms)
	for _, evoRealm := range EvoRealms {
		if evoRealm.Enable {
			evoRealm.LoadFilesToMemory()
		}
	}
}
