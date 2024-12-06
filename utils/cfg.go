package utils

import (
	"fmt"

	"github.com/doptime/evolab/config"
)

func GetDefaultRealmPath() string {
	for _, realm := range config.EvoRealms {
		if len(realm.Name) > 0 {
			return realm.RootPath
		}
	}
	fmt.Println("No default realm found in config")
	return ""
}
