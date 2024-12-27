package evolab

import (
	"log"
	"os/exec"
	"text/template"

	"github.com/doptime/evolab/agents"
)

type LinuxCommand struct {
	Command string   `json:"command,omitempty" description:"The Linux command to execute"`
	Args    []string `json:"args,omitempty" description:"Arguments for the command"`
}

func executeCommand(param *LinuxCommand) {
	if param.Command == "" {
		log.Println("No command provided to execute.")
		return
	}

	// Create the command with arguments
	cmd := exec.Command(param.Command, param.Args...)

	// Combine stdout and stderr
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Error executing command '%s': %v\nOutput: %s", param.Command, err, string(output))
		return
	}

	// Log the successful output
	log.Printf("Command '%s' executed successfully.\nOutput:\n%s", param.Command, string(output))
}

var CmdTool = agents.NewTool[*LinuxCommand]("linuxcmd", "After all revisions are Ready, commit the file to the directory using this tool", executeCommand)

var EvoLabPrompt = template.Must(template.New("question").Parse(`You are an world-class AGI System, your are going to auto evolve the given system, bringing the system world-class performance.
Do not hast to finish the task in one response, this Prompt will be called 100 times, you can take your time to finish the task.

There are 3 actions you can take:
1. Evolute key ideas for the system. putted to rootPath/KeyDiscussions.evolutions
2. Create or refactor current files to evolute current system. using CmdTool to commit file change. the calling of CmdTool should be wrapped between <tool_call> ... <tool_call> pairs.

Your work style ∈ { John D. Rockefeller, Andrew Carnegie, Henry Ford, Walt Disney, Bill Gates, Steve Jobs, J.P. Morgan, Jack Ma, George Soros, Thomas Edison, Nikola Tesla, Vladimir Shukhov, Claude Shannon, Vannevar Bush, Alan Turing} or any other world-class enginner.

;This are Files in the directory:
{{range .Files}}
{{.}}
{{end}}
`))
var AgentEvolab = agents.NewAgent(EvoLabPrompt)
