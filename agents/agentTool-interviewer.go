package agents

import (
	"text/template"

	"github.com/doptime/evolab/models"
)

func init() {
	SharedMemory["SystemGoal"] = "refactor the files in the directory"

	SharedMemory["InterviewState"] = CurInterview

	SharedMemory["InterviewObservations"] = []string{}

}

type Interview struct {
	InterviewScript InterviewScript
	Interviewee     Interviewee
	Interviews      []InterviewSession
	NextQuestion    NextQuestionToAsk
}

var CurInterview = &Interview{}

type NextQuestionToAsk struct {
	GeneratedQuestion string `json:"generated_question" description:"Relecttion on the Interview, Generated question to ask the participant。1 of 3 possile way to generate question:1) Generate a follow-up question. 2)Move to next script questio in the interview script 3) ask new question if needed. If choosing follow-up, generate a natural question that: - Explores interesting points mentioned; - Seeks clarification if needed;- Maintains conversational tone; - Stays within current topic"`
}

var QuestionAgent = NewTool[*NextQuestionToAsk]("next-question-to-ask", "Determines next interview action and generates follow-up questions", func(param *NextQuestionToAsk) {
	CurInterview.NextQuestion = *param
})

type EndInterviewAndSummarizeObservations struct {
	Expert       string   `json:"expert" description:"You are an expert with a PhD analyzing an interview transcript. This is your Expertise."`
	Observations []string `json:"observations" description:"Based on the conversation, write 5-20 bullet keywords for each aspect, to describe observations about the participant's talk that contributes to the solve the system goal."`
}

var EndInterviewAndSummarizeObservationsTool = NewTool[*EndInterviewAndSummarizeObservations](
	"end-interview-and-summarize-observations", "End the interview and summarize observations", func(param *EndInterviewAndSummarizeObservations) {
		CurInterview.InterviewScript = InterviewScript{}
		CurInterview.Interviewee = Interviewee{}
		CurInterview.NextQuestion = NextQuestionToAsk{}
		CurInterview.Interviews = []InterviewSession{}

		SharedMemory["InterviewObservations"] = append(SharedMemory["InterviewObservations"].([]string), param.Observations...)
	})

type InterviewScript struct {
	CurrentTopics []string          `json:"current_topics" description:"Current topic of the interview, should be understandable by the participant without context"`
	Questions     map[string]string `json:"questions" description:"Questions to ask, with key the bullet point of the topic and value the question"`
	TimeLimit     int               `json:"time_limit" description:"Time xxs to spent on the topics, 120s usually"`
}

var GenInterviewScript = NewTool[*InterviewScript]("interviewer-script", " Generates a new interview script based on the current conversation context")

type InterviewSession struct {
	ExplanationOnCurrentTopic string `json:"explanation_on_current_topic" description:"Explanation on the current topic"`
	Question                  string `json:"current_topic" description:"Current topic of the interview"`
	Response                  string `json:"interviewee" description:"Interviewee"`
}

var TakenInterview = NewTool[*InterviewSession]("TakeInterview", " Ask The Interviewee a question, and get the response", func(param *InterviewSession) {
	CurInterview.Interviews = append(CurInterview.Interviews, *param)
})

type FileSaver struct {
	Path        string `json:"path" description:"The path to save the file"`
	FileContent string `json:"file_content" description:"The content of the file to save"`
}

var FileSaverTool = NewTool[*Interview]("save-final-result", " Finally After All interview has done, commit the file to the directory")

var InterviewerPrompt = template.Must(template.New("question").Parse(`
You are an AI System to complete the system goal: {{.SystemGoal}} by carrying interviews with a participant.
This is Files in the directory:
{{.Files}}

This is current interview state:
 {{.InterviewState}}

 This is Interview Observations:
 {{.InterviewObservations}}

 Work flow:
Review Current context infomation. And then determine whether to:
1. Propose a Interview Script to fulfill the system goal
2. Ask To Generate A Interviewee
5. Reflection on the interview and raise next question
4. continue interview with the interviewee
5. save final result to the directory using save-final-result tool


`))
var AgentInterviewer = NewAgent(models.ModelDefault, InterviewerPrompt,
	GenInterviewScript.Tool, EndInterviewAndSummarizeObservationsTool.Tool, IntervieweeAgent.Tool, QuestionAgent.Tool, TakenInterview.Tool, FileSaverTool.Tool)
