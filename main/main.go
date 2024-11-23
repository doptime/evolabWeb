package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/doptime/evolab/agents"
)

func main() {

	// Define the directory path
	dirPath := "/Users/yang/doptime/redisdb"
	dirPath = "/Users/yang/aircraft/wing"

	// Read directory entries
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		fmt.Println("Error reading directory:", err)
		return
	}

	// Initialize the files map
	files := map[string]string{}

	// Iterate over directory entries
	for _, entry := range entries {
		if !entry.IsDir() {
			filePath := filepath.Join(dirPath, entry.Name())
			content, err := os.ReadFile(filePath)
			if err != nil {
				fmt.Printf("Error reading file %s: %v\n", entry.Name(), err)
				continue
			}
			files[entry.Name()] = string(content)
		}
	}

	// Example: Print the files map
	AllFiles := []string{}
	for name, content := range files {
		AllFiles = append(AllFiles, fmt.Sprintf("Filename: %s\nContent:\n%s\n\n", name, content))

	}
	agents.SharedMemory["Files"] = strings.Join(AllFiles, "\n")
	go agents.AutoSaveSharedMemory()
	memoryjson, _ := json.Marshal(agents.SharedMemory)
	fmt.Println(string(memoryjson))

	for i := 0; i < 100; i++ {
		agents.AgentInterviewer.Call(context.Background())
	}
}
