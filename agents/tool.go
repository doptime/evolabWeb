package agents

import (
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"time"

	openai "github.com/sashabaranov/go-openai"
)

var FunctionMap = make(map[string]func(string))

func HandleSingleFunctionCall(functionName string, param string) error {

	var funcCallMap map[string]interface{}
	if err := json.Unmarshal([]byte(param), &funcCallMap); err != nil {
		log.Printf("Error parsing arguments for tool %s: %v", functionName, err)
		return err
	}

	functionName, ok := funcCallMap[functionName].(string)
	if !ok {
		return fmt.Errorf("error: function name not found in function call map")
	}
	fun, ok := FunctionMap[functionName]
	if !ok {
		return fmt.Errorf("error: function not found in FunctionMap")
	}

	arguments, ok := funcCallMap["arguments"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("error: function arguments not found in function call map")
	}
	argumentsJson, err := json.Marshal(arguments)
	if err != nil {
		return err
	}
	fun(string(argumentsJson))
	return nil
}

// Tool 是FuctionCall的逻辑实现。FunctionCall 是Tool的接口定义
type Tool[v any] struct {
	openai.Tool
	function func(string)
}

func NewTool[v any](name string, description string, fs ...func(param v)) *Tool[v] {
	// Inspect the type of v , should be a struct
	vType := reflect.TypeOf(new(v)).Elem()

	for vType.Kind() == reflect.Ptr {
		vType = vType.Elem()
	}

	params := make(map[string]any)
	if vType.Kind() == reflect.Struct {
		// Map parameter fields to JSON schema definitions
		for i := 0; i < vType.NumField(); i++ {
			field := vType.Field(i)

			def := map[string]string{
				"type":        mapKindToDataType(field.Type.Kind()),
				"description": field.Tag.Get("description"),
			}
			params[field.Name] = def
		}
	}
	if len(fs) == 0 {
		fs = append([]func(param v){}, func(param v) {
			//短期内调用的追加为slice
			unixNow := time.Now().UnixMilli()
			lastTm, ok := SharedMemorySaveTM[name]
			if ok && unixNow-lastTm < 1000 {
				_value, ok := SharedMemory[name].([]v)
				if !ok {
					SharedMemory[name] = append(_value, param)
				} else if _v, ok := SharedMemory[name].(v); ok {
					SharedMemory[name] = []v{_v, param}
				}
			} else {
				SharedMemory[name] = param
			}
			SharedMemorySaveTM[name] = unixNow
		})
	}

	a := &Tool[v]{
		Tool: openai.Tool{Type: openai.ToolTypeFunction, Function: &openai.FunctionDefinition{
			Name:        name,
			Description: description,
			Parameters:  params,
		}},
		function: func(llmresponse string) {
			var params v
			if err := json.Unmarshal([]byte(llmresponse), &params); err != nil {
				log.Printf("Error parsing arguments for tool %s: %v", name, err)
			}
			for _, f := range fs {
				f(params)
			}
		},
	}

	// Define the function to handle LLM response
	FunctionMap[name] = a.function
	return a
}

func mapKindToDataType(kind reflect.Kind) string {
	switch kind {
	case reflect.Struct:
		return "object"
	case reflect.Float32, reflect.Float64:
		return "number"
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return "integer"
	case reflect.String:
		return "string"
	case reflect.Slice, reflect.Array:
		return "array"
	case reflect.Bool:
		return "boolean"
	case reflect.Invalid:
		return "null"
	default:
		return "string" // 默认类型
	}
}
