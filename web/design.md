
给我写一个reaact + taiwindcss+ DaisyUI +js 页面，以便我可以用在我的next.js 页面中.
尽可能用DaisyUI Components 来简化代码
不需要服务端渲染，要启用"use client";   
图标库仅考虑lucide-react,Font Awesome, Material Icons, Hero Icons,Ant Design Icons, Remix Icon, Feather Icons,  Ionicons,Eva Icons,Boxicons,Tabler Icons,
请直接引用这些Icon 而不依赖于其他的或自建的 图标库
返回的代码文件需要是完整的代码文件。可以直接替换现有的文件工作。

功能：
页面布局分为2栏目（总体来说，借鉴vscode 的解密布局）：
    - 左侧面板 40vw
        左侧顶部工具栏 5vh, 提供上下文相关的操作按钮
            - 按钮: + 创建一个新的 Backlog 节点     
            - CheckBox:Show Expired .是否显示过期的Backlog 
            - CheckBox:Show Done .是否显示Done的Backlog
            - 按钮: 删除选择的Backlog
            - 配色和布局，要给人愉快的美感
            补充新的需求：
            - Create Backlog 按钮应该有颜色，方便知道按钮的存在
            - 删除需求（现在的删除按钮离创建按钮太近了，容易误操作。）：按钮: 删除选择的Backlog
            - 在顶部按钮居右，添加一个OnHover ToolTpip, 提示选中后按dd键删除Backlog。
            - 顶部工具栏目高度调整 5vh
            - 按钮: + 创建一个新的 Backlog 节点    : Icon 和文字不要换行。
        scrum.Backlog列表. 提供创建和编辑Backlog的功能
            - 说明：所有的Backlog节点都按照编辑时间排序
            - 不考虑批量选择
            - 双击可以编辑Backlog节点
            - 默认从从后台查询Backlog列表 Backlog[]
            - 如果节点没有内容，前端放弃新建 Backlog
            - 按Esc 键可以取消编辑
            - 选中状态的节点可以按dd 键删除
            - BacklogList 按照EditAt时间排序，降序显示。
            - 颜色指示，对Done、Expired,选中的节点，编辑中的节点。分别使用合理的指示背景颜色
            - BackLog 修改，可以通过一个函数，自动同步到数据库。
            - 单击可以选中节点。同时结束对其它节点的选中状态，或退出其它节点的编辑状态。
            - 单击选中的节点，应该有比较显眼的暖背景色作为温和的提示。
            - 优化配色和布局，给人愉快的美感
            - Expired、Done 这两个状态 都用浅背景色的文本来表示
            - Expired、Done 这两个状态的前面面，分别添加一个 圆形打钩Icon Button /圆形未打钩Icon Button, 用来执行 Toggle Expired / Toggle Done

        左侧面板的数据结构：
            - 把数据相关的操作位于文件中/components/BacklogDataOpt.jsx，以便于后续的维护和扩展


    - 右侧面板 60vw, 提供创建和编辑SolutionGraphNode的功能
        - 右侧面板-右侧顶部工具栏 10vh, 提供上下文相关的操作按钮 .  整个布局采用两行布局
            - 第一行
              - Button 整理章节和路径名称:触发服务端返回新的SolutionGraphNode[]列表
              - Button 普通节点的依赖性重构 :触发服务端返回新的SolutionGraphNode[]列表
              - Checkbox: SuperEdge .是否显示SuperEdge
              - Checkbox: Incremental .是否显示Incremental条目：
              - 语义搜索, 服务端返回SolutionGraphNode[]列表,调整宽度为30vw
              - 右侧OnHover ToolTip, 提示：
                  - 选中后按dd键快速删除。
                  - 选中后按cf键快速复制节点的引用信息到剪贴板，Id, PathName, ChapterSession
              - Refresh 按钮。重新从数据库加载显示全部搜索结果（刷新），Refresh 位于顶部工具栏的最右侧
            - 第二行：
              - 过滤器: 通过输入框来过滤出需要显示的节点列表。预期通过这一项来显示对应的章节、目录等。过滤器按enter键生效，按esc键取消过滤
              - 排序:应用于整个列表.默认节点列表按照章节编号升序显示。 该用单行单行显示，保持简洁。每次改变选项触发重新排序。不需要使用额外的按钮和文字提示
                  - radio group 1: radio - CreatAt,按照创建时间排序 / radio - ChapterSession,按章节编号排序 （default） /radio - Path,按PathName编号排序
                  - radio group 2:  升序，降序
        - 右侧面板-右侧顶部工具栏需求增量：        
            - 修复功能，以便能看到关于快捷键的信息。现在无法看到快捷键的使用信息：右侧OnHover ToolTip, 提示：...
            - Sort Radio Group 1、Sort Radio Group 2 需要有文字提示，现在没有文字提示，无法直观理解：
              - 排序:应用于整个列表.默认节点列表按照章节编号升序显示。 该用单行单行显示，保持简洁。每次改变选项触发重新排序。不需要使用额外的按钮和文字提示
                  - radio group 1: radio - CreatTM,按照创建时间排序 / radio - CS,按ChapterSession编号排序 （default） /radio - Path,按PathName编号排序
                  - radio group 2:  Asc / 升序，Dec / 降序

        - 右侧面板-右侧节点列表可以:
            - 从后台查询节点列表 SolutionGraphNode[]
            - 可以双击节点。开始编辑
            - 可以单击选中节点。
            - 选中状态的节点按Enter键可以编辑节点
            - 选中状态的节点可以按dd 键删除（不需要额外确认）
            - 过滤器：可以通过输入框来过滤出需要显示的节点列表。预期通过这一项来显示对应的章节、目录等。过滤器按enter键生效，按esc键取消过滤
            - 节点的第一行是 ChapterSession: 1.1 Pathname:xxx {Toggle Locke Button}{Locked状态} {Toggle Incremental Button} {Incremental状态} 
            - Locked状态 用浅背景色的文本来表示,无论值真假都需要显示。它的前面是Toggle Locked的按钮(圆形打钩Icon Button /圆形未打钩Icon Button)，用来变更Locked状态
            - Incremental状态 用浅背景色的文本来表示,无论值真假都需要显示。它的前面是Toggle Incremental的按钮(圆形打钩Icon Button /圆形未打钩Icon Button)，用来变更Incremental状态
            - 单击可以选中节点。节点选中有比较显眼的暖背景色作为选中提醒。同时结束对其它节点的选中状态，或退出其它节点的编辑状态。
             
        - 右侧面板-节点列表需求增量：
            - 取消按照章节折叠：节点列表可以展开和折叠,就体验和效果来说，就像Reddit 那样。 (需要相应建立State管理)
            - 第二行过滤器宽度 15vw
            - 保留节点的缩进。按照章节编号的"." 数量来决定缩进的空格数。         
        右侧面板的数据结构：
            - 把数据相关的操作位于文件中/components/SolutionGraphNodeOpt.jsx，以便于后续的维护和扩展

关于API的说明
- 你只需要保留调用API的函数，具体的实现可以用假数据来模拟。然后留一行Todo, 由人类专家来实现。
- 如果你需要对数据进行封装、mixin等，请自行实现。
- 节点的状态通过SessionStorage来保存。以便页面刷新后，依然可以保持状态。


左边是scrum.Backlog列表,40vw. 
type Backlog struct {
    Id        string
	Info      string
	Reference string
	Sponsor   string
	UpdateAt  time.Time
    EditAt  time.Time
	Expired   bool
    Done bool
    
}
右侧是节点列表 60vw
type SolutionGraphNode struct {
	Id   string `description:"Required when update. Id, string, unique." milvus:"PK,in,out"`
	Item string `description:"Required when create. item of the solution. Bullet Name of Module, Constraints, Guidelines, Architecturals, Nexus or Specifications."`

	SuperEdge bool `description:"bool,true if the item is super edge of the solution graph. super edge 描述节点之间的协议,约定,约束,标准,规范,想法,技术路线,时间限制,资源限制,法律客户需求,反馈限制、层次化约束等 "`

	SuperEdgeNodes []string `description:"array of Ids. If this node is super edge. here lists the child nodes that belongs to this SuperEdge. SuperEdgeNodes不能包含超边节点，因为超边节点实际上是图的边而不是图的节点，超边包含超边会破坏图结构. \nRequired by SuperEdge item. update each time super edge revised. "`

	Importance int64 `description:"int, value >=- 1 and value<= 10, Importance. \nRequired when create; optional when update. making Importance < 0  to Remove the item."`
	Priority   int64 `description:"int, value >= 0 and value <= 10 . \n Required for module node. use in Gatt chart to determin the priority of the item. the lower the higher the priority."`

	EmbedingVector []float32 `description:"-" milvus:"dim=1024,index" `

	//初始添加的时候得分为0，Elo 后产生Elo分数
	Elo      float64                   `description:"-"`
	AllItems map[string]*SolutionGraphNode `description:"-" msgpack:"-"` //所有的条目
	ChapterSession  string                    `description:"-"`             //当前的会话
	Pathname  string                    `description:"Ascii pathname of current node。用来保存源码到文件以便编译；保存说明文档等. 或是用BulletName来表明文档的意图"`  
	//被人类专家标记为被接受的条目。Locked = true. 不能被删除和修改
	Locked bool `description:"-"`
	//属于是系统新产生调整增量
	Incremental bool `description:"-"`
	UpdateAt  time.Time `description:"-"`
    EditAt  time.Time `description:"-"`
}
右侧节点列表：
节点列表按节点章节排序并且显示,并按ChapterSession分组,并且依据ChapterSession 层级缩进
⊕ChapterSession:1 Core Control System Chapter   Item 1
Leveraging Smartphone SoC Technology for Core Control: Utilize cost-effective processing, sensors, and communication components derived from smartphone SoCs within a robust flight control system architecture (potentially hybrid or hardened). [Id:hGg SuperEdge  importance:9 priority:0]

⊕ChapterSession:2 Safety and Compliance Chapter Item 2
Safety, Reliability, and Regulatory Compliance [Id:8FBi SuperEdge importance:10 priority:0 Elo:1041.00]

⊖ChapterSession:3 Modular Interface Standards Chapter Item 2
Standardized Modular Interfaces (Mechanical, Power, Data) [Id:jujJ SuperEdge importance:10 priority:1 Elo:1038.00] 支持无线充电的模块化电池架构 [Id:aui importance:9 priority:0]
|    ChapterSession:3.1 Modular Airframe Design Subchapter Item 1
|    机身(包裹)可拆卸，可以动态装配到固定翼和多旋翼无人机上。 [Id:fox SuperEdge  importance:9 priority:0]
