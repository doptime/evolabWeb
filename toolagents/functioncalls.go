package toolagents

import (
	"fmt"

	"github.com/doptime/evolab/functioncalls"
)

var TalkModularizerFunctioncall = &functioncalls.FunctionCall{
	Name:        "TalkModularizer",
	Description: "Func for TalkModularizer",
	Parameters: functioncalls.Parameters{
		Type: "object",
		Properties: map[string]functioncalls.Property{
			"Purpose": {Type: "string", Description: "Purpose of this Talk Node"},
		},
		Required: []string{"Purpose"},
	},
}

func TalkModularizerFunctioncallback(params map[string]interface{}) error {
	purpose, ok := params["Purpose"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid parameter 'Purpose'")
	}
	fmt.Println("TalkModularizerFuncCallBack: Purpose:", purpose)
	return nil
}
func init() {
	functioncalls.RegisterCallback("TalkModularizerFunc", TalkModularizerFunctioncallback)
}

var TalkGeneratorFunctioncall = &functioncalls.FunctionCall{
	Name: "TalkGenerator",
	Parameters: functioncalls.Parameters{
		Type:       "object",
		Properties: map[string]functioncalls.Property{"Purpose": {Type: "string"}},
		Required:   []string{"Purpose"},
	},
}

func TalkGeneratorFunctioncallback(params map[string]interface{}) error {
	purpose, ok := params["Purpose"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid parameter 'Purpose'")
	}
	fmt.Println("TalkModularizerFuncCallBack: Purpose:", purpose)
	return nil
}

func init() {
	functioncalls.RegisterCallback("TalkGenerator", TalkGeneratorFunctioncallback)
}
