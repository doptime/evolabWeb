``` mermaid 
classDiagram
    class ParticipantUtterance {
        +String content
        +DateTime createdAt
    }
    
    class InterviewScript {
        +List~String~ topics
        +Map~String,String~ questions
        +Map~String,Int~ timeLimits
    }
    
    class AIInterviewerMemory {
        +List~String~ conversationHistory
        +String currentTopic
        +Int timeSpent
        +List~Reflection~ reflections
        +processUtterance(utterance)
        +updateReflection(reflection)
        +determineNextQuestion()
    }
    
    class Reflection {
        +String expertType
        +List~String~ observations
        +DateTime createdAt
    }
    
    class NextQuestion {
        +String actionType
        +String questionContent
        +String topic
    }

    ParticipantUtterance ..> AIInterviewerMemory : inputs
    InterviewScript ..> AIInterviewerMemory : guides
    AIInterviewerMemory --> Reflection : generates
    AIInterviewerMemory --> NextQuestion : determines
    ```