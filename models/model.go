package models

import (
	"sync"
	"time"

	openai "github.com/sashabaranov/go-openai"
)

// Model represents an OpenAI model with its associated client and model name.
type Model struct {
	Client *openai.Client
	Name   string

	avgResponseTime time.Duration
	mutex           sync.RWMutex
}

func (model *Model) UpdateModelResponseTime(duration time.Duration) {
	if duration < 10*time.Microsecond {
		return
	}
	model.mutex.Lock()
	defer model.mutex.Unlock()
	alpha := 0.1
	model.avgResponseTime = time.Duration(float64(model.avgResponseTime)*(1.0-alpha) + float64(duration)*alpha)
	if model.avgResponseTime < time.Second {
		model.avgResponseTime = time.Second
	}
}

// NewModel initializes a new Model with the given baseURL, apiKey, and modelName.
// It configures the OpenAI client to use a custom base URL if provided.
func NewModel(baseURL, apiKey, modelName string) *Model {
	config := openai.DefaultConfig(apiKey)
	if baseURL != "" {
		config.BaseURL = baseURL
	}
	client := openai.NewClientWithConfig(config)
	return &Model{
		Client:          client,
		Name:            modelName,
		avgResponseTime: 120 * time.Second,
	}
}

const (
	EndPoint8010     = "http://gpu.lan:8010/v1"
	EndPoint8009     = "http://gpu.lan:8009/v1"
	EndPoint8008     = "http://gpu.lan:8008/v1"
	EndPoint8007     = "http://gpu.lan:8007/v1"
	EndPoint8006     = "http://gpu.lan:8006/v1"
	EndPoint8003     = "http://gpu.lan:8003/v1"
	EndPointDeepseek = "https://api.deepseek.com/"
	ApiKey           = "token-deaf"
	ApiKeyDeepseek   = "sk-2d9e2689120c4544820485740ea2f36c"
	NameQwen32B      = "Qwen/Qwen2.5-32B-Instruct-AWQ"

	NameQwen32BCoder      = "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"
	NameQwen32BCoderLocal = "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-32B-Instruct-AWQ/snapshots/5c7cb76a268fc6cfbb9c4777eb24ba6e27f9ee6c"

	NameQwen72B      = "Qwen/Qwen2.5-72B-Instruct-AWQ"
	NameQwen72BLocal = "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-72B-Instruct-AWQ/snapshots/698703eae6604af048a3d2f509995dc302088217"
	//NameQwen14B = "Qwen/Qwen2.5-14B-Instruct-AWQ"
	NameQwen7B         = "Qwen/Qwen2.5-7B-Instruct-AWQ"
	NamePhi3           = "neuralmagic/Phi-3-medium-128k-instruct-quantized.w4a16"
	NameGemma          = "neuralmagic/gemma-2-9b-it-quantized.w4a16"
	NameMistralNemo    = "shuyuej/Mistral-Nemo-Instruct-2407-GPTQ"
	NameMistralSmall   = "AMead10/Mistral-Small-Instruct-2409-awq"
	NameMistralNemoAwq = "casperhansen/mistral-nemo-instruct-2407-awq"
	NameLlama38b       = "neuralmagic/Meta-Llama-3.1-8B-Instruct-quantized.w4a16"
	NameMarcoo1        = "AIDC-AI/Marco-o1"
	NameQwQ32B         = "KirillR/QwQ-32B-Preview-AWQ"
	NameQwQ32BLocal    = "/home/deaf/.cache/huggingface/hub/models--KirillR--QwQ-32B-Preview-AWQ/snapshots/b082e5c095a17c50cc78fc6fe43a0eae326bd203"
	NamePhi4           = "/home/deaf/.cache/huggingface/hub/models--Orion-zhen--phi-4-awq/snapshots/bc73c60ec9d246127dff940b3331c5464f18442e"

	NameLlama33_70b = "casperhansen/llama-3.3-70b-instruct-awq"
	NameDeepseek    = "deepseek-chat"

	//NameQwQ32B = "/home/deaf/.cache/huggingface/hub/models--KirillR--QwQ-32B-Preview-AWQ/snapshots/b082e5c095a17c50cc78fc6fe43a0eae326bd203"
)

// Initialize all models with their corresponding endpoints and names.
var (
	ModelQwen32B = NewModel(EndPoint8008, ApiKey, NameQwen32B)

	ModelQwen32BCoder      = NewModel(EndPoint8007, ApiKey, NameQwen32BCoder)
	ModelQwen32BCoderLocal = NewModel(EndPoint8007, ApiKey, NameQwen32BCoderLocal)

	ModelQwen72B      = NewModel(EndPoint8007, ApiKey, NameQwen72B)
	ModelQwen72BLocal = NewModel(EndPoint8007, ApiKey, NameQwen72BLocal)

	ModelQwenQvq72B = NewModel(EndPoint8007, ApiKey, "/home/deaf/.cache/huggingface/hub/models--kosbu--QVQ-72B-Preview-AWQ/snapshots/9f763dc5a3bf51ed157aee12a8aae4ae8e7c1926")

	ModelQwen14B        = NewModel("http://gpu.lan:1214/v1", ApiKey, "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-14B-Instruct-AWQ/snapshots/539535859b135b0244c91f3e59816150c8056698")
	ModelQwen7B         = NewModel(EndPoint8007, ApiKey, NameQwen7B)
	ModelPhi3           = NewModel(EndPoint8006, ApiKey, NamePhi3)
	ModelGemma          = NewModel(EndPoint8006, ApiKey, NameGemma)
	ModelMistralNemo    = NewModel(EndPoint8003, ApiKey, NameMistralNemo)
	ModelMistralSmall   = NewModel(EndPoint8003, ApiKey, NameMistralSmall)
	ModelMistralNemoAwq = NewModel(EndPoint8003, ApiKey, NameMistralNemoAwq)
	ModelLlama38b       = NewModel(EndPoint8007, ApiKey, NameLlama38b)
	ModelMarcoo1        = NewModel(EndPoint8008, ApiKey, NameMarcoo1)
	ModelQwQ32B         = NewModel(EndPoint8007, ApiKey, NameQwQ32B)
	ModelQwQ32BLocal    = NewModel(EndPoint8007, ApiKey, NameQwQ32BLocal)
	ModelQwen32B12K     = NewModel(EndPoint8008, ApiKey, NameQwen32B)
	ModelLlama33_70b    = NewModel(EndPoint8007, ApiKey, NameLlama33_70b)
	//ModelDeepseek       = NewModel(EndPointDeepseek, ApiKeyDeepseek, NameDeepseek)
	ModelQwen2_1d5B     = NewModel("http://gpu.lan:8215/v1", ApiKey, "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-1.5B-Instruct/snapshots/989aa7980e4cf806f80c7fef2b1adb7bc71aa306")
	ModelQwen2_7B       = NewModel("http://gpu.lan:1207/v1", ApiKey, "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-7B-Instruct-AWQ/snapshots/b25037543e9394b818fdfca67ab2a00ecc7dd641")
	DeepSeekR1_Qwen_32  = NewModel("http://gpu.lan:3232/v1", ApiKey, "/home/deaf/.cache/huggingface/hub/models--casperhansen--deepseek-r1-distill-qwen-32b-awq/snapshots/94ed811eb2006ffcc27b964ab55ac28c6b0cdae8")
	DeepSeekR1_Qwen_14  = NewModel("http://gpu.lan:3214/v1", ApiKey, "/home/deaf/.cache/huggingface/hub/models--casperhansen--deepseek-r1-distill-qwen-14b-awq/snapshots/1874537e80f451042f7993dfa2b21fd25b4e7223")
	FuseO1              = NewModel("http://gpu.lan:4732/v1", ApiKey, "Valdemardi/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview-AWQ")
	DolphinR1Mistral24B = NewModel("http://gpu.lan:7824/v1", ApiKey, "/home/deaf/.cache/huggingface/hub/models--Valdemardi--Dolphin3.0-R1-Mistral-24B-AWQ/snapshots/e650d4cb71fb0b4f00548898e1598f038cd5df2d")

	//ModelDefault        = ModelQwen32BCoderLocal
	ModelDefault = ModelQwen72BLocal
)

// Models maps model names to their corresponding Model instances.
var Models = map[string]*Model{
	NameQwen32B:        ModelQwen32B,
	NameQwen72B:        ModelQwen72B,
	ModelQwen14B.Name:  ModelQwen14B,
	NameQwen7B:         ModelQwen7B,
	NamePhi3:           ModelPhi3,
	NameGemma:          ModelGemma,
	NameMistralNemo:    ModelMistralNemo,
	NameMistralSmall:   ModelMistralSmall,
	NameMistralNemoAwq: ModelMistralNemoAwq,
	NameLlama38b:       ModelLlama38b,
}
