package main

import (
	"github.com/doptime/doptime/api"
	"github.com/doptime/evolab/batchop"
)

var ApiProblemReformulation = api.Api(batchop.ProblemReformulation).Func

var ApiProblemSolving = api.Api(batchop.ProblemSolving).Func
