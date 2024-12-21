package models

import (
	openai "github.com/sashabaranov/go-openai"
)

// Model represents an OpenAI model with its associated client and model name.
type Model struct {
	Client    *openai.Client
	ModelName string
}

// NewModel initializes a new Model with the given baseURL, apiKey, and modelName.
// It configures the OpenAI client to use a custom base URL if provided.
func NewModel(baseURL, apiKey, modelName string) Model {
	config := openai.DefaultConfig(apiKey)
	if baseURL != "" {
		config.BaseURL = baseURL
	}
	client := openai.NewClientWithConfig(config)
	return Model{
		Client:    client,
		ModelName: modelName,
	}
}

const (
	EndPoint8008     = "http://gpu.lan:8008/v1"
	EndPoint8007     = "http://gpu.lan:8007/v1"
	EndPoint8006     = "http://gpu.lan:8006/v1"
	EndPoint8003     = "http://gpu.lan:8003/v1"
	ApiKey           = "token-deaf"
	ModelNameQwen32B = "Qwen/Qwen2.5-32B-Instruct-AWQ"

	ModelNameQwen32BCoder      = "Qwen/Qwen2.5-Coder-32B-Instruct-AWQ"
	ModelNameQwen32BCoderLocal = "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-32B-Instruct-AWQ/snapshots/5c7cb76a268fc6cfbb9c4777eb24ba6e27f9ee6c"

	ModelNameQwen72B      = "Qwen/Qwen2.5-72B-Instruct-AWQ"
	ModelNameQwen72BLocal = "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-72B-Instruct-AWQ/snapshots/698703eae6604af048a3d2f509995dc302088217"
	//ModelNameQwen14B = "Qwen/Qwen2.5-14B-Instruct-AWQ"
	ModelNameQwen14B        = "/home/deaf/.cache/huggingface/hub/models--Qwen--Qwen2.5-14B-Instruct-AWQ/snapshots/15caf3706c437f72fe4a0b64b4aee94b5e823e9c"
	ModelNameQwen7B         = "Qwen/Qwen2.5-7B-Instruct-AWQ"
	ModelNamePhi3           = "neuralmagic/Phi-3-medium-128k-instruct-quantized.w4a16"
	ModelNameGemma          = "neuralmagic/gemma-2-9b-it-quantized.w4a16"
	ModelNameMistralNemo    = "shuyuej/Mistral-Nemo-Instruct-2407-GPTQ"
	ModelNameMistralSmall   = "AMead10/Mistral-Small-Instruct-2409-awq"
	ModelNameMistralNemoAwq = "casperhansen/mistral-nemo-instruct-2407-awq"
	ModelNameLlama38b       = "neuralmagic/Meta-Llama-3.1-8B-Instruct-quantized.w4a16"
	ModelNameMarcoo1        = "AIDC-AI/Marco-o1"
	ModelNameQwQ32B         = "KirillR/QwQ-32B-Preview-AWQ"
	ModelNameLlama33_70b    = "casperhansen/llama-3.3-70b-instruct-awq"
	//ModelNameQwQ32B = "/home/deaf/.cache/huggingface/hub/models--KirillR--QwQ-32B-Preview-AWQ/snapshots/b082e5c095a17c50cc78fc6fe43a0eae326bd203"
)

// Initialize all models with their corresponding endpoints and names.
var (
	ModelQwen32B = NewModel(EndPoint8008, ApiKey, ModelNameQwen32B)

	ModelQwen32BCoder      = NewModel(EndPoint8007, ApiKey, ModelNameQwen32BCoder)
	ModelQwen32BCoderLocal = NewModel(EndPoint8007, ApiKey, ModelNameQwen32BCoderLocal)

	ModelQwen72B        = NewModel(EndPoint8007, ApiKey, ModelNameQwen72B)
	ModelQwen72BLocal   = NewModel(EndPoint8007, ApiKey, ModelNameQwen72BLocal)
	ModelQwen14B        = NewModel(EndPoint8007, ApiKey, ModelNameQwen14B)
	ModelQwen7B         = NewModel(EndPoint8007, ApiKey, ModelNameQwen7B)
	ModelPhi3           = NewModel(EndPoint8006, ApiKey, ModelNamePhi3)
	ModelGemma          = NewModel(EndPoint8006, ApiKey, ModelNameGemma)
	ModelMistralNemo    = NewModel(EndPoint8003, ApiKey, ModelNameMistralNemo)
	ModelMistralSmall   = NewModel(EndPoint8003, ApiKey, ModelNameMistralSmall)
	ModelMistralNemoAwq = NewModel(EndPoint8003, ApiKey, ModelNameMistralNemoAwq)
	ModelLlama38b       = NewModel(EndPoint8007, ApiKey, ModelNameLlama38b)
	ModelMarcoo1        = NewModel(EndPoint8008, ApiKey, ModelNameMarcoo1)
	ModelQwQ32B         = NewModel(EndPoint8007, ApiKey, ModelNameQwQ32B)
	ModelQwen32B12K     = NewModel(EndPoint8008, ApiKey, ModelNameQwen32B)
	ModelLlama33_70b    = NewModel(EndPoint8007, ApiKey, ModelNameLlama33_70b)
	//ModelDefault        = ModelQwen32BCoderLocal
	ModelDefault = ModelQwen72BLocal
)

// Models maps model names to their corresponding Model instances.
var Models = map[string]Model{
	ModelNameQwen32B:        ModelQwen32B,
	ModelNameQwen72B:        ModelQwen72B,
	ModelNameQwen14B:        ModelQwen14B,
	ModelNameQwen7B:         ModelQwen7B,
	ModelNamePhi3:           ModelPhi3,
	ModelNameGemma:          ModelGemma,
	ModelNameMistralNemo:    ModelMistralNemo,
	ModelNameMistralSmall:   ModelMistralSmall,
	ModelNameMistralNemoAwq: ModelMistralNemoAwq,
	ModelNameLlama38b:       ModelLlama38b,
}
