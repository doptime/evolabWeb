package agents

import (
	"text/template"

	"github.com/doptime/evolab/models"
)

type EndInterviewAndSummarizeObservations struct {
	Expert       string   `json:"expert" description:"You are an expert with a PhD analyzing an interview transcript. This is your Expertise."`
	Observations []string `json:"observations" description:"Based on the conversation, write 5-20 bullet keywords for each aspect, to describe observations about the participant's talk that contributes to the solve the system goal."`
}

var EndInterviewAndSummarizeObservationsTool = NewTool[*EndInterviewAndSummarizeObservations](
	"end-interview-and-transcribe-observations", "End the interview. summarize and transcribe reflective observations", func(param *EndInterviewAndSummarizeObservations) {

		SharedMemory["InterviewObservations"] = append(SharedMemory["InterviewObservations"].([]string), param.Observations...)
		SharedMemory["Interviewee"] = nil
		SharedMemory["InterviewSessions"] = []interface{}{}
		SharedMemory["InterviewScript"] = ""

	})

type InterviewScript struct {
	CurrentTopics []string `description:"topics of the interview, should be understandable by the participant without context"`
	Questions     any      `description:"Questions to ask, with key the bullet point of the topic and value the question"`
}

var GenInterviewScript = NewTool[*InterviewScript]("interviewerScript", "Generates or revise interview script based on background context. For easy ").WithMemoryCacheKey("InterviewScript")

type InterviewSession struct {
	NextQuestionReflection        string `description:"Relecttion on the Interview, Generated question to ask the participant。1 of 3 possile way to generate question:1) Generate a follow-up question. 2)Move to next script questio in the interview script 3) ask new question if needed. If choosing follow-up, generate a natural question that: - Explores interesting points mentioned; - Seeks clarification if needed;- Maintains conversational tone; - Stays within current topic"`
	ExplanationsToTheIntervieweee string `description:"Introduce topic context to interviewee, sould be understandable without background"`
	Question                      string `description:"The Question asking to the interviewee"`
	AnswerToTheQuestion           string `description:"Should be answered. Try all my (interviewee) ability to Reflections and Responses. Try hard to solve the question or problem。Don't talk in generalities, be specific and targeted。To show the structure of the problem。Show the key difficulties and sharp insights。"`
}

var TakenInterviewSession = NewTool[*InterviewSession]("InterviewSession", "One interview Session. Reflection , then explain necessary info to the interviewee, ask the Interviewee a question, and get the response", func(param *InterviewSession) {
	if len(param.AnswerToTheQuestion) > 0 {
		SharedMemory["InterviewSessions"] = append(SharedMemory["InterviewSessions"].([]interface{}), param)
	}
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
3. Start or forward or dive deeper with the InterviewSession
4. Transcribe the InterviewSessions to interview obeervations. This will finish current interview and start a new one.
5. save phased result to the directory using FileSaver tool

Always responsed Message in ToolCalls part. One ToolCall per interaction.

Your work style ∈ { John D. Rockefeller, Andrew Carnegie, Henry Ford, Walt Disney, Bill Gates, Steve Jobs, J.P. Morgan, Jack Ma, George Soros, Thomas Edison, Nikola Tesla, Vladimir Shukhov, Claude Shannon, Vannevar Bush, Alan Turing}

This is Files in the directory:
{{.Files}}


;This is current InterviewScript:
 {{.InterviewScript}}
 
 ;This is current interviewee:
 {{.Interviewee}}

;This is current interview state:
 {{.InterviewState}}

;This is current InterviewSessions:
 {{.InterviewSessions}}

 ;This is Interview Observations for different interviews:
 {{.InterviewObservations}}

`))
var AgentInterviewer = NewAgent(models.ModelDefault, InterviewerPrompt,
	GenInterviewScript.Tool, EndInterviewAndSummarizeObservationsTool.Tool,
	IntervieweePreparationTool.Tool, TakenInterviewSession.Tool, FileSaverTool.Tool)
