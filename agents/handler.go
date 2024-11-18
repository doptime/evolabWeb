package agents

import (
	"context"

	"github.com/tmc/langchaingo/callbacks"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/schema"
)

// Define function types for all handlers with proper capitalization
type (
	HandleTextFunc                    func(ctx context.Context, text string)
	HandleLLMStartFunc                func(ctx context.Context, prompts []string)
	HandleLLMGenerateContentStartFunc func(ctx context.Context, ms []llms.MessageContent)
	HandleLLMGenerateContentEndFunc   func(ctx context.Context, res *llms.ContentResponse)
	HandleLLMErrorFunc                func(ctx context.Context, err error)
	HandleChainStartFunc              func(ctx context.Context, inputs map[string]any)
	HandleChainEndFunc                func(ctx context.Context, outputs map[string]any)
	HandleChainErrorFunc              func(ctx context.Context, err error)
	HandleToolStartFunc               func(ctx context.Context, input string)
	HandleToolEndFunc                 func(ctx context.Context, output string)
	HandleToolErrorFunc               func(ctx context.Context, err error)
	HandleAgentActionFunc             func(ctx context.Context, action schema.AgentAction)
	HandleAgentFinishFunc             func(ctx context.Context, finish schema.AgentFinish)
	HandleRetrieverStartFunc          func(ctx context.Context, query string)
	HandleRetrieverEndFunc            func(ctx context.Context, query string, documents []schema.Document)
	HandleStreamingFuncFunc           func(ctx context.Context, chunk []byte)
)

// HandlerDecorator combines base handler with custom handling functions
type HandlerDecorator struct {
	handleTextFn                    HandleTextFunc
	handleLLMStartFn                HandleLLMStartFunc
	handleLLMGenerateContentStartFn HandleLLMGenerateContentStartFunc
	handleLLMGenerateContentEndFn   HandleLLMGenerateContentEndFunc
	handleLLMErrorFn                HandleLLMErrorFunc
	handleChainStartFn              HandleChainStartFunc
	handleChainEndFn                HandleChainEndFunc
	handleChainErrorFn              HandleChainErrorFunc
	handleToolStartFn               HandleToolStartFunc
	handleToolEndFn                 HandleToolEndFunc
	handleToolErrorFn               HandleToolErrorFunc
	handleAgentActionFn             HandleAgentActionFunc
	handleAgentFinishFn             HandleAgentFinishFunc
	handleRetrieverStartFn          HandleRetrieverStartFunc
	handleRetrieverEndFn            HandleRetrieverEndFunc
	handleStreamingFuncFn           HandleStreamingFuncFunc
}

// WithHandleText adds a text handler
func (h *HandlerDecorator) WithHandleText(fn HandleTextFunc) *HandlerDecorator {
	h.handleTextFn = fn
	return h
}

// WithHandleLLMStart adds an LLM start handler
func (h *HandlerDecorator) WithHandleLLMStart(fn HandleLLMStartFunc) *HandlerDecorator {
	h.handleLLMStartFn = fn
	return h
}

// WithHandleLLMGenerateContentStart adds an LLM generate content start handler
func (h *HandlerDecorator) WithHandleLLMGenerateContentStart(fn HandleLLMGenerateContentStartFunc) *HandlerDecorator {
	h.handleLLMGenerateContentStartFn = fn
	return h
}

// WithHandleLLMGenerateContentEnd adds an LLM generate content end handler
func (h *HandlerDecorator) WithHandleLLMGenerateContentEnd(fn HandleLLMGenerateContentEndFunc) *HandlerDecorator {
	h.handleLLMGenerateContentEndFn = fn
	return h
}

// WithHandleLLMError adds an LLM error handler
func (h *HandlerDecorator) WithHandleLLMError(fn HandleLLMErrorFunc) *HandlerDecorator {
	h.handleLLMErrorFn = fn
	return h
}

// WithHandleChainStart adds a chain start handler
func (h *HandlerDecorator) WithHandleChainStart(fn HandleChainStartFunc) *HandlerDecorator {
	h.handleChainStartFn = fn
	return h
}

// WithHandleChainEnd adds a chain end handler
func (h *HandlerDecorator) WithHandleChainEnd(fn HandleChainEndFunc) *HandlerDecorator {
	h.handleChainEndFn = fn
	return h
}

// WithHandleChainError adds a chain error handler
func (h *HandlerDecorator) WithHandleChainError(fn HandleChainErrorFunc) *HandlerDecorator {
	h.handleChainErrorFn = fn
	return h
}

// WithHandleToolStart adds a tool start handler
func (h *HandlerDecorator) WithHandleToolStart(fn HandleToolStartFunc) *HandlerDecorator {
	h.handleToolStartFn = fn
	return h
}

// WithHandleToolEnd adds a tool end handler
func (h *HandlerDecorator) WithHandleToolEnd(fn HandleToolEndFunc) *HandlerDecorator {
	h.handleToolEndFn = fn
	return h
}

// WithHandleToolError adds a tool error handler
func (h *HandlerDecorator) WithHandleToolError(fn HandleToolErrorFunc) *HandlerDecorator {
	h.handleToolErrorFn = fn
	return h
}

// WithHandleAgentAction adds an agent action handler
func (h *HandlerDecorator) WithHandleAgentAction(fn HandleAgentActionFunc) *HandlerDecorator {
	h.handleAgentActionFn = fn
	return h
}

// WithHandleAgentFinish adds an agent finish handler
func (h *HandlerDecorator) WithHandleAgentFinish(fn HandleAgentFinishFunc) *HandlerDecorator {
	h.handleAgentFinishFn = fn
	return h
}

// WithHandleRetrieverStart adds a retriever start handler
func (h *HandlerDecorator) WithHandleRetrieverStart(fn HandleRetrieverStartFunc) *HandlerDecorator {
	h.handleRetrieverStartFn = fn
	return h
}

// WithHandleRetrieverEnd adds a retriever end handler
func (h *HandlerDecorator) WithHandleRetrieverEnd(fn HandleRetrieverEndFunc) *HandlerDecorator {
	h.handleRetrieverEndFn = fn
	return h
}

// WithHandleStreamingFunc adds a streaming function handler
func (h *HandlerDecorator) WithHandleStreamingFunc(fn HandleStreamingFuncFunc) *HandlerDecorator {
	h.handleStreamingFuncFn = fn
	return h
}

// Handler interface implementation
func (h *HandlerDecorator) HandleText(ctx context.Context, text string) {
	if h.handleTextFn != nil {
		h.handleTextFn(ctx, text)
	}
}

func (h *HandlerDecorator) HandleLLMStart(ctx context.Context, prompts []string) {
	if h.handleLLMStartFn != nil {
		h.handleLLMStartFn(ctx, prompts)
	}
}

func (h *HandlerDecorator) HandleLLMGenerateContentStart(ctx context.Context, ms []llms.MessageContent) {
	if h.handleLLMGenerateContentStartFn != nil {
		h.handleLLMGenerateContentStartFn(ctx, ms)
	}
}

func (h *HandlerDecorator) HandleLLMGenerateContentEnd(ctx context.Context, res *llms.ContentResponse) {
	if h.handleLLMGenerateContentEndFn != nil {
		h.handleLLMGenerateContentEndFn(ctx, res)
	}
}

func (h *HandlerDecorator) HandleLLMError(ctx context.Context, err error) {
	if h.handleLLMErrorFn != nil {
		h.handleLLMErrorFn(ctx, err)
	}
}

func (h *HandlerDecorator) HandleChainStart(ctx context.Context, inputs map[string]any) {
	if h.handleChainStartFn != nil {
		h.handleChainStartFn(ctx, inputs)
	}
}

func (h *HandlerDecorator) HandleChainEnd(ctx context.Context, outputs map[string]any) {
	if h.handleChainEndFn != nil {
		h.handleChainEndFn(ctx, outputs)
	}
}

func (h *HandlerDecorator) HandleChainError(ctx context.Context, err error) {
	if h.handleChainErrorFn != nil {
		h.handleChainErrorFn(ctx, err)
	}
}

func (h *HandlerDecorator) HandleToolStart(ctx context.Context, input string) {
	if h.handleToolStartFn != nil {
		h.handleToolStartFn(ctx, input)
	}
}

func (h *HandlerDecorator) HandleToolEnd(ctx context.Context, output string) {
	if h.handleToolEndFn != nil {
		h.handleToolEndFn(ctx, output)
	}
}

func (h *HandlerDecorator) HandleToolError(ctx context.Context, err error) {
	if h.handleToolErrorFn != nil {
		h.handleToolErrorFn(ctx, err)
	}
}

func (h *HandlerDecorator) HandleAgentAction(ctx context.Context, action schema.AgentAction) {
	if h.handleAgentActionFn != nil {
		h.handleAgentActionFn(ctx, action)
	}
}

func (h *HandlerDecorator) HandleAgentFinish(ctx context.Context, finish schema.AgentFinish) {
	if h.handleAgentFinishFn != nil {
		h.handleAgentFinishFn(ctx, finish)
	}
}

func (h *HandlerDecorator) HandleRetrieverStart(ctx context.Context, query string) {
	if h.handleRetrieverStartFn != nil {
		h.handleRetrieverStartFn(ctx, query)
	}
}

func (h *HandlerDecorator) HandleRetrieverEnd(ctx context.Context, query string, documents []schema.Document) {
	if h.handleRetrieverEndFn != nil {
		h.handleRetrieverEndFn(ctx, query, documents)
	}
}

func (h *HandlerDecorator) HandleStreamingFunc(ctx context.Context, chunk []byte) {
	if h.handleStreamingFuncFn != nil {
		h.handleStreamingFuncFn(ctx, chunk)
	}
}

func NewHandler() *HandlerDecorator {
	return &HandlerDecorator{}
}

// Ensure HandlerDecorator implements Handler interface
var _ callbacks.Handler = (*HandlerDecorator)(nil)
