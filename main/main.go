package main

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/doptime/evolab"
	"github.com/doptime/evolab/mem"
	"golang.org/x/sync/errgroup"
)

func main() {

	go mem.AutoSaveSharedMemory()
	memoryjson, _ := json.Marshal(mem.SharedMemory)
	fmt.Println(string(memoryjson))
	errorgroup, _ := errgroup.WithContext(context.Background())
	items := mem.IntentionFiles.Items()
	for k, v := range items {
		if strings.Contains(k, ".done") {
			continue
		}
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
