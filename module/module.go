package module

import (
	"time"

	"github.com/doptime/eloevo/elo"
)

// 模块结构体（简化版）
type Module struct {
	elo.Elo                  // elo.Rating 看做模块生命力，或被引用权重
	VersionTags     string   // 模块版本
	ProblemToSolve  []string // 模块所属问题域
	DesignIdeas     []string
	OuterInterfaces []string
	InnerInterfaces []string
	Dependencies    []string // 本模块对其它模块的依赖
	TestResults     []*TestResult
}

func (m *Module) SourceCodeLocation() string {
	return "./" + m.Id + m.VersionTags
}

// TestResult stores the outcome of a test scenario on the module.
type TestResult struct {
	ScenarioID string
	Passed     bool
	Timestamp  time.Time
	Feedback   string
}
