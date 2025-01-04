package utils

import (
	"regexp"
	"strings"
)

func ExtractTagValue(str, tag string, caseSensative bool) (val string) {
	str = strings.ReplaceAll(str, "\r", "")
	if !caseSensative {
		val = strings.ToLower(str)
		tag = strings.ToLower(tag)
	}

	ind := strings.Index(val, tag)
	if ind > 0 {
		ind += len(tag)
		//remove empty lines \n, to fetch value in next line
		for ind < len(str) && (str[ind] == '\n' || str[ind] == ':' || str[ind] == '"' || str[ind] == ')' || str[ind] == '*' || str[ind] == '#') {
			ind++
		}
		for ind < len(str)-1 && (strings.Index(str[ind:ind+2], "：") == 0) {
			ind++
		}
	}
	if ind > 0 && ind < len(str) {
		field := str[ind:]
		field = strings.Split(field, "\n")[0]
		//remove :：** “ "” and space
		// 使用正则表达式移除不需要的字符
		var reg = regexp.MustCompile(`[\-:：*" #()]`)
		field = reg.ReplaceAllString(field, "")
		return field
	}
	return ""
}
