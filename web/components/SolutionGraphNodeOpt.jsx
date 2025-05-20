// components/SolutionGraphNodeOpt.jsx
// TODO: Implement actual API calls with backend. For now, using mock data and localStorage/sessionStorage.

// Re-using helper functions from BacklogDataOpt or define them here if preferred
export const loadStateFromSessionStorage = (key, defaultValue) => {
    try {
      const serializedState = sessionStorage.getItem(key);
      if (serializedState === null) {
        return defaultValue;
      }
      return JSON.parse(serializedState);
    } catch (e) {
      console.warn("Error loading state from session storage:", e);
      return defaultValue;
    }
  };
  
  export const saveStateToSessionStorage = (key, state) => {
    try {
      const serializedState = JSON.stringify(state);
      sessionStorage.setItem(key, serializedState);
    } catch (e) {
      console.warn("Error saving state to session storage:", e);
    }
  };
  
  let mockSolutionNodes = [
    { Id: 'hGg', Item: 'Leveraging Smartphone SoC Technology for Core Control: Utilize cost-effective processing, sensors, and communication components derived from smartphone SoCs within a robust flight control system architecture (potentially hybrid or hardened).', SuperEdge: true, SuperEdgeNodes: [], Importance: 9, Priority: 0, Elo: 1030.50, ChapterSession: '1', Pathname: '/core/soc-control', Locked: false, Incremental: false, UpdateAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), EditAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { Id: '8FBi', Item: 'Safety, Reliability, and Regulatory Compliance', SuperEdge: true, SuperEdgeNodes: [], Importance: 10, Priority: 0, Elo: 1041.00, ChapterSession: '2', Pathname: '/safety/compliance', Locked: true, Incremental: false, UpdateAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), EditAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { Id: 'jujJ', Item: 'Standardized Modular Interfaces (Mechanical, Power, Data)', SuperEdge: true, SuperEdgeNodes: ['aui'], Importance: 10, Priority: 1, Elo: 1038.00, ChapterSession: '3', Pathname: '/interfaces/modular-standards', Locked: false, Incremental: true, UpdateAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), EditAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { Id: 'aui', Item: '支持无线充电的模块化电池架构', SuperEdge: false, SuperEdgeNodes: [], Importance: 9, Priority: 0, Elo: 1020.00, ChapterSession: '3.1', Pathname: '/interfaces/modular-battery', Locked: false, Incremental: false, UpdateAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), EditAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    { Id: 'fox', Item: '机身(包裹)可拆卸，可以动态装配到固定翼和多旋翼无人机上。', SuperEdge: false, SuperEdgeNodes: [], Importance: 9, Priority: 0, Elo: 1015.00, ChapterSession: '3.1.1', Pathname: '/airframe/detachable-body', Locked: false, Incremental: true, UpdateAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), EditAt: new Date().toISOString() },
    { Id: 'kLmN', Item: 'Advanced Sensor Fusion Algorithms', SuperEdge: false, SuperEdgeNodes: [], Importance: 8, Priority: 2, Elo: 1025.00, ChapterSession: '1.1', Pathname: '/core/sensor-fusion', Locked: false, Incremental: false, UpdateAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), EditAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
  ];
  
  
  export const fetchSolutionNodesAPI = async (searchTerm = '') => {
    // Simulate API call
    console.log(`API: Fetching solution nodes... (Search: "${searchTerm}")`);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return Promise.resolve(
        mockSolutionNodes.filter(node =>
          node.Item.toLowerCase().includes(lowerSearchTerm) ||
          node.Pathname.toLowerCase().includes(lowerSearchTerm) ||
          node.ChapterSession.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    return Promise.resolve([...mockSolutionNodes]);
  };
  
  export const updateSolutionNodeAPI = async (updatedNodeData) => {
    // Simulate API call
    console.log("API: Updating solution node...", updatedNodeData);
    await new Promise(resolve => setTimeout(resolve, 300));
    mockSolutionNodes = mockSolutionNodes.map(n =>
      n.Id === updatedNodeData.Id ? { ...n, ...updatedNodeData, EditAt: new Date().toISOString() } : n
    );
    const updated = mockSolutionNodes.find(n => n.Id === updatedNodeData.Id);
    return Promise.resolve(updated);
  };
  
  export const deleteSolutionNodeAPI = async (nodeId) => {
    // Simulate API call
    console.log("API: Deleting solution node...", nodeId);
    await new Promise(resolve => setTimeout(resolve, 300));
    mockSolutionNodes = mockSolutionNodes.filter(n => n.Id !== nodeId);
    return Promise.resolve({ success: true, id: nodeId });
  };
  
  export const serverSideNodeOperationAPI = async (operation, payload = {}) => {
    // Simulate server-side operations that return a new list of nodes
    console.log(`API: Performing server operation "${operation}"...`, payload);
    await new Promise(resolve => setTimeout(resolve, 500));
    // For demonstration, some operations might add a mock node or slightly alter existing ones.
    // In a real scenario, the backend would perform significant logic.
    if (operation === 'supplementSuperEdge') {
      // mockSolutionNodes.push({ Id: `newSE-${Date.now()}`, Item: 'New SuperEdge from Server Op', SuperEdge: true, ChapterSession: '99', Pathname: '/server-ops/new-se', Locked: false, Incremental: true, UpdateAt: new Date().toISOString(), EditAt: new Date().toISOString(), Importance: 7, Priority: 1 });
      alert("Mock 'supplementSuperEdge' triggered. In a real app, this would update nodes.");
    } else if (operation === 'updateElo') {
      mockSolutionNodes.forEach(n => { if (n.Elo) n.Elo += 10; else n.Elo = 1000; });
      alert("Mock 'updateElo' triggered. Node Elo scores hypothetically updated.");
    } else if (operation === 'reorganizeChapters') {
       alert("Mock 'reorganizeChapters' triggered. Node chapters/paths hypothetically updated.");
    } else if (operation === 'refactorDependencies') {
       alert("Mock 'refactorDependencies' triggered. Node dependencies hypothetically refactored.");
    }
    // Return the potentially modified list
    return Promise.resolve([...mockSolutionNodes]);
  };