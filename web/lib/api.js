// lib/api.js

// --- Mock Data ---
const initialMockBacklogs = [
    { Id: 'b1', Info: 'Initial backlog item 1', Reference: 'REF-001', Sponsor: 'Client A', CreateAt: new Date(Date.now() - 100000).toISOString(), EditAt: new Date(Date.now() - 50000).toISOString(), Expired: false, Accomplished: false },
    { Id: 'b2', Info: 'Another backlog item, this one is accomplished', Reference: 'REF-002', Sponsor: 'Client B', CreateAt: new Date(Date.now() - 200000).toISOString(), EditAt: new Date(Date.now() - 150000).toISOString(), Expired: false, Accomplished: true },
    { Id: 'b3', Info: 'Expired item', Reference: 'REF-003', Sponsor: 'Client A', CreateAt: new Date(Date.now() - 300000).toISOString(), EditAt: new Date(Date.now() - 250000).toISOString(), Expired: true, Accomplished: false },
  ];
  
  const initialMockSolutionNodes = [
    { Id: 'sg1', Item: 'Leveraging Smartphone SoC Technology for Core Control', SuperEdge: true, SuperEdgeNodes: [], Importance: 9, Priority: 0, Elo: 0, ChapterSession: '1', Pathname: 'CoreControl/SoC', Locked: false, Incremental: true, CreateAt: new Date(Date.now() - 500000).toISOString(), EditAt: new Date(Date.now() - 50000).toISOString() },
    { Id: 'sg2', Item: 'Safety, Reliability, and Regulatory Compliance', SuperEdge: true, SuperEdgeNodes: [], Importance: 10, Priority: 0, Elo: 1041.00, ChapterSession: '2', Pathname: 'Safety/Compliance', Locked: true, Incremental: false, CreateAt: new Date(Date.now() - 400000).toISOString(), EditAt: new Date(Date.now() - 100000).toISOString() },
    { Id: 'sg3', Item: 'Standardized Modular Interfaces (Mechanical, Power, Data)', SuperEdge: true, SuperEdgeNodes: ['sg4'], Importance: 10, Priority: 1, Elo: 1038.00, ChapterSession: '3', Pathname: 'Interfaces/Modular', Locked: false, Incremental: false, CreateAt: new Date(Date.now() - 300000).toISOString(), EditAt: new Date(Date.now() - 200000).toISOString() },
    { Id: 'sg4', Item: '支持无线充电的模块化电池架构', SuperEdge: false, SuperEdgeNodes: [], Importance: 9, Priority: 0, Elo: 0, ChapterSession: '3', Pathname: 'Interfaces/Battery', Locked: false, Incremental: true, CreateAt: new Date(Date.now() - 250000).toISOString(), EditAt: new Date(Date.now() - 180000).toISOString() },
    { Id: 'sg5', Item: '机身(包裹)可拆卸，可以动态装配到固定翼和多旋翼无人机上。', SuperEdge: true, SuperEdgeNodes: [], Importance: 9, Priority: 0, Elo: 0, ChapterSession: '3.1', Pathname: 'Airframe/ModularDesign', Locked: false, Incremental: false, CreateAt: new Date(Date.now() - 200000).toISOString(), EditAt: new Date(Date.now() - 120000).toISOString() },
    { Id: 'sg6', Item: 'Another item in Chapter 1', SuperEdge: false, SuperEdgeNodes: [], Importance: 7, Priority: 2, Elo: 0, ChapterSession: '1', Pathname: 'CoreControl/Another', Locked: false, Incremental: false, CreateAt: new Date(Date.now() - 100000).toISOString(), EditAt: new Date(Date.now() - 30000).toISOString() },
  ];
  
  // --- Backlog API Mocks ---
  export const fetchBacklogsAPI = async () => {
    console.log("API: Fetching backlogs...");
    // TODO: Implement actual API call
    return new Promise(resolve => setTimeout(() => resolve([...initialMockBacklogs]), 500));
  };
  
  export const createBacklogAPI = async (backlogData) => {
    console.log("API: Creating backlog...", backlogData);
    // TODO: Implement actual API call
    const newBacklog = { ...backlogData, Id: `b${Date.now()}`, CreateAt: new Date().toISOString(), EditAt: new Date().toISOString() };
    initialMockBacklogs.push(newBacklog); // Simulate DB update
    return new Promise(resolve => setTimeout(() => resolve(newBacklog), 300));
  };
  
  export const updateBacklogAPI = async (backlogData) => {
    console.log("API: Updating backlog...", backlogData);
    // TODO: Implement actual API call
    const index = initialMockBacklogs.findIndex(b => b.Id === backlogData.Id);
    if (index !== -1) {
      initialMockBacklogs[index] = { ...initialMockBacklogs[index], ...backlogData, EditAt: new Date().toISOString() };
      return new Promise(resolve => setTimeout(() => resolve(initialMockBacklogs[index]), 300));
    }
    return Promise.reject("Backlog not found");
  };
  
  export const deleteBacklogAPI = async (backlogId) => {
    console.log("API: Deleting backlog...", backlogId);
    // TODO: Implement actual API call
    const index = initialMockBacklogs.findIndex(b => b.Id === backlogId);
    if (index !== -1) {
      initialMockBacklogs.splice(index, 1); // Simulate DB update
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));
    }
    return Promise.reject("Backlog not found");
  };
  
  
  // --- SolutionGraphNode API Mocks ---
  export const fetchSolutionNodesAPI = async (searchTerm = "") => {
    console.log(`API: Fetching solution nodes (search: "${searchTerm}")...`);
    // TODO: Implement actual API call
    // Simulate semantic search if searchTerm is present
    let nodes = [...initialMockSolutionNodes];
    if (searchTerm) {
      nodes = nodes.filter(node => node.Item.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return new Promise(resolve => setTimeout(() => resolve(nodes), 500));
  };
  
  export const updateSolutionNodeAPI = async (nodeData) => {
    console.log("API: Updating solution node...", nodeData);
    // TODO: Implement actual API call
    const index = initialMockSolutionNodes.findIndex(n => n.Id === nodeData.Id);
    if (index !== -1) {
      initialMockSolutionNodes[index] = { ...initialMockSolutionNodes[index], ...nodeData, EditAt: new Date().toISOString() };
      return new Promise(resolve => setTimeout(() => resolve(initialMockSolutionNodes[index]), 300));
    }
    return Promise.reject("Node not found");
  };
  
  export const deleteSolutionNodeAPI = async (nodeId) => {
    console.log("API: Deleting solution node (marking as Archieved)...", nodeId);
    // TODO: Implement actual API call
    // For this mock, we'll just filter it out, but in reality, you might set an 'Archieved' flag.
    const index = initialMockSolutionNodes.findIndex(n => n.Id === nodeId);
    if (index !== -1) {
      // initialMockSolutionNodes[index].Archieved = true; // If you add Archieved to the model
      initialMockSolutionNodes.splice(index, 1);
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300));
    }
    return Promise.reject("Node not found");
  };
  
  export const serverSideNodeOperationAPI = async (operationType, payload) => {
    console.log(`API: Server-side operation "${operationType}" with payload:`, payload);
    // TODO: Implement actual API calls for:
    // 'supplementSuperEdge', 'updateElo', 'refactorDependencies', 'reorganizeChapters'
    // This mock will just return existing nodes after a delay.
    return new Promise(resolve => setTimeout(() => resolve([...initialMockSolutionNodes]), 700));
  };
  
  
  // --- Helper function for SessionStorage ---
  export const loadStateFromSessionStorage = (key, defaultValue) => {
    if (typeof window !== 'undefined') {
      const storedValue = sessionStorage.getItem(key);
      if (storedValue) {
        try {
          return JSON.parse(storedValue);
        } catch (e) {
          console.error(`Error parsing sessionStorage key "${key}":`, e);
          return defaultValue;
        }
      }
    }
    return defaultValue;
  };
  
  export const saveStateToSessionStorage = (key, value) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Error saving sessionStorage key "${key}":`, e);
      }
    }
  };