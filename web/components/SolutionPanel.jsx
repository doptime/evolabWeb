"use client";
// components/SolutionPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSolutionNodesAPI, updateSolutionNodeAPI, deleteSolutionNodeAPI, serverSideNodeOperationAPI,
  loadStateFromSessionStorage, saveStateToSessionStorage
} from '../lib/api'; // Adjust path as needed
import {
  IconSearch, IconRefactor, IconShuffle, IconLock, IconUnlock, IconTrash, IconCopy,
  IconPrev, IconNext, IconTree, IconEye, IconEyeOff, IconSortAsc, IconSortDesc,
  IconCheckBox, IconCheckBoxOutline
} from './icons'; // Adjust path

const SolutionPanel = () => {
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingItemContent, setEditingItemContent] = useState('');
  const editInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuperEdges, setShowSuperEdges] = useState(true);
  const [showNonSuperEdges, setShowNonSuperEdges] = useState(true);
  
  const [sortConfig, setSortConfig] = useState({ key: 'ChapterSession', direction: 'asc' });

  // For GoTo functionality
  const [editHistory, setEditHistory] = useState([]); // Array of Node IDs
  const [currentEditHistoryIndex, setCurrentEditHistoryIndex] = useState(-1);
  const [incrementalNodePath, setIncrementalNodePath] = useState([]); // Array of Node IDs
  const [currentIncrementalPathIndex, setCurrentIncrementalPathIndex] = useState(-1);
  
  const [expandedChapters, setExpandedChapters] = useState({}); // { "chapterId": true/false }

  // Load initial data and state
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchSolutionNodesAPI();
      setNodes(data);
      // Initialize expanded state for all chapters based on a default (e.g. all expanded)
      const initialExpanded = {};
      const chapterSessions = new Set(data.map(n => n.ChapterSession.split('.')[0])); // Top level
      chapterSessions.forEach(cs => initialExpanded[cs] = true);
      setExpandedChapters(loadStateFromSessionStorage('expandedChapters', initialExpanded));

      // Setup history from loaded nodes
      const incNodes = data.filter(n => n.Incremental).map(n => n.Id);
      setIncrementalNodePath(incNodes);
      setCurrentIncrementalPathIndex(loadStateFromSessionStorage('currentIncrementalPathIndex', incNodes.length > 0 ? 0 : -1));
    };
    loadData();
    setSelectedNodeId(loadStateFromSessionStorage('selectedSolutionNodeId', null));
    setShowSuperEdges(loadStateFromSessionStorage('showSuperEdges', true));
    setShowNonSuperEdges(loadStateFromSessionStorage('showNonSuperEdges', true));
    setSortConfig(loadStateFromSessionStorage('solutionSortConfig', { key: 'ChapterSession', direction: 'asc' }));
    setEditHistory(loadStateFromSessionStorage('editHistory', []));
    setCurrentEditHistoryIndex(loadStateFromSessionStorage('currentEditHistoryIndex', -1));

  }, []);

  // Save state to session storage
  useEffect(() => saveStateToSessionStorage('selectedSolutionNodeId', selectedNodeId), [selectedNodeId]);
  useEffect(() => saveStateToSessionStorage('showSuperEdges', showSuperEdges), [showSuperEdges]);
  useEffect(() => saveStateToSessionStorage('showNonSuperEdges', showNonSuperEdges), [showNonSuperEdges]);
  useEffect(() => saveStateToSessionStorage('solutionSortConfig', sortConfig), [sortConfig]);
  useEffect(() => saveStateToSessionStorage('expandedChapters', expandedChapters), [expandedChapters]);
  useEffect(() => saveStateToSessionStorage('editHistory', editHistory), [editHistory]);
  useEffect(() => saveStateToSessionStorage('currentEditHistoryIndex', currentEditHistoryIndex), [currentEditHistoryIndex]);
  useEffect(() => saveStateToSessionStorage('currentIncrementalPathIndex', currentIncrementalPathIndex), [currentIncrementalPathIndex]);


  const handleServerOperation = async (operationType, payload = {}) => {
    try {
      const updatedNodes = await serverSideNodeOperationAPI(operationType, payload);
      setNodes(updatedNodes);
      // Re-evaluate incremental path if needed
      if (operationType === 'updateElo' || operationType === 'reorganizeChapters') {
        const incNodes = updatedNodes.filter(n => n.Incremental).map(n => n.Id);
        setIncrementalNodePath(incNodes);
        if (!incNodes.includes(incrementalNodePath[currentIncrementalPathIndex])) {
            setCurrentIncrementalPathIndex(incNodes.length > 0 ? 0 : -1);
        }
      }
      alert(`${operationType} completed!`);
    } catch (error) {
      console.error(`Error during ${operationType}:`, error);
      alert(`Failed to ${operationType}.`);
    }
  };
  
  const handleSearch = async () => {
    const results = await fetchSolutionNodesAPI(searchTerm);
    setNodes(results);
  };

  const toggleNodeProperty = async (nodeId, property) => {
    const node = nodes.find(n => n.Id === nodeId);
    if (node) {
      try {
        const updatedNode = await updateSolutionNodeAPI({ Id: nodeId, [property]: !node[property] });
        setNodes(prev => prev.map(n => n.Id === nodeId ? updatedNode : n));
        if (property === 'Incremental') { // Update incremental path
            const newIncPath = nodes.map(n => n.Id === nodeId ? updatedNode : n)
                                    .filter(n => n.Incremental)
                                    .map(n => n.Id);
            setIncrementalNodePath(newIncPath);
            // try to keep current index or reset
            const newIndex = newIncPath.indexOf(nodeId);
            setCurrentIncrementalPathIndex(newIndex !== -1 ? newIndex : (newIncPath.length > 0 ? 0 : -1));
        }
      } catch (error) {
        console.error(`Error toggling ${property} for node ${nodeId}:`, error);
        alert(`Failed to toggle ${property}.`);
      }
    }
  };

  const handleDeleteNode = async (nodeId) => {
    if (!nodeId) return;
    if (confirm('Are you sure you want to delete this node (mark as Archived)?')) {
      try {
        await deleteSolutionNodeAPI(nodeId);
        setNodes(prev => prev.filter(n => n.Id !== nodeId));
        if (selectedNodeId === nodeId) setSelectedNodeId(null);
        if (editingNodeId === nodeId) setEditingNodeId(null);
        // Update history/paths if deleted node was part of them
        setEditHistory(prev => prev.filter(id => id !== nodeId));
        setIncrementalNodePath(prev => prev.filter(id => id !== nodeId));
        // Adjust current indices if needed (simplified here)
        if (currentEditHistoryIndex >= editHistory.filter(id => id !== nodeId).length) setCurrentEditHistoryIndex(editHistory.filter(id => id !== nodeId).length -1);
        if (currentIncrementalPathIndex >= incrementalNodePath.filter(id => id !== nodeId).length) setCurrentIncrementalPathIndex(incrementalNodePath.filter(id => id !== nodeId).length -1);

      } catch (error) {
        console.error(`Error deleting node ${nodeId}:`, error);
        alert("Failed to delete node.");
      }
    }
  };

  const handleCopyToClipboard = (nodeId) => {
    const node = nodes.find(n => n.Id === nodeId);
    if (node) {
      const { Id, Pathname, ChapterSession, Item } = node;
      const textToCopy = `ID: ${Id}\nPath: ${Pathname}\nChapter: ${ChapterSession}\nItem: ${Item}`;
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Node reference copied to clipboard!'))
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };
  
  const navigateHistory = (direction, type) => {
    if (type === 'edit') {
      let newIndex = currentEditHistoryIndex + direction;
      if (newIndex >= 0 && newIndex < editHistory.length) {
        setCurrentEditHistoryIndex(newIndex);
        setSelectedNodeId(editHistory[newIndex]);
        // Optionally scroll to the item
      }
    } else if (type === 'incremental') {
      let newIndex = currentIncrementalPathIndex + direction;
      if (newIndex >= 0 && newIndex < incrementalNodePath.length) {
        setCurrentIncrementalPathIndex(newIndex);
        setSelectedNodeId(incrementalNodePath[newIndex]);
      }
    }
  };

  const handleDoubleClickNode = (node) => {
    setEditingNodeId(node.Id);
    setEditingItemContent(node.Item);
    setSelectedNodeId(node.Id);
    // Add to edit history
    const newHistory = [...editHistory.filter(id => id !== node.Id), node.Id];
    setEditHistory(newHistory);
    setCurrentEditHistoryIndex(newHistory.length - 1);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };
  
  const handleSaveNodeEdit = async (nodeId) => {
    if (!editingItemContent.trim()) {
      alert("Node item content cannot be empty.");
      // No temporary new node for solutions, editing existing only.
      setEditingNodeId(null);
      return;
    }
    try {
      const updatedNode = await updateSolutionNodeAPI({ Id: nodeId, Item: editingItemContent });
      setNodes(prev => prev.map(n => n.Id === nodeId ? updatedNode : n));
      // Update edit history (node already added on double click, this confirms edit)
      const newHistory = [...editHistory.filter(id => id !== nodeId), nodeId]; // move to end
      setEditHistory(newHistory);
      setCurrentEditHistoryIndex(newHistory.length -1);

    } catch (error) {
      console.error("Error saving node:", error);
      alert("Failed to save node.");
    } finally {
      setEditingNodeId(null);
    }
  };

  const handleCancelNodeEdit = () => {
    setEditingNodeId(null);
    setEditingItemContent('');
  };
  
  const handleNodeKeyDown = useCallback((event, nodeId) => {
    const node = nodes.find(n => n.Id === nodeId);
    if (!node) return;

    if (editingNodeId === nodeId) { // Editing mode
      if (event.key === 'Escape') {
        handleCancelNodeEdit();
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSaveNodeEdit(nodeId);
      }
    } else if (selectedNodeId === nodeId) { // Selection mode
      if (event.key === 'Enter') {
        event.preventDefault();
        handleDoubleClickNode(node); // Start editing
      } else if (event.key.toLowerCase() === 'd' && document.activeElement?.tagName !== 'INPUT') {
         if (event.repeat) return;
            const pressedOnce = event.target.dataset.pressedD;
            if (pressedOnce) {
                delete event.target.dataset.pressedD;
                handleDeleteNode(selectedNodeId);
            } else {
                event.target.dataset.pressedD = "true";
                setTimeout(() => {
                    delete event.target.dataset.pressedD;
                }, 300); 
            }
      }
    }
  }, [editingNodeId, selectedNodeId, nodes, editingItemContent, editHistory]);

  const filteredNodes = nodes
    .filter(n => (showSuperEdges && n.SuperEdge) || (showNonSuperEdges && !n.SuperEdge));

  const sortedNodes = [...filteredNodes].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return sortConfig.direction === 'asc' ? comparison : comparison * -1;
  });

  // Group nodes by ChapterSession for rendering
  const groupedNodes = sortedNodes.reduce((acc, node) => {
    const chapterKey = node.ChapterSession.split('.')[0]; // Group by top-level chapter for expand/collapse
    if (!acc[chapterKey]) {
      acc[chapterKey] = {
        fullSessionName: node.ChapterSession, // Store the first full name for display
        nodes: []
      };
    }
    // Find the most specific chapter name for the group header if multiple nodes share a root chapterKey
    if (node.ChapterSession.length > acc[chapterKey].fullSessionName.length && node.ChapterSession.startsWith(chapterKey + ".")) {
        // Only update if it's a more general version within the same top-level group (e.g. prefer "3" over "3.1")
    } else if (node.ChapterSession.length < acc[chapterKey].fullSessionName.length && acc[chapterKey].fullSessionName.startsWith(node.ChapterSession + ".")) {
         acc[chapterKey].fullSessionName = node.ChapterSession;
    } else if (!acc[chapterKey].fullSessionName.includes(".")) { // if current header is top level (e.g. "3") and new node is more specific (e.g. "3.1"), keep top level for header.
        // Or if the new node's chapter is simpler (e.g. "3" when header was "3.1"), update to "3"
        if (node.ChapterSession.split('.').length < acc[chapterKey].fullSessionName.split('.').length) {
            acc[chapterKey].fullSessionName = node.ChapterSession;
        }
    }


    acc[chapterKey].nodes.push(node);
    return acc;
  }, {});

  const chapterOrder = Object.keys(groupedNodes).sort((a,b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });


  const getNodeItemClasses = (node) => {
    let classes = "p-3 border-b border-base-300 cursor-pointer hover:bg-base-200 transition-colors";
    if (node.Id === selectedNodeId) classes += " bg-primary text-primary-content";
    if (node.Id === editingNodeId) classes += " ring-2 ring-accent ring-inset";
    if (node.Locked) classes += " bg-neutral/30"; // Locked color
    if (node.Incremental) classes += " border-l-4 border-warning"; // Incremental color
    return classes;
  };

  const getIndentationLevel = (chapterSession) => {
    return chapterSession.split('.').length -1;
  }

  const toggleChapterExpand = (chapterKey) => {
    setExpandedChapters(prev => ({...prev, [chapterKey]: !prev[chapterKey]}));
  }
  
  const changeSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };


  return (
    <div className="w-[60vw] h-screen flex flex-col bg-base-100">
      {/* Top Toolbar */}
      <div className="h-[10vh] p-2 flex flex-wrap items-center gap-1 border-b border-base-300 bg-base-200 overflow-x-auto">
        <div className="join">
          <input type="text" placeholder="Semantic Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input input-sm input-bordered join-item w-32" />
          <button onClick={handleSearch} className="btn btn-sm btn-neutral join-item"><IconSearch size={16}/></button>
        </div>
        <div className="dropdown dropdown-hover">
          <button tabIndex={0} role="button" className="btn btn-sm btn-outline">Server Ops <IconTree size={16} className="ml-1"/></button>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-52 text-xs">
            <li><button onClick={() => handleServerOperation('supplementSuperEdge')} className="btn btn-xs btn-ghost justify-start">补充超边节点</button></li>
            <li><button onClick={() => handleServerOperation('updateElo')} className="btn btn-xs btn-ghost justify-start">新节点Elo更新</button></li>
            <li><button onClick={() => handleServerOperation('reorganizeChapters')} className="btn btn-xs btn-ghost justify-start">整理章节/路径</button></li>
            <li><button onClick={() => handleServerOperation('refactorDependencies')} className="btn btn-xs btn-ghost justify-start">普通节点依赖重构</button></li>
          </ul>
        </div>
        
        <button onClick={() => selectedNodeId && toggleNodeProperty(selectedNodeId, 'Locked')} className="btn btn-sm btn-outline" disabled={!selectedNodeId || editingNodeId === selectedNodeId}>
            {nodes.find(n=>n.Id === selectedNodeId)?.Locked ? <IconUnlock size={16}/> : <IconLock size={16}/>} Lock
        </button>
        <button onClick={() => selectedNodeId && toggleNodeProperty(selectedNodeId, 'Incremental')} className="btn btn-sm btn-outline" disabled={!selectedNodeId || editingNodeId === selectedNodeId}>
            <IconShuffle size={16}/> Incr
        </button>
        <button onClick={() => handleDeleteNode(selectedNodeId)} className="btn btn-sm btn-error btn-outline" disabled={!selectedNodeId || editingNodeId === selectedNodeId}><IconTrash size={16}/>Del</button>
        <button onClick={() => selectedNodeId && handleCopyToClipboard(selectedNodeId)} className="btn btn-sm btn-outline" disabled={!selectedNodeId}><IconCopy size={16}/>Ref</button>

        <div className="join">
            <button onClick={() => navigateHistory(-1, 'incremental')} className="btn btn-sm btn-outline join-item" disabled={currentIncrementalPathIndex <= 0}><IconPrev size={16}/>Inc</button>
            <button onClick={() => navigateHistory(1, 'incremental')} className="btn btn-sm btn-outline join-item" disabled={currentIncrementalPathIndex < 0 || currentIncrementalPathIndex >= incrementalNodePath.length - 1}><IconNext size={16}/>Inc</button>
        </div>
         <div className="join">
            <button onClick={() => navigateHistory(-1, 'edit')} className="btn btn-sm btn-outline join-item" disabled={currentEditHistoryIndex <= 0}><IconPrev size={16}/>Edit</button>
            <button onClick={() => navigateHistory(1, 'edit')} className="btn btn-sm btn-outline join-item" disabled={currentEditHistoryIndex < 0 || currentEditHistoryIndex >= editHistory.length - 1}><IconNext size={16}/>Edit</button>
        </div>
        
        <label className="label cursor-pointer gap-1 text-xs">
          {showSuperEdges ? <IconCheckBox size={16}/> : <IconCheckBoxOutline size={16}/>} SuperEdges
          <input type="checkbox" checked={showSuperEdges} onChange={() => setShowSuperEdges(s => !s)} className="checkbox checkbox-xs hidden" />
        </label>
        <label className="label cursor-pointer gap-1 text-xs">
          {showNonSuperEdges ? <IconCheckBox size={16}/> : <IconCheckBoxOutline size={16}/>} Non-Super
          <input type="checkbox" checked={showNonSuperEdges} onChange={() => setShowNonSuperEdges(s => !s)} className="checkbox checkbox-xs hidden" />
        </label>

        <div className="dropdown dropdown-hover">
          <button tabIndex={0} role="button" className="btn btn-sm btn-ghost">
            Sort: {sortConfig.key} {sortConfig.direction === 'asc' ? <IconSortAsc size={14}/> : <IconSortDesc size={14}/>}
          </button>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow bg-base-100 rounded-box w-40 text-xs">
            <li><button className={`btn btn-xs btn-ghost justify-start ${sortConfig.key === 'CreateAt' ? 'btn-active':''}`} onClick={() => changeSort('CreateAt')}>Created At</button></li>
            <li><button className={`btn btn-xs btn-ghost justify-start ${sortConfig.key === 'ChapterSession' ? 'btn-active':''}`} onClick={() => changeSort('ChapterSession')}>Chapter</button></li>
            <li><button className={`btn btn-xs btn-ghost justify-start ${sortConfig.key === 'Pathname' ? 'btn-active':''}`} onClick={() => changeSort('Pathname')}>PathName</button></li>
            <li><button className={`btn btn-xs btn-ghost justify-start ${sortConfig.key === 'EditAt' ? 'btn-active':''}`} onClick={() => changeSort('EditAt')}>Edit Time</button></li>
          </ul>
        </div>
      </div>

      {/* Node List */}
      <div className="flex-grow overflow-y-auto" tabIndex={-1} onKeyDown={(e) => handleNodeKeyDown(e, selectedNodeId)}>
        {chapterOrder.map(chapterKey => {
          const group = groupedNodes[chapterKey];
          const isExpanded = expandedChapters[chapterKey] === undefined ? true : expandedChapters[chapterKey]; // Default to expanded
          const topLevelChapterName = group.fullSessionName; // Use the derived name
          
          return (
            <div key={chapterKey} className="border-b border-base-300">
              <div 
                className="p-2 font-semibold bg-base-200/50 cursor-pointer hover:bg-base-300/70 flex items-center"
                onClick={() => toggleChapterExpand(chapterKey)}
              >
                {isExpanded ? '⊖' : '⊕'} ChapterSession: {topLevelChapterName} ({group.nodes.length} items)
              </div>
              {isExpanded && group.nodes.map(node => {
                const indentLevel = getIndentationLevel(node.ChapterSession);
                return (
                  <div
                    key={node.Id}
                    className={getNodeItemClasses(node)}
                    style={{ paddingLeft: `${1 + indentLevel * 1.5}rem` }} // Indentation
                    onClick={() => {if(editingNodeId !== node.Id) setSelectedNodeId(node.Id)}}
                    onDoubleClick={() => handleDoubleClickNode(node)}
                    tabIndex={0}
                  >
                    {editingNodeId === node.Id ? (
                      <div>
                        <textarea
                          ref={editInputRef}
                          className="textarea textarea-bordered w-full text-sm"
                          value={editingItemContent}
                          onChange={e => setEditingItemContent(e.target.value)}
                          rows={3}
                          onKeyDown={(e) => handleNodeKeyDown(e, node.Id)}
                        />
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleSaveNodeEdit(node.Id)} className="btn btn-xs btn-success">Save</button>
                          <button onClick={() => handleCancelNodeEdit()} className="btn btn-xs btn-ghost">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">
                            {node.Incremental && <span title="Incremental" className="text-warning mr-1">✨</span>}
                            {node.Locked && <IconLock size={12} className="inline mr-1 opacity-70" title="Locked"/>}
                            {node.Item}
                        </p>
                        <p className="text-xs opacity-70 mt-1">
                          [Id: {node.Id}] {node.SuperEdge ? <span className="badge badge-outline badge-accent badge-xs">SuperEdge</span> : ''}
                          {node.Importance !== undefined && ` importance:${node.Importance}`}
                          {node.Priority !== undefined && ` priority:${node.Priority}`}
                          {node.Elo ? ` Elo:${node.Elo.toFixed(2)}` : ''}
                        </p>
                        <p className="text-xs opacity-50 mt-1">Path: {node.Pathname} | Session: {node.ChapterSession}</p>
                        <p className="text-xs opacity-50">Edited: {new Date(node.EditAt).toLocaleString()}</p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
        {sortedNodes.length === 0 && <p className="p-4 text-center text-base-content/50">No solution nodes found or match filter.</p>}
      </div>
    </div>
  );
};

export default SolutionPanel;