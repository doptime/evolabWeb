package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/doptime/evolab/agents"
)

func main() {

	go agents.AutoSaveSharedMemory()
	memoryjson, _ := json.Marshal(agents.SharedMemory)
	fmt.Println(string(memoryjson))

	for i := 0; i < 100; i++ {
		agents.AgentInterviewer.Call(context.Background())
	}
}
