package main

import (
	"fmt"
	"time"

	"github.com/doptime/doptime/httpserve"
	"github.com/doptime/doptime/libapi"
	"github.com/doptime/evolab/batchop"
	"github.com/doptime/evolab/evolab"
	"github.com/doptime/evolab/models"
	"github.com/doptime/evolab/query"
	"github.com/doptime/evolab/toolagents"
	"github.com/doptime/redisdb"
)

// Perform reasoning
var MCTSTrajectory = &query.Query{
	Created: time.Now().Unix(),
	Model:   models.ModelQwen72B.Name,
	MsgUser: `I have a 9 yrs old daughter, I want's help here with her using a funny | interesting | breath taking | deep-diving | emotion arousing story. 
Remember, The Most Important thing is building the experience. If can not, Others Fade Away, because she's somehow formidable with her work.
Learn meters, decimeters, and centimeters through a perceptual way. Encode it in a 6,000-word suspense detective novel.
This requires conceiving the outline of the novel, with a lot of twists and turns. There should be 30+ applications of meters, decimeters, and centimeters in total.
The topics include detective, suspense, horror, secret love, elementary school students, experiments, and docks.
Clues: 1.8m fence, 20cm lowered, 15cm scratched, 70cm footprint, 10cm scale, 12cm scale, 500ml beaker, 480ml actual, 2m deep pool, 3 days soaked, 60cm specimen, 1.5m high cabinet, 0.01mm particle, 90cm fracture, 100 boxes, 1m high box, 50kg weight, 1/100 reduction, 1cm cube, 5cm miniature man, 0.5mm DNA, 150cm tall, 148cm tall, 10cm device, 5kg weight loss, 5mm growth, 7mm pupil, 90cm cube, 2cm insect, 30cm sinking, 2m high robot, 2cm lengthened, 0.1% volume, 0.01mm error, 3mm clone, 1km2 city, 40cm reduction
Analyze & very impressive visual depict of each clue needed.Third person perspective。
`}

func main() {
	talk := &toolagents.Talk{
		TalkId:  "q:" + redisdb.NanoId(8),
		Content: "如何识别伯努利分布",
	}
	err := toolagents.KeyTalk.HSet(talk.TalkId, talk)
	if err != nil {
		fmt.Println(err)
	}
	toolagents.EvoLabOS.Run(map[string]interface{}{})
	return
	//config.LoadToml()
	httpserve.Debug()
	libapi.EnableLibapi()
	evolab.EnableEvoLabe()
	time.Sleep(100000000 * time.Second)
	// err := MCTSTrajectory.Solute()
	// if err == nil {
	// 	batchop.CopyToClipboard(MCTSTrajectory)
	// }
	// var KeyTreeNode = db.HashKey[string, *Query]()
	// mp, _ := query.KeyTreeNode.HGetAll()

	// for _, v := range mp {
	// 	query.NodesMap.Set(v.Id, v)
	// }
	// query.NodesMap.Set("root", MCTSTrajectory)
	// if node, ok := query.NodesMap.Get("root"); ok {
	// 	MCTSTrajectory = node
	// }
	// if query.NodesMap.Count() == 0 {
	// 	query.NodesMap.Set("root", MCTSTrajectory)
	// }
	problemReformulated, err := batchop.ProblemReformulation(MCTSTrajectory)
	if err != nil {
		return
	}
	msgBest := batchop.SelectBestNode(problemReformulated...)

	batchop.ProblemSolving(msgBest)

}
