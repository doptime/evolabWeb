package agents

import (
	"context"
	"text/template"

	"github.com/doptime/evolab/models"
)

type Interviewee struct {
	Name               string   `json:"name" description:"The name of the interviewee"`
	Role               string   `json:"role" description:"The professional role or position of the interviewee relevant to the system goal"`
	Background         string   `json:"background" description:"Educational and professional background of the interviewee"`
	ExpertiseAreas     []string `json:"expertiseAreas" description:"Areas of expertise of the interviewee relevant to the system goal"`
	PersonalityTraits  []string `json:"personalityTraits" description:"Personality traits of the interviewee (e.g., analytical, creative, detail-oriented)"`
	CommunicationStyle string   `json:"communicationStyle" description:"Communication style of the interviewee (e.g., formal, informal, technical, approachable)"`
	Goals              string   `json:"goals" description:"Goals or motivations of the interviewee within the context of the interview"`
	Strengths          []string `json:"strengths" description:"Strengths or areas where the interviewee excels"`
	Interests          []string `json:"interests" description:"Additional interests that may influence the interviewee's perspective"`
}

var GenIntervieweeTool = NewTool[*Interviewee]("generate-interviewee-profile", "Prepare a character profile based on the specified task requirements for system goal. The function analyzes the task description and creates an appropriate personality with relevant attributes.").WithMemoryCacheKey("Interviewee")
var IntervieweeAgentPrompt = template.Must(template.New("question").Parse(`Analyze the task requirements. Carefully prepare the interviewee's information according to the task requirements. Make the information as consistent as possible with the expectations of completing the target task. Fill in the blanks for relevant items that do not affect the information.

;This is the Duty Expectation Of Interviewee :
{{.DutyExpectationOfInterviewee}}

;This is the Profile Expectations Of Interviewer :
{{.ProfileExpectationsOfInterviewer}}

Use the function tools to return the  interviewee profile.`))

var IntervieweeAgent = NewAgent(models.ModelDefault, IntervieweeAgentPrompt, GenIntervieweeTool.Tool)

type IntervieweeRequirement struct {
	DutyExpectationOfInterviewee     string `json:"duty_expectation_of_interviewee" description:"what is the Duty Expectation of Interviewee"`
	ProfileExpectationsOfInterviewer string `json:"profile_expectations_of_interviewer" description:"To generate an interviewee profile, I need more specific details about the task requirements such as the desired professional role, years of experience, cultural background, and other relevant attributes. Could you please provide more detailed information about the task requirements so that I can create a tailored profile for the interviewee"`
}

var IntervieweePreparationTool = NewTool[*IntervieweeRequirement]("gen-or-change-interviewee-for-topic", "Prepare a character profile based on the specified task requirements for system goal. The function analyzes the task description and creates an appropriate personality with relevant attributes.", func(param *IntervieweeRequirement) {
	IntervieweeAgent.Call(context.Background(), map[string]any{"ExpectationOfInterviewee": param.DutyExpectationOfInterviewee,
		"ExpectationOfInterviewer": param.ProfileExpectationsOfInterviewer})
})
