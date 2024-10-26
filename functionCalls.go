package evolab
&tools.FunctionTool{
	Name:        "RedisHKeyTalk.HSet",
	Parameters: tools.Parameters{
		Type: "object",
		Properties: map[string]tools.Property{
			"talkId": { Type: "string" },
			"talkString": {
				Type:        "string",
				Description: "Content of the talk",
			},
		},
		Required: []string{"talkId", "talkString"},
	},
	Function: RedisHKeyTalk.HSet,
},
&tools.FunctionTool{
	Name:        "RedisHKeyTalk.HDel",
	Parameters: tools.Parameters{
		Type: "object",
		Properties: map[string]tools.Property{
			"talkId": { Type: "string" },
		},
		Required: []string{"talkId"},
	},
	Function: RedisHKeyTalk.HDel,
},
&tools.FunctionTool{
	Name:        "RedisHKeyTalk.HMGet",
	Parameters: tools.Parameters{
		Type: "object",
		Properties: map[string]tools.Property{
			"talkIds": {
				Type:        "[] string",
			},
		},
		Required: []string{"talkId"},
	},
	Function: RedisHKeyTalk.HMGet,
},