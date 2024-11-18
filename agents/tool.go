package agents

import (
	"encoding/json"
	"fmt"
	"reflect"

	openai "github.com/sashabaranov/go-openai"
	"github.com/tmc/langchaingo/jsonschema"
)

var FunctionMap = make(map[string]func(string) (ret interface{}, err error))

func HandleSingleFunctionCall(functionName string, funcCallMap map[string]interface{}) (interface{}, error) {
	functionName, ok := funcCallMap[functionName].(string)
	if !ok {
		return fmt.Errorf("error: function name not found in function call map"), nil
	}
	fun, ok := FunctionMap[functionName]
	if !ok {
		return fmt.Errorf("error: function not found in FunctionMap"), nil
	}

	arguments, ok := funcCallMap["arguments"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("error: function arguments not found in function call map"), nil
	}
	argumentsJson, err := json.Marshal(arguments)
	if err != nil {
		return nil, err
	}
	return fun(string(argumentsJson))
}

// Tool 是FuctionCall的逻辑实现。FunctionCall 是Tool的接口定义
type Tool[v any] struct {
	openai.Tool
	function func(string) (interface{}, error)
}

// type FunctionCall interface {
// 	String() string
// }

func (t *Tool[v]) String() string {
	data, err := json.Marshal(t.Function)
	if err != nil {
		fmt.Println("Error marshalling tool:", err)
		return ""
	}
	return string(data)
}

func NewTool[v any](name string, description string, f func(param v) (interface{}, error)) *Tool[v] {
	// Inspect the function signature
	funcType := reflect.TypeOf(f)
	if funcType.NumIn() != 1 {
		panic("function must have exactly one parameter")
	}

	paramType := funcType.In(0)
	for paramType.Kind() == reflect.Ptr {
		paramType = paramType.Elem()
	}
	if paramType.Kind() != reflect.Struct {
		panic("param must be a struct")
	}

	// Map parameter fields to JSON schema definitions
	params := make(map[string]jsonschema.Definition)
	for i := 0; i < paramType.NumField(); i++ {
		field := paramType.Field(i)

		def := jsonschema.Definition{
			Type:        mapKindToDataType(field.Type.Kind()),
			Description: field.Tag.Get("description"),
		}
		params[field.Name] = def
	}

	a := &Tool[v]{
		Tool: openai.Tool{Type: openai.ToolTypeFunction, Function: &openai.FunctionDefinition{
			Name:        name,
			Description: description,
			Parameters:  params,
		}},
		function: func(llmresponse string) (interface{}, error) {
			var params v
			err := json.Unmarshal([]byte(llmresponse), &params)
			if err != nil {
				return "", err
			}
			return f(params)
		},
	}

	// Define the function to handle LLM response
	FunctionMap[name] = a.function
	return a
}

// var FunctionToolsMap = map[string]string{}

// func FunctionTools(toolNames ...string) string {
// 	functions := make([]string, 0, len(toolNames))
// 	for _, t := range toolNames {
// 		functionTool, ok := FunctionToolsMap[t]
// 		if !ok {
// 			fmt.Println("error: tool not found in FunctionToolsMap")
// 			continue
// 		}
// 		functions = append(functions, functionTool)
// 	}

// 	functionsJSON, err := json.Marshal(functions)
// 	if err != nil {
// 		fmt.Println("Error marshalling functions:", err)
// 		return ""
// 	}

// 	return "```json\n{\n \"fuction_call\": " + string(functionsJSON) + "}```"
// }

func mapKindToDataType(kind reflect.Kind) jsonschema.DataType {
	switch kind {
	case reflect.Struct:
		return jsonschema.Object
	case reflect.Float32, reflect.Float64:
		return jsonschema.Number
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return jsonschema.Integer
	case reflect.String:
		return jsonschema.String
	case reflect.Slice, reflect.Array:
		return jsonschema.Array
	case reflect.Bool:
		return jsonschema.Boolean
	case reflect.Invalid:
		return jsonschema.Null
	default:
		return jsonschema.String // 默认类型
	}
}
