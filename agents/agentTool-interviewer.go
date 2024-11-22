package agents

import (
	"text/template"

	"github.com/doptime/evolab/models"
)

func init() {
	SharedMemory["SystemGoal"] = "实现系统的自自组织-深入探索系统可能得性能极限，结构极限，同时确保实现的简洁，可行"

	SharedMemory["InterviewState"] = CurInterview

	SharedMemory["InterviewObservations"] = []string{}

}

type Interview struct {
	InterviewScript InterviewScript
	Interviewee     Interviewee
	Interviews      []InterviewSession
}

var CurInterview = &Interview{}

type EndInterviewAndSummarizeObservations struct {
	Expert       string   `json:"expert" description:"You are an expert with a PhD analyzing an interview transcript. This is your Expertise."`
	Observations []string `json:"observations" description:"Based on the conversation, write 5-20 bullet keywords for each aspect, to describe observations about the participant's talk that contributes to the solve the system goal."`
}

var EndInterviewAndSummarizeObservationsTool = NewTool[*EndInterviewAndSummarizeObservations](
	"end-interview-and-summarize-observations", "End the interview and summarize observations", func(param *EndInterviewAndSummarizeObservations) {
		CurInterview.InterviewScript = InterviewScript{}
		CurInterview.Interviewee = Interviewee{}
		CurInterview.Interviews = []InterviewSession{}
		SharedMemory["InterviewObservations"] = append(SharedMemory["InterviewObservations"].([]string), param.Observations...)
	})

type InterviewScript struct {
	CurrentTopics []string `description:"topics of the interview, should be understandable by the participant without context"`
	Questions     []string `description:"Questions to ask, with key the bullet point of the topic and value the question"`
}

var GenInterviewScript = NewTool[*InterviewScript]("interviewerScript", "Generates or revise interview script based on background context. For easy ")

type InterviewSession struct {
	NextQuestionReflection        string `description:"Relecttion on the Interview, Generated question to ask the participant。1 of 3 possile way to generate question:1) Generate a follow-up question. 2)Move to next script questio in the interview script 3) ask new question if needed. If choosing follow-up, generate a natural question that: - Explores interesting points mentioned; - Seeks clarification if needed;- Maintains conversational tone; - Stays within current topic"`
	ExplanationsToTheIntervieweee string `description:"Introduce topic context to interviewee, sould be understandable without background"`
	Question                      string `description:"Current topic of the interview"`
	Response                      string `description:"Interviewee"`
}

var TakenInterviewSession = NewTool[*InterviewSession]("InterviewSession", "One interview Session. Reflection , then explain necessary info to the interviewee, ask the Interviewee a question, and get the response", func(param *InterviewSession) {
	CurInterview.Interviews = append(CurInterview.Interviews, *param)
})

type FileSaver struct {
	Path        string `description:"The path to save the file"`
	FileContent string `description:"The content of the file to save"`
}

var FileSaverTool = NewTool[*FileSaver]("FileSaver", "After All interview has done, commit the file to the directory")

var InterviewerPrompt = template.Must(template.New("question").Parse(`
You are an AI System to complete the system goal: {{.SystemGoal}}

You work by carrying interviews with interviewee participants. Here's Work flow:
Review Current context infomation. And then take one of following Functions call (Function Tool):
1. Propose a Interview Script to fulfill the system goal
2. Ensure there's an proper Interviewee, change Interviewee if needed
3. continue with the InterviewSession
4. Transcribe the InterviewSessions to interview obeervations. This will finish current interview and start a new one.
5. save phased result to the directory using FileSaver tool

Always responsed Message in ToolCalls part. One ToolCall per interaction.

Your work style ∈ { John D. Rockefeller, Andrew Carnegie, Henry Ford, Walt Disney, Bill Gates, Steve Jobs, J.P. Morgan, Jack Ma, George Soros, Thomas Edison, Nikola Tesla, Vladimir Shukhov, Claude Shannon, Vannevar Bush, Alan Turing}

This is Files in the directory:
{{.Files}}

This is current interview state:
 {{.InterviewState}}

 This is Interview Observations:
 {{.InterviewObservations}}

`))
var AgentInterviewer = NewAgent(models.ModelDefault, InterviewerPrompt,
	GenInterviewScript.Tool, EndInterviewAndSummarizeObservationsTool.Tool, IntervieweeAgent.Tool, TakenInterviewSession.Tool, FileSaverTool.Tool)
