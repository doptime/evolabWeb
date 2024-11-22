package agents

import (
	"encoding/json"
	"log"
	"reflect"
	"time"

	openai "github.com/sashabaranov/go-openai"
)

type ToolCallInterface interface {
	HandleFunctionCall(Param string) (err error)
}

var ToolMap = make(map[string]ToolCallInterface)

// Tool 是FuctionCall的逻辑实现。FunctionCall 是Tool的接口定义
type Tool[v any] struct {
	openai.Tool
	Functions []func(param v)
}

func (t *Tool[v]) SaveToShareMemory(param interface{}) {
	name := t.Tool.Function.Name
	//短期内调用的追加为slice
	unixNow := time.Now().UnixMilli()
	lastTm, ok := SharedMemorySaveTM[name]
	if ok && unixNow-lastTm < 1000 {
		_value, ok := SharedMemory[name].([]interface{})
		if !ok {
			SharedMemory[name] = append(_value, param)
		} else if _v, ok := SharedMemory[name].(v); ok {
			SharedMemory[name] = []interface{}{_v, param}
		}
	} else {
		SharedMemory[name] = param
	}
	SharedMemorySaveTM[name] = unixNow
}

func (t *Tool[v]) HandleFunctionCall(Param string) (err error) {
	var val v
	vType := reflect.TypeOf(val) // Decode escaped Unicode in Param
	if vType.Kind() == reflect.Ptr {
		// Create a new instance of the pointed type
		valPtr := reflect.New(vType.Elem()).Interface()
		err = json.Unmarshal([]byte(Param), valPtr)
		if err != nil {
			log.Printf("Error parsing arguments for tool %s: %v", t.Tool.Function.Name, err)
			return err
		}
		t.SaveToShareMemory(reflect.ValueOf(valPtr).Interface())
		// Assign the dereferenced pointer to val
		val = reflect.ValueOf(valPtr).Interface().(v)
	} else {
		// Unmarshal directly into val
		err = json.Unmarshal([]byte(Param), &val)
		if err != nil {
			log.Printf("Error parsing arguments for tool %s: %v", t.Tool.Function.Name, err)
			return err
		}
		t.SaveToShareMemory(val)
	}

	for _, f := range t.Functions {
		f(val)
	}
	return nil
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

	a := &Tool[v]{
		Tool: openai.Tool{Type: openai.ToolTypeFunction, Function: &openai.FunctionDefinition{
			Name:        name,
			Description: description,
			Parameters:  params,
		}},
		Functions: fs,
	}

	// Define the function to handle LLM response
	ToolMap[name] = a
	return a
}

func mapKindToDataType(kind reflect.Kind) string {
	var mapKindToDataType = map[reflect.Kind]string{
		reflect.Struct:  "object",
		reflect.Float32: "number", reflect.Float64: "number",
		reflect.Int: "integer", reflect.Int8: "integer", reflect.Int16: "integer", reflect.Int32: "integer", reflect.Int64: "integer",
		reflect.Uint: "integer", reflect.Uint8: "integer", reflect.Uint16: "integer", reflect.Uint32: "integer", reflect.Uint64: "integer",
		reflect.String:  "string",
		reflect.Slice:   "array",
		reflect.Array:   "array",
		reflect.Bool:    "boolean",
		reflect.Invalid: "null",
	}
	return mapKindToDataType[kind]
}
