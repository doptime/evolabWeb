package message

import "encoding/json"

func Assistant(msg string) *Message {
	return &Message{Role: "assistant", Content: msg}
}

func Function(toolfunctions interface{}) *Message {
	functionInfo, _ := json.Marshal(toolfunctions)
	return &Message{Role: "function", Content: string(functionInfo)}
}
