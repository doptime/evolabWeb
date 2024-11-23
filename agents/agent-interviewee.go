package agents

import (
	"context"
	"text/template"

	"github.com/doptime/evolab/models"
)

// Interviewee represents a simulated individual in the multi-agent system
type Interviewee1 struct {
	// Basic Information
	Name                string `json:"name,omitempty" description:"Unique name for the Interviewee"`
	SimilarFamousPerson string `json:"similar_famous_person,omitempty" description:"Similar famous person: name of a well-known individual with similar traits"`
	Gender              string `json:"gender,omitempty" description:"Gender identity: male, female, non_binary, other"`
	Age                 int    `json:"age,omitempty" description:"Age in years: 20-65"`

	// Geographic and Cultural Background
	Country        string   `json:"country,omitempty" description:"Country of residence: ISO 3166-1 alpha-2 codes"`
	Region         string   `json:"region,omitempty" description:"Geographic region: north_america, south_america, europe, asia_pacific, middle_east, africa"`
	TimeZone       string   `json:"timezone,omitempty" description:"Time zone: IANA time zone database name"`
	CultureGroup   string   `json:"culture_group,omitempty" description:"Cultural background: western, eastern, latin, african, middle_eastern, south_asian, east_asian, southeast_asian"`
	NativeLanguage string   `json:"native_language,omitempty" description:"Native language: ISO 639-1 code"`
	OtherLanguages []string `json:"other_languages,omitempty" description:"Other languages spoken: ISO 639-1 codes"`
	LanguageLevels []string `json:"language_levels,omitempty" description:"Proficiency levels for other languages: native, fluent, intermediate, basic"`

	// Professional Role
	Title              string   `json:"title,omitempty" description:"Professional role: software_architect, frontend_engineer, backend_engineer, devops_engineer, test_engineer, ui_ux_designer, data_engineer, security_engineer, product_manager, project_manager, agile_coach, tech_lead, business_analyst, domain_expert, marketing_specialist, user_researcher"`
	YearsExperience    int      `json:"years_experience,omitempty" description:"Years of professional experience: 0-40"`
	ExpertiseLevel     string   `json:"expertise_level,omitempty" description:"Level of expertise: expert, senior, intermediate, junior"`
	Specializations    []string `json:"specializations,omitempty" description:"Specific areas of specialization within the role"`
	IndustryExperience []string `json:"industry_experience,omitempty" description:"Previous industry experience: finance, healthcare, retail, technology, education, manufacturing, etc."`

	// Personality Traits (OCEAN Model)
	Openness          int    `json:"openness,omitempty" description:"Openness to experience score: 0-100"`
	Conscientiousness int    `json:"conscientiousness,omitempty" description:"Conscientiousness score: 0-100"`
	Extraversion      int    `json:"extraversion,omitempty" description:"Extraversion score: 0-100"`
	Agreeableness     int    `json:"agreeableness,omitempty" description:"Agreeableness score: 0-100"`
	Neuroticism       int    `json:"neuroticism,omitempty" description:"Neuroticism score: 0-100"`
	RiskTolerance     string `json:"risk_tolerance,omitempty" description:"Approach to risk: risk_averse, moderate, risk_taking"`
	AdaptabilityLevel string `json:"adaptability,omitempty" description:"Adaptability to change: highly_adaptable, moderately_adaptable, change_resistant"`
	StressResponse    string `json:"stress_response,omitempty" description:"Response to stress: resilient, moderate, sensitive"`

	// Work Style
	CommunicationStyle string `json:"communication_style,omitempty" description:"Preferred communication approach: direct, collaborative, analytical, expressive"`
	DecisionMaking     string `json:"decision_making,omitempty" description:"Decision-making approach: data_driven, intuitive, experience_based, consensus_seeking"`
	ProblemSolving     string `json:"problem_solving,omitempty" description:"Problem-solving style: innovative, systematic, practical, perfectionist"`
	LeadershipStyle    string `json:"leadership_style,omitempty" description:"Leadership approach: authoritative, democratic, coaching, delegative, transformational"`
	ConflictResolution string `json:"conflict_resolution,omitempty" description:"Conflict handling: competing, accommodating, avoiding, collaborating, compromising"`

	// Technical Skills
	Technologies      []string `json:"technologies,omitempty" description:"List of known technologies and tools"`
	TechProficiencies []string `json:"tech_proficiencies,omitempty" description:"Proficiency levels for each technology: expert, advanced, intermediate, beginner"`
	TechYearsOfUse    []int    `json:"tech_years_of_use,omitempty" description:"Years of experience for each technology: 0-40"`

	// Domain Knowledge
	Domains      []string `json:"domains,omitempty" description:"Areas of domain expertise"`
	DomainLevels []string `json:"domain_levels,omitempty" description:"Expertise level for each domain: expert, advanced, intermediate, beginner"`
	DomainYears  []int    `json:"domain_years,omitempty" description:"Years of experience in each domain: 0-40"`

	// Methodologies and Certifications
	Methodologies  []string `json:"methodologies,omitempty" description:"Known methodologies: agile, scrum, kanban, waterfall, lean, devops, etc."`
	Certifications []string `json:"certifications,omitempty" description:"Professional certifications"`
	CertProviders  []string `json:"cert_providers,omitempty" description:"Certification providers"`
	CertValidUntil []string `json:"cert_valid_until,omitempty" description:"Certification expiration dates: YYYY-MM-DD"`

	// Cognitive Style
	ThinkingPattern       string `json:"thinking_pattern,omitempty" description:"Cognitive approach: divergent, convergent, systematic, critical"`
	LearningStyle         string `json:"learning_style,omitempty" description:"Learning preference: activist, theorist, reflector, pragmatist"`
	InformationProcessing string `json:"information_processing,omitempty" description:"Information processing: visual, auditory, kinesthetic, reading/writing"`
	ProblemFraming        string `json:"problem_framing,omitempty" description:"Problem framing approach: analytical, intuitive, holistic, experimental"`

	// Motivation and Values
	PrimaryDrive     string   `json:"primary_drive,omitempty" description:"Main motivation: achievement, relationship, growth, stability"`
	ValueOrientation string   `json:"value_orientation,omitempty" description:"Primary values: innovation, efficiency, quality, user_satisfaction"`
	CareerGoals      []string `json:"career_goals,omitempty" description:"Professional aspirations"`
	Motivators       []string `json:"motivators,omitempty" description:"What drives them: recognition, autonomy, mastery, purpose, compensation"`
	WorkLifeBalance  string   `json:"work_life_balance,omitempty" description:"Work-life balance preference: work_centric, balanced, life_centric"`

	// Interaction Preferences
	PreferredMeetingFormat string `json:"preferred_meeting_format,omitempty" description:"Meeting preference: structured, informal, mixed"`
	FeedbackStyle          string `json:"feedback_style,omitempty" description:"Feedback approach: direct, diplomatic, detailed, big_picture"`
	CollaborationMode      string `json:"collaboration_mode,omitempty" description:"Work mode: independent, collaborative, flexible"`
	RemoteWorkPreference   string `json:"remote_work,omitempty" description:"Remote work preference: remote_first, hybrid, office_first"`
	TeamSizePreference     string `json:"team_size,omitempty" description:"Preferred team size: small_team(2-5), medium_team(6-10), large_team(11+)"`

	// Cultural Dimensions
	PowerDistance        int    `json:"power_distance,omitempty" description:"Power distance preference score: 0-100"`
	Individualism        int    `json:"individualism,omitempty" description:"Individualism vs collectivism score: 0-100"`
	UncertaintyAvoidance int    `json:"uncertainty_avoidance,omitempty" description:"Uncertainty avoidance score: 0-100"`
	TimeOrientation      string `json:"time_orientation,omitempty" description:"Time orientation: long_term, short_term, balanced"`

	// Emotional Intelligence
	EmotionalAwareness  int `json:"emotional_awareness,omitempty" description:"Self-awareness score: 0-100"`
	EmotionalRegulation int `json:"emotional_regulation,omitempty" description:"Emotional control score: 0-100"`
	SocialSkills        int `json:"social_skills,omitempty" description:"Social competence score: 0-100"`

	// Career Development
	CareerStage     string `json:"career_stage,omitempty" description:"Current career stage: early_career, mid_career, senior, executive"`
	GrowthDirection string `json:"growth_direction,omitempty" description:"Desired career progression: technical, managerial, specialist, entrepreneur"`
	MentorshipStyle string `json:"mentorship_style,omitempty" description:"Mentoring approach: directive, supportive, delegative, hands_off"`
}
type Interviewee struct {
	// Basic Information
	Name   string `json:"name,omitempty" description:"Unique name for the Interviewee"`
	Gender string `json:"gender,omitempty" description:"Gender identity: male, female, non_binary, other"`
	Age    int    `json:"age,omitempty" description:"Age in years: 20-65"`

	// Geographic and Cultural Background
	Country        string   `json:"country,omitempty" description:"Country of residence: ISO 3166-1 alpha-2 codes"`
	Region         string   `json:"region,omitempty" description:"Geographic region: north_america, south_america, europe, asia_pacific, middle_east, africa"`
	TimeZone       string   `json:"timezone,omitempty" description:"Time zone: IANA time zone database name"`
	CultureGroup   string   `json:"culture_group,omitempty" description:"Cultural background: western, eastern, latin, african, middle_eastern, south_asian, east_asian, southeast_asian"`
	NativeLanguage string   `json:"native_language,omitempty" description:"Native language: ISO 639-1 code"`
	OtherLanguages []string `json:"other_languages,omitempty" description:"Other languages spoken: ISO 639-1 codes"`
	LanguageLevels []string `json:"language_levels,omitempty" description:"Proficiency levels for other languages: native, fluent, intermediate, basic"`

	// Professional Role
	Title              string   `json:"title,omitempty" description:"Professional role: flight_designer, manufacturing_engineer, safety_officer, cost_control_manager, compliance_officer, control_systems_engineer, software_developer"`
	YearsExperience    int      `json:"years_experience,omitempty" description:"Years of professional experience: 0-40"`
	ExpertiseLevel     string   `json:"expertise_level,omitempty" description:"Level of expertise: expert, senior, intermediate, junior"`
	Specializations    []string `json:"specializations,omitempty" description:"Specific areas of specialization within the role"`
	IndustryExperience []string `json:"industry_experience,omitempty" description:"Previous industry experience: aerospace, aviation, defense, manufacturing, technology, safety, compliance"`

	// Technical Skills
	Technologies      []string `json:"technologies,omitempty" description:"List of relevant technologies and tools: CAD software, simulation tools, control systems, manufacturing equipment, safety compliance tools"`
	TechProficiencies []string `json:"tech_proficiencies,omitempty" description:"Proficiency levels for each technology: expert, advanced, intermediate, beginner"`
	TechYearsOfUse    []int    `json:"tech_years_of_use,omitempty" description:"Years of experience with each technology: 0-40"`

	// Domain Knowledge
	Domains      []string `json:"domains,omitempty" description:"Areas of domain expertise: aerodynamics, propulsion, structural design, avionics, safety regulations, cost management, compliance standards"`
	DomainLevels []string `json:"domain_levels,omitempty" description:"Expertise level for each domain: expert, advanced, intermediate, beginner"`
	DomainYears  []int    `json:"domain_years,omitempty" description:"Years of experience in each domain: 0-40"`

	// Certifications and Compliance
	Certifications []string `json:"certifications,omitempty" description:"Professional certifications: FAA certifications, Six Sigma, PMP, ISO certifications"`
	CertProviders  []string `json:"cert_providers,omitempty" description:"Certification providers"`
	CertValidUntil []string `json:"cert_valid_until,omitempty" description:"Certification expiration dates: YYYY-MM-DD"`

	// Safety and Compliance
	SafetyCertifications []string `json:"safety_certifications,omitempty" description:"Safety-related certifications: OSHA, NEBOSH, etc."`
	ComplianceStandards  []string `json:"compliance_standards,omitempty" description:"Compliance standards familiar with: FAA regulations, ISO 9001, AS9100, etc."`

	// Work Style
	CommunicationStyle string `json:"communication_style,omitempty" description:"Preferred communication approach: direct, collaborative, analytical, expressive"`
	DecisionMaking     string `json:"decision_making,omitempty" description:"Decision-making approach: data_driven, intuitive, experience_based, consensus_seeking"`
	ProblemSolving     string `json:"problem_solving,omitempty" description:"Problem-solving style: innovative, systematic, practical, perfectionist"`
	LeadershipStyle    string `json:"leadership_style,omitempty" description:"Leadership approach: authoritative, democratic, coaching, delegative, transformational"`
	ConflictResolution string `json:"conflict_resolution,omitempty" description:"Conflict handling: competing, accommodating, avoiding, collaborating, compromising"`

	// Methodologies
	Methodologies []string `json:"methodologies,omitempty" description:"Known methodologies: Agile, Scrum, Lean, Six Sigma, Waterfall, DevOps"`

	// Cognitive Style
	ThinkingPattern       string `json:"thinking_pattern,omitempty" description:"Cognitive approach: divergent, convergent, systematic, critical"`
	LearningStyle         string `json:"learning_style,omitempty" description:"Learning preference: activist, theorist, reflector, pragmatist"`
	InformationProcessing string `json:"information_processing,omitempty" description:"Information processing: visual, auditory, kinesthetic, reading/writing"`
	ProblemFraming        string `json:"problem_framing,omitempty" description:"Problem framing approach: analytical, intuitive, holistic, experimental"`

	// Motivation and Values
	PrimaryDrive     string   `json:"primary_drive,omitempty" description:"Main motivation: achievement, relationship, growth, stability"`
	ValueOrientation string   `json:"value_orientation,omitempty" description:"Primary values: innovation, efficiency, quality, user_satisfaction"`
	CareerGoals      []string `json:"career_goals,omitempty" description:"Professional aspirations"`
	Motivators       []string `json:"motivators,omitempty" description:"What drives them: recognition, autonomy, mastery, purpose, compensation"`
	WorkLifeBalance  string   `json:"work_life_balance,omitempty" description:"Work-life balance preference: work_centric, balanced, life_centric"`

	// Interaction Preferences
	PreferredMeetingFormat string `json:"preferred_meeting_format,omitempty" description:"Meeting preference: structured, informal, mixed"`
	FeedbackStyle          string `json:"feedback_style,omitempty" description:"Feedback approach: direct, diplomatic, detailed, big_picture"`
	CollaborationMode      string `json:"collaboration_mode,omitempty" description:"Work mode: independent, collaborative, flexible"`
	RemoteWorkPreference   string `json:"remote_work,omitempty" description:"Remote work preference: remote_first, hybrid, office_first"`
	TeamSizePreference     string `json:"team_size,omitempty" description:"Preferred team size: small_team(2-5), medium_team(6-10), large_team(11+)"`
}

var GenIntervieweeTool = NewTool[*Interviewee]("generate-interviewee-profile", "Prepare a character profile based on the specified task requirements for system goal. The function analyzes the task description and creates an appropriate personality with relevant attributes.", func(param *Interviewee) {
	SharedMemory["Interviewee"] = param
	keySaveMemory.HMSet(SharedMemory)
})
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
