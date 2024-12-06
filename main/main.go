package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/doptime/evolab"
	"github.com/doptime/evolab/mem"
	"golang.org/x/sync/errgroup"
)

func main() {

	go mem.AutoSaveSharedMemory()
	memoryjson, _ := json.Marshal(mem.SharedMemory)
	fmt.Println(string(memoryjson))
	errorgroup, _ := errgroup.WithContext(context.Background())

	for k, v := range mem.IntentionFiles.Items() {
		fmt.Println("Analyzing Intention:", k, "...")
		errorgroup.Go(func() (err error) {
			var param map[string]any = map[string]any{"Intention": v}

			evolab.AgentIntentionDiveIn.Call(context.Background(), param)
			evolab.AgentIntentionSave.Call(context.Background(), param)
			return nil
		})

	}
	errorgroup.Wait()

}
