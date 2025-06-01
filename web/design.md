
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


    - 右侧面板 60vw, 提供查看和编辑SolutionGraphNode的功能
        - 右侧面板-右侧顶部工具栏 10vh, 提供上下文相关的操作按钮 .  整个布局采用两行布局
            - 第一行
              - Button 整理章节和路径名称:触发服务端返回新的SolutionGraphNode[]列表(函数内容留空，由人类专家来实现)
              - Button 普通节点的依赖性重构 :触发服务端返回新的SolutionGraphNode[]列表
              - Checkbox group: SuperEdge:是否显示SuperEdge; NonSuperEdge:是否显示NonSuperEdge
              - 语义搜索, 服务端返回SolutionGraphNode[]列表,调整宽度为30vw
              - 右侧有 ToolTip 按钮, 提示：
                  - 选中后按dd键快速删除。
                  - 选中后按cf键快速复制节点的引用信息到剪贴板，Id, PathName
              - Refresh 按钮。重新从数据库加载显示全部搜索结果（刷新），Refresh 位于顶部工具栏的最右侧
            - 第二行：
              - 过滤器: 通过输入框来过滤出需要显示的节点列表。预期通过这一项来显示对应的章节、目录等。过滤器按enter键生效，按esc键取消过滤
              - Sort Radio Group 1、Sort Radio Group 2 需要有文字提示，现在没有文字提示，无法直观理解：
                - 排序:应用于整个列表.默认节点列表按照章节编号升序显示。 该用单行单行显示，保持简洁。每次改变选项触发重新排序。不需要使用额外的按钮和文字提示
                    - radio group 1: radio - TM,按照编辑时间排序 / radio - Path,按PathName编号排序
                  - radio group 2:  Asc / 升序，Dec / 降序

        - 右侧面板-右侧节点列表可以:
            - 从后台查询节点列表 SolutionGraphNode[]
            - 可以双击节点。开始编辑
            - 可以单击选中节点。
            - 选中状态的节点按Enter键可以编辑节点
            - 选中状态的节点可以按dd 键删除（不需要额外确认）
            - 过滤器：可以通过输入框来过滤出需要显示的节点列表。预期通过这一项来显示对应的章节、目录等。过滤器按enter键生效，按esc键取消过滤
            - 节点的第一行是 Pathname:xxx {Toggle Locke Button}{Locked状态} {Toggle Incremental Button} {Incremental状态} 
            - Locked状态 用浅背景色的文本来表示,无论值真假都需要显示。它的前面是Toggle Locked的按钮(圆形打钩Icon Button /圆形未打钩Icon Button)，用来变更Locked状态
            - Incremental状态 用浅背景色的文本来表示,无论值真假都需要显示。它的前面是Toggle Incremental的按钮(圆形打钩Icon Button /圆形未打钩Icon Button)，用来变更Incremental状态
            - 单击可以选中节点。节点选中有比较显眼的暖背景色作为选中提醒。同时结束对其它节点的选中状态，或退出其它节点的编辑状态。
            - 取消按照折叠和缩进：节点列表可以展开和折叠,就体验和效果来说，就像Reddit 那样。 (需要相应建立State管理)                
            - 按照最新的SolutionGraphNode数据结构，前端页面做相应修改
            - 现在不采用缩进，但是用不同的颜色来区分不同的Path根路径。用颜色深浅来区分层级的多少。

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