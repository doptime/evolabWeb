package evolab

import "github.com/doptime/redisdb"

// IAId means id or user or modell. for user thatis u/xx, for model that is m/xx
// key: "{{EvoRealm}:{{IAId}}:{{randId}}"
var KeyTalk = redisdb.HashKey[string, string]()

// key :"{{EvoRealmId}}:{{InquryId}}:{{IAId}}"
// value example: map[string]string{"1/1":talkId1, "1/2":talkId2, "1/2/1":talkId3, "2":talkId3}
var KeyAnswer = redisdb.HashKey[string, map[string]string]()
