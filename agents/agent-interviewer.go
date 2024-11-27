package agents

import (
	"encoding/json"
	"fmt"
	"os"
	"text/template"

	"github.com/doptime/evolab/models"
)

type EndInterviewAndSummarizeObservations struct {
	Expert       string   `json:"expert" description:"You are an expert with a PhD analyzing an interview transcript. This is your Expertise."`
	Observations []string `json:"observations" description:"Based on the conversation, write 5-20 bullet keywords for each aspect, to describe observations about the participant's talk that contributes to the solve the system goal."`
}

var EndInterviewAndSummarizeObservationsTool = NewTool[*EndInterviewAndSummarizeObservations](
	"end-interview-and-transcribe-observations", "End the interview. summarize and transcribe reflective observations", func(param *EndInterviewAndSummarizeObservations) {

		obs, ok := SharedMemory["InterviewObservations"].([]string)
		if ok {
			SharedMemory["InterviewObservations"] = append(obs, param.Observations...)
		} else {
			SharedMemory["InterviewObservations"] = param.Observations
		}

		SharedMemory["Interviewee"] = nil
		SharedMemory["InterviewSessions"] = []interface{}{}
		SharedMemory["InterviewScript"] = ""

	})

type InterviewScript struct {
	CurrentTopics         string   `description:"topic of current interview session. Just focus on single topic, or a few related sub topics"`
	KeyObjectivesToDiveIn []string `description:"Key objectives should be clearfied, or to explore, To overturn, To determin the weight of idea. using bullet words of objectives to describe"`
}

func (script *InterviewScript) String() string {
	str, _ := json.Marshal(script)
	return "\n;InterviewScript=" + string(str) + "\n"
}

var GenInterviewScript = NewTool[*InterviewScript]("makeInterviewScript", "Generates or revise interview script based on background context. For easy ").WithMemoryCacheKey("InterviewScript")

type InterviewSession struct {
	Step1_ExplanationsToTheIntervieweee string `description:"Relecttion on previous Talks。Introduce topic context to interviewee, sould be understandable without background"`
	Step2_InterviewerAskAQuestion       string `description:"Generated question to ask the participant。1 of 3 possile way to generate question:1) Generate a follow-up question. 2)Move to next script questio in the interview script 3) ask new question if needed. If choosing follow-up, generate a natural question that: - Explores interesting points mentioned; - Seeks clarification if needed;- Maintains conversational tone; - Stays within current topic"`
	Step3_IntervieweeMakeResponse       string `description:"Should be answered. Interviewee begin try best to reflections and responses here. Don't talk in generalities. Just be specific and targeted,try reveal the structure of the problem。Show the key difficulties and sharp insights。make clarity on what is talking."`
}

func (ss *InterviewSession) String() string {
	return "\n;Question:\n" + ss.Step2_InterviewerAskAQuestion + "\nIntervieweeResponse:\n" + ss.Step3_IntervieweeMakeResponse
}

var TakenInterviewSession = NewTool[*InterviewSession]("InterviewSession", "One interview Session. Reflection , then explain necessary info to the interviewee, ask the Interviewee a question, and get the response", func(param *InterviewSession) {
	if len(param.Step3_IntervieweeMakeResponse) > 0 {
		SharedMemory["InterviewSessions"] = append(SharedMemory["InterviewSessions"].([]interface{}), param)
	}
})

type FileSaver struct {
	Path        string `description:"The path to save the file"`
	FileContent string `description:"The content of the file to save"`
}

var FileSaverTool = NewTool[*FileSaver]("FileSaver", "After All interview has done, commit the file to the directory", func(param *FileSaver) {
	// Save the file content to the specified path
	// For simplicity, we just print the content here
	fmt.Printf("Saving file to %s:\n%s\n", param.Path, param.FileContent)
	os.WriteFile(param.Path, []byte(param.FileContent), 0644)
})

type IntervieweeDescription struct {
	ProfileExpectationsOfInterviewer string `description:"The interviewer's expectations of the interviewee"`
	DutyExpectationOfInterviewee     string `description:"The interviewee's expectations of the interviewer"`
}

var InterviewerPrompt = template.Must(template.New("question").Parse(`
You are an world-class AI System。Capable with auto develop and auto evolve the given system.

You work by carrying interviews with interviewee participants, followed by making summarial obeervations an then save changed to file . Here's Work flow:
Review Current context information. And then call one of following Functions call (Function Tool):
1. If Interview Script is missing or need to be revised, Propose a Interview Script to fulfill the system goal. Skip this step if the script is ready.
2. Ensure there's an proper Interviewee, change Interviewee if needed
3. Start or forward the InterviewSession with the Interviewee.
4. Transcribe the InterviewSessions to interview obeervations. This will finish current interview and start a new one.
5. save phased result to the directory using FileSaver tool

Always responsed Message in ToolCalls part. One ToolCall per interaction.

Your work style ∈ { John D. Rockefeller, Andrew Carnegie, Henry Ford, Walt Disney, Bill Gates, Steve Jobs, J.P. Morgan, Jack Ma, George Soros, Thomas Edison, Nikola Tesla, Vladimir Shukhov, Claude Shannon, Vannevar Bush, Alan Turing}

;This is Files in the directory:
{{.Files}}

;This is Current Interview script:
{{.InterviewScript}}
 

 ;This is current interviewee:
 {{.Interviewee}}

;This is current interview state:
 {{.InterviewState}}

;This is current InterviewSessions:
 {{range .InterviewSessions}}
 {{.}}
 {{end}}

 ;This is Interview Observations for different interviews:
 {{range .InterviewObservations}}
 {{.}}
 {{end}}

`))
var AgentInterviewer = NewAgent(models.ModelDefault, InterviewerPrompt,
	GenInterviewScript.Tool, EndInterviewAndSummarizeObservationsTool.Tool,
	GenIntervieweeTool.Tool, TakenInterviewSession.Tool, FileSaverTool.Tool)
