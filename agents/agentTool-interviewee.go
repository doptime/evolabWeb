package agents

// Interviewee represents a simulated individual in the multi-agent system
type Interviewee struct {
	// Basic Information
	//SimilarFamousPerson []string `json:"similar_famous_person" description:"Similar famous person: name"`
	Name   string `json:"name" description:"Unique name for the Interviewee"`
	Gender string `json:"gender" description:"Gender identity: male, female, non_binary, other"`
	Age    int    `json:"age" description:"Age in years: 20-65"`

	// Geographic and Cultural Background
	Country        string   `json:"country" description:"Country of residence: ISO 3166-1 alpha-2 codes"`
	Region         string   `json:"region" description:"Geographic region: north_america, south_america, europe, asia_pacific, middle_east, africa"`
	TimeZone       string   `json:"timezone" description:"Time zone: IANA time zone database name"`
	CultureGroup   string   `json:"culture_group" description:"Cultural background: western, eastern, latin, african, middle_eastern, south_asian, east_asian, southeast_asian"`
	NativeLanguage string   `json:"native_language" description:"Native language: ISO 639-1 code"`
	OtherLanguages []string `json:"other_languages" description:"Other languages spoken: ISO 639-1 codes"`
	LanguageLevels []string `json:"language_levels" description:"Proficiency levels for other languages: native, fluent, intermediate, basic"`

	// Professional Role
	Title              string   `json:"title" description:"Professional role: software_architect, frontend_engineer, backend_engineer, devops_engineer, test_engineer, ui_ux_designer, data_engineer, security_engineer, product_manager, project_manager, agile_coach, tech_lead, business_analyst, domain_expert, marketing_specialist, user_researcher"`
	YearsExperience    int      `json:"years_experience" description:"Years of professional experience: 0-40"`
	ExpertiseLevel     string   `json:"expertise_level" description:"Level of expertise: expert, senior, intermediate, junior"`
	Specializations    []string `json:"specializations" description:"Specific areas of specialization within the role"`
	IndustryExperience []string `json:"industry_experience" description:"Previous industry experience: finance, healthcare, retail, technology, education, manufacturing, etc."`

	// Personality Traits (OCEAN Model)
	Openness          int    `json:"openness" description:"Openness to experience score: 0-100"`
	Conscientiousness int    `json:"conscientiousness" description:"Conscientiousness score: 0-100"`
	Extraversion      int    `json:"extraversion" description:"Extraversion score: 0-100"`
	Agreeableness     int    `json:"agreeableness" description:"Agreeableness score: 0-100"`
	Neuroticism       int    `json:"neuroticism" description:"Neuroticism score: 0-100"`
	RiskTolerance     string `json:"risk_tolerance" description:"Approach to risk: risk_averse, moderate, risk_taking"`
	AdaptabilityLevel string `json:"adaptability" description:"Adaptability to change: highly_adaptable, moderately_adaptable, change_resistant"`
	StressResponse    string `json:"stress_response" description:"Response to stress: resilient, moderate, sensitive"`

	// Work Style
	CommunicationStyle string `json:"communication_style" description:"Preferred communication approach: direct, collaborative, analytical, expressive"`
	DecisionMaking     string `json:"decision_making" description:"Decision-making approach: data_driven, intuitive, experience_based, consensus_seeking"`
	ProblemSolving     string `json:"problem_solving" description:"Problem-solving style: innovative, systematic, practical, perfectionist"`
	LeadershipStyle    string `json:"leadership_style" description:"Leadership approach: authoritative, democratic, coaching, delegative, transformational"`
	ConflictResolution string `json:"conflict_resolution" description:"Conflict handling: competing, accommodating, avoiding, collaborating, compromising"`

	// Technical Skills
	Technologies      []string `json:"technologies" description:"List of known technologies and tools"`
	TechProficiencies []string `json:"tech_proficiencies" description:"Proficiency levels for each technology: expert, advanced, intermediate, beginner"`
	TechYearsOfUse    []int    `json:"tech_years_of_use" description:"Years of experience for each technology: 0-40"`

	// Domain Knowledge
	Domains      []string `json:"domains" description:"Areas of domain expertise"`
	DomainLevels []string `json:"domain_levels" description:"Expertise level for each domain: expert, advanced, intermediate, beginner"`
	DomainYears  []int    `json:"domain_years" description:"Years of experience in each domain: 0-40"`

	// Methodologies and Certifications
	Methodologies  []string `json:"methodologies" description:"Known methodologies: agile, scrum, kanban, waterfall, lean, devops, etc."`
	Certifications []string `json:"certifications" description:"Professional certifications"`
	CertProviders  []string `json:"cert_providers" description:"Certification providers"`
	CertValidUntil []string `json:"cert_valid_until" description:"Certification expiration dates: YYYY-MM-DD"`

	// Cognitive Style
	ThinkingPattern       string `json:"thinking_pattern" description:"Cognitive approach: divergent, convergent, systematic, critical"`
	LearningStyle         string `json:"learning_style" description:"Learning preference: activist, theorist, reflector, pragmatist"`
	InformationProcessing string `json:"information_processing" description:"Information processing: visual, auditory, kinesthetic, reading/writing"`
	ProblemFraming        string `json:"problem_framing" description:"Problem framing approach: analytical, intuitive, holistic, experimental"`

	// Motivation and Values
	PrimaryDrive     string   `json:"primary_drive" description:"Main motivation: achievement, relationship, growth, stability"`
	ValueOrientation string   `json:"value_orientation" description:"Primary values: innovation, efficiency, quality, user_satisfaction"`
	CareerGoals      []string `json:"career_goals" description:"Professional aspirations"`
	Motivators       []string `json:"motivators" description:"What drives them: recognition, autonomy, mastery, purpose, compensation"`
	WorkLifeBalance  string   `json:"work_life_balance" description:"Work-life balance preference: work_centric, balanced, life_centric"`

	// Interaction Preferences
	PreferredMeetingFormat string `json:"preferred_meeting_format" description:"Meeting preference: structured, informal, mixed"`
	FeedbackStyle          string `json:"feedback_style" description:"Feedback approach: direct, diplomatic, detailed, big_picture"`
	CollaborationMode      string `json:"collaboration_mode" description:"Work mode: independent, collaborative, flexible"`
	RemoteWorkPreference   string `json:"remote_work" description:"Remote work preference: remote_first, hybrid, office_first"`
	TeamSizePreference     string `json:"team_size" description:"Preferred team size: small_team(2-5), medium_team(6-10), large_team(11+)"`

	// Cultural Dimensions
	PowerDistance        int    `json:"power_distance" description:"Power distance preference score: 0-100"`
	Individualism        int    `json:"individualism" description:"Individualism vs collectivism score: 0-100"`
	UncertaintyAvoidance int    `json:"uncertainty_avoidance" description:"Uncertainty avoidance score: 0-100"`
	TimeOrientation      string `json:"time_orientation" description:"Time orientation: long_term, short_term, balanced"`

	// Emotional Intelligence
	EmotionalAwareness  int `json:"emotional_awareness" description:"Self-awareness score: 0-100"`
	EmotionalRegulation int `json:"emotional_regulation" description:"Emotional control score: 0-100"`
	SocialSkills        int `json:"social_skills" description:"Social competence score: 0-100"`

	// Career Development
	CareerStage     string `json:"career_stage" description:"Current career stage: early_career, mid_career, senior, executive"`
	GrowthDirection string `json:"growth_direction" description:"Desired career progression: technical, managerial, specialist, entrepreneur"`
	MentorshipStyle string `json:"mentorship_style" description:"Mentoring approach: directive, supportive, delegative, hands_off"`
}

var IntervieweeAgent = NewTool[*Interviewee]("gen-or-change-interviewee-for-topic", "Prepare a character profile based on the specified task requirements for system goal. The function analyzes the task description and creates an appropriate personality with relevant attributes.")
