package toolcall

import (
	"encoding/json"
	"fmt"
)

type ToolCallback func(params map[string]interface{}) error

// 处理LLM返回的结果并调用相应的函数
func HandleResponse(response string) error {
	var result struct {
		Name      string                 `json:"name"`
		Arguments map[string]interface{} `json:"arguments"`
	}
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return fmt.Errorf("failed to parse response: %w", err)
	}

	if callback, found := callbacks[result.Name]; found {
		return callback(result.Arguments)
	}
	return fmt.Errorf("callback for function %s not found", result.Name)
}

var callbacks = map[string]ToolCallback{}

func RegisterCallback(name string, _callback ToolCallback) {
	callbacks[name] = _callback
}
