"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle as CircleIcon,
  AlertTriangle,
  Info,
  Edit3,
  X,
  RefreshCw,
  Search,
  ClipboardCopy,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";

// Helper for SessionStorage
const loadStateFromSessionStorage = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.warn(`Error loading state for ${key} from sessionStorage:`, error);
    return defaultValue;
  }
};

const saveStateToSessionStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving state for ${key} to sessionStorage:`, error);
  }
};

// Mock API calls - Will be moved to /components/BacklogDataOpt.jsx and /components/SolutionGraphNodeOpt.jsx
const fetchBacklogsAPI = async () => {
  await new Promise((r) => setTimeout(r, 500));
  return [
    {
      Id: "b1",
      Info: "Implement login flow",
      Reference: "AUTH-101",
      Sponsor: "Product Team",
      UpdateAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      EditAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      Expired: false,
      Done: false,
    },
    {
      Id: "b2",
      Info: "Fix bug in payment gateway",
      Reference: "BUG-123",
      Sponsor: "Engineering",
      UpdateAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      EditAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      Expired: true,
      Done: true,
    },
  ];
};

const fetchSolutionNodesAPI = async (searchTerm = "") => {
  await new Promise((r) => setTimeout(r, 500));
  const baseNodes = [
    {
      Id: "hGg",
      Item: "Leveraging Smartphone SoC Technology for Core Control...",
      SuperEdge: true,
      Importance: 9,
      Priority: 0,
      ChapterSession: "1",
      Pathname: "CoreControl.SoC",
      Locked: false,
      Incremental: true,
      UpdateAt: new Date().toISOString(),
      EditAt: new Date().toISOString(),
      Elo: 1000.0,
    },
    {
      Id: "8FBi",
      Item: "Safety, Reliability, and Regulatory Compliance",
      SuperEdge: true,
      Importance: 10,
      Priority: 0,
      ChapterSession: "2",
      Pathname: "Safety.Compliance",
      Locked: true,
      Incremental: false,
      UpdateAt: new Date().toISOString(),
      EditAt: new Date().toISOString(),
      Elo: 1041.0,
    },
  ];

  if (searchTerm) {
    return baseNodes.filter(
      (n) =>
        n.Item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.Pathname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return baseNodes;
};

const updateBacklogAPI = async (id, updates) => {
  await new Promise((r) => setTimeout(r, 300));
  return { id, ...updates, EditAt: new Date().toISOString() };
};

const deleteBacklogAPI = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  return true;
};

const updateSolutionNodeAPI = async (id, updates) => {
  await new Promise((r) => setTimeout(r, 300));
  return { id, ...updates, EditAt: new Date().toISOString() };
};

const deleteSolutionNodeAPI = async (id) => {
  await new Promise((r) => setTimeout(r, 300));
  return true;
};

const copyNodeReference = (node) => {
  const text = `Id: ${node.Id}\nPathName: ${node.Pathname}\nChapterSession: ${node.ChapterSession}`;
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
};

export default function SolutionPanel() {
  // Left Panel States
  const [backlogs, setBacklogs] = useState([]);
  const [selectedBacklogId, setSelectedBacklogId] = useState(null);
  const [editingBacklogId, setEditingBacklogId] = useState(null);
  const [editingBacklogContent, setEditingBacklogContent] = useState("");
  const [showExpired, setShowExpired] = useState(false);
  const [showDone, setShowDone] = useState(true);

  // Right Panel States
  const [solutionNodes, setSolutionNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingItemContent, setEditingItemContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterText, setFilterText] = useState("");
  const [sortKey, setSortKey] = useState("ChapterSession");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showSuperEdges, setShowSuperEdges] = useState(true);
  const [showIncremental, setShowIncremental] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const editInputRef = useRef(null);
  const panelRef = useRef(null);

  // Load from session storage
  useEffect(() => {
    fetchBacklogsAPI().then(setBacklogs);
    fetchSolutionNodesAPI().then(setSolutionNodes);

    setShowExpired(loadStateFromSessionStorage("showExpired", false));
    setShowDone(loadStateFromSessionStorage("showDone", true));
    setSelectedBacklogId(loadStateFromSessionStorage("selectedBacklogId", null));
    setSelectedNodeId(loadStateFromSessionStorage("selectedNodeId", null));
    setSortKey(loadStateFromSessionStorage("sortKey", "ChapterSession"));
    setSortDirection(loadStateFromSessionStorage("sortDirection", "asc"));
    setFilterText(loadStateFromSessionStorage("filterText", ""));
    setSearchTerm(loadStateFromSessionStorage("searchTerm", ""));
  }, []);

  // Save to session storage
  useEffect(() => saveStateToSessionStorage("showExpired", showExpired), [showExpired]);
  useEffect(() => saveStateToSessionStorage("showDone", showDone), [showDone]);
  useEffect(() => saveStateToSessionStorage("selectedBacklogId", selectedBacklogId), [selectedBacklogId]);
  useEffect(() => saveStateToSessionStorage("selectedNodeId", selectedNodeId), [selectedNodeId]);
  useEffect(() => saveStateToSessionStorage("sortKey", sortKey), [sortKey]);
  useEffect(() => saveStateToSessionStorage("sortDirection", sortDirection), [sortDirection]);
  useEffect(() => saveStateToSessionStorage("filterText", filterText), [filterText]);
  useEffect(() => saveStateToSessionStorage("searchTerm", searchTerm), [searchTerm]);

  // Key handler
  const handleKeyDown = useCallback(
    (e) => {
      const targetIsInput =
        document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA";

      if (editingBacklogId) {
        if (e.key === "Escape") {
          e.preventDefault();
          setEditingBacklogId(null);
          setEditingItemContent("");
        } else if (e.key === "Enter" && !e.shiftKey && targetIsInput) {
          e.preventDefault();
          handleSaveBacklogEdit(editingBacklogId, editingBacklogContent);
        }
      }

      if (selectedBacklogId && !editingBacklogId) {
        if (e.key.toLowerCase() === "d") {
          handleDeleteBacklog(selectedBacklogId);
        }
      }

      if (editingNodeId) {
        if (e.key === "Escape") {
          setEditingNodeId(null);
          setEditingItemContent("");
        } else if (e.key === "Enter" && !e.shiftKey && targetIsInput) {
          handleSaveNodeEdit(editingNodeId, editingItemContent);
        }
      }

      if (selectedNodeId && !editingNodeId) {
        if (e.key === "Enter") {
          const node = solutionNodes.find((n) => n.Id === selectedNodeId);
          setEditingNodeId(node.Id);
          setEditingItemContent(node.Item);
          setTimeout(() => editInputRef.current?.focus(), 0);
        } else if (e.key.toLowerCase() === "d") {
          handleDeleteNode(selectedNodeId);
        } else if (e.key.toLowerCase() === "c") {
          handleCopyNodeReference(selectedNodeId);
        }
      }
    },
    [editingBacklogId, editingNodeId, backlogs, solutionNodes]
  );

  useEffect(() => {
    panelRef.current?.addEventListener("keydown", handleKeyDown);
    return () => panelRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Filter and Sort
  const filteredSortedBacklogs = backlogs
    .filter((b) => (showExpired || !b.Expired))
    .filter((b) => (showDone || !b.Done))
    .sort((a, b) => {
      const valA = a[sortKey] || "";
      const valB = b[sortKey] || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const filteredSortedNodes = solutionNodes
    .filter((n) => (showSuperEdges || !n.SuperEdge))
    .filter((n) => (showIncremental || !n.Incremental))
    .filter((n) =>
      filterText
        ? n.ChapterSession.includes(filterText) ||
          n.Pathname.includes(filterText) ||
          n.Item.includes(filterText)
        : true
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (sortKey === "ChapterSession") {
        const partsA = valA.split(".").map(Number);
        const partsB = valB.split(".").map(Number);
        for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
          if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i];
        }
        return partsA.length - partsB.length;
      }
      return sortDirection === "asc"
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

  // Handlers
  const handleAddBacklog = () => {
    const newBacklog = {
      Id: Math.random().toString(36).substr(2, 9),
      Info: "New Backlog",
      Reference: "",
      Sponsor: "",
      UpdateAt: new Date().toISOString(),
      EditAt: new Date().toISOString(),
      Expired: false,
      Done: false,
    };
    setBacklogs([newBacklog, ...backlogs]);
    setSelectedBacklogId(newBacklog.Id);
    setEditingBacklogId(newBacklog.Id);
    setEditingBacklogContent(newBacklog.Info);
  };

  const handleDeleteBacklog = async (id) => {
    setIsLoading(true);
    try {
      await deleteBacklogAPI(id);
      setBacklogs(backlogs.filter((b) => b.Id !== id));
      if (selectedBacklogId === id) setSelectedBacklogId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBacklogEdit = async (id, content) => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const updated = await updateBacklogAPI(id, { Info: content });
      setBacklogs(backlogs.map((b) => (b.Id === id ? updated : b)));
      setEditingBacklogId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBacklog = (backlog) => {
    if (editingBacklogId) {
      handleSaveBacklogEdit(editingBacklogId, editingBacklogContent);
    }
    setSelectedBacklogId(backlog.Id);
  };

  const handleDoubleClickBacklog = (backlog) => {
    if (editingBacklogId === backlog.Id) return;
    if (editingBacklogId) handleSaveBacklogEdit(editingBacklogId, editingBacklogContent);
    setEditingBacklogId(backlog.Id);
    setEditingBacklogContent(backlog.Info);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleToggleStatus = (id, field) => {
    setBacklogs(
      backlogs.map((b) => (b.Id === id ? { ...b, [field]: !b[field] } : b))
    );
  };

  const handleCopyNodeReference = (id) => {
    const node = solutionNodes.find((n) => n.Id === id);
    if (node) copyNodeReference(node);
  };

  const handleDeleteNode = async (id) => {
    setIsLoading(true);
    try {
      await deleteSolutionNodeAPI(id);
      setSolutionNodes(solutionNodes.filter((n) => n.Id !== id));
      if (selectedNodeId === id) setSelectedNodeId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNodeEdit = async (id, content) => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const updated = await updateSolutionNodeAPI(id, { Item: content });
      setSolutionNodes(solutionNodes.map((n) => (n.Id === id ? updated : n)));
      setEditingNodeId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProperty = (id, prop) => {
    setSolutionNodes(
      solutionNodes.map((n) => (n.Id === id ? { ...n, [prop]: !n[prop] } : n))
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const data = await fetchSolutionNodesAPI(searchTerm);
    setSolutionNodes(data);
    setIsLoading(false);
  };

  const getIndentationLevel = (session) => session.split(".").length - 1;

  return (
    <div className="flex h-screen bg-base-100" ref={panelRef} tabIndex={-1}>

      {/* Right Panel */}
      <div className="w-[60vw] flex flex-col">
        {/* Top Toolbar */}
        <div className="h-[10vh] p-2 flex flex-col gap-2 border-b border-base-300 bg-base-200 sticky top-0 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn btn-sm btn-outline">整理章节和路径名称</button>
            <button className="btn btn-sm btn-outline">普通节点依赖性重构</button>
            <label className="label cursor-pointer gap-1 text-xs p-1 hover:bg-base-300/50 rounded">
              <input
                type="checkbox"
                checked={showSuperEdges}
                onChange={() => setShowSuperEdges(!showSuperEdges)}
                className="checkbox checkbox-xs checkbox-primary"
              />
              SuperEdge
            </label>
            <label className="label cursor-pointer gap-1 text-xs p-1 hover:bg-base-300/50 rounded">
              <input
                type="checkbox"
                checked={showIncremental}
                onChange={() => setShowIncremental(!showIncremental)}
                className="checkbox checkbox-xs checkbox-accent"
              />
              Incremental
            </label>
            <input
              type="text"
              placeholder="语义搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="input input-sm input-bordered w-full max-w-xs focus:ring-primary"
            />
            <button onClick={handleSearch} className="btn btn-sm btn-primary">
              <Search size={16} />
            </button>
            <div className="tooltip tooltip-bottom" data-tip="选中后按 dd 键删除；按 cf 键复制引用信息">
              <Info size={16} className="text-base-content/70 cursor-help" />
            </div>
            <button className="btn btn-sm btn-ghost ml-auto">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="过滤器..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="input input-sm input-bordered w-full max-w-xs"
            />

            <span className="text-xs font-semibold mr-1">排序:</span>
            <div className="join text-xs bg-amber-100 rounded-2xl m-1  space-x-2  flex flex-row p-2">
              <input
                className="join-item btn btn-xs "
                type="radio"
                name="sortKeyRadio"
                value="UpdateAt"
                checked={sortKey === "UpdateAt"}
                onChange={(e) => setSortKey(e.target.value)}
              /> <div>CreateTM</div>
              <input
                className="join-item btn btn-xs"
                type="radio"
                name="sortKeyRadio"
                value="ChapterSession"
                checked={sortKey === "ChapterSession"}
                onChange={(e) => setSortKey(e.target.value)}
              /> <div>ChapterSession</div>
              <input
                className="join-item btn btn-xs"
                type="radio"
                name="sortKeyRadio"
                value="Pathname"
                checked={sortKey === "Pathname"}
                onChange={(e) => setSortKey(e.target.value)}
              /> <div>Pathname</div>
            </div>
            <div className="join text-xs bg-amber-100 rounded-2xl m-1 space-x-2 flex flex-row  p-2">
              <input
                className="join-item btn btn-xs"
                type="radio"
                name="sortDirectionRadio"
                value="asc"
                checked={sortDirection === "asc"}
                onChange={(e) => setSortDirection(e.target.value)}
              /> <div>Asc</div>
              <input
                className="join-item btn btn-xs"
                type="radio"
                name="sortDirectionRadio"
                value="desc"
                checked={sortDirection === "desc"}
                onChange={(e) => setSortDirection(e.target.value)}
              /> <div>Dec</div> 
            </div>
          </div>
        </div>

        {/* Node List */}
        <div className="flex-grow overflow-y-auto p-2 bg-base-100">
          {isLoading && <div className="text-center py-4">加载中...</div>}
          {filteredSortedNodes.length === 0 && !isLoading && (
            <div className="text-center text-base-content/60 py-4">无数据</div>
          )}

          {filteredSortedNodes.map((node) => {
            const isSelected = node.Id === selectedNodeId;
            const isEditing = node.Id === editingNodeId;

            return (
              <div key={node.Id} className="mb-2">
                <div
                  className={`p-3 border rounded-md transition-colors duration-150 ${
                    isSelected
                      ? "bg-amber-100 dark:bg-amber-700/30"
                      : "hover:bg-base-200"
                  }`}
                  onClick={() => setSelectedNodeId(node.Id)}
                  onDoubleClick={() => {
                    setEditingNodeId(node.Id);
                    setEditingItemContent(node.Item);
                    setTimeout(() => editInputRef.current?.focus(), 0);
                  }}
                >
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-semibold">CS: {node.ChapterSession}</span>
                    <span>Path: {node.Pathname}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProperty(node.Id, "Locked");
                        }}
                        className="btn btn-xs btn-ghost p-0.5"
                      >
                        {node.Locked ? <CheckCircle2 size={14} /> : <CircleIcon size={14} />}
                      </button>
                      <span className={`badge badge-xs badge-neutral badge-outline`}>
                        {node.Locked ? "Locked" : "Unlocked"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleProperty(node.Id, "Incremental");
                        }}
                        className="btn btn-xs btn-ghost p-0.5"
                      >
                        {node.Incremental ? <CheckCircle2 size={14} /> : <CircleIcon size={14} />}
                      </button>
                      <span className={`badge badge-xs badge-info badge-outline`}>
                        {node.Incremental ? "Incr" : "Stable"}
                      </span>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      ref={editInputRef}
                      className="textarea textarea-bordered w-full text-sm"
                      value={editingItemContent}
                      onChange={(e) => setEditingItemContent(e.target.value)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{node.Item}</p>
                  )}

                  {isEditing && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleSaveNodeEdit(node.Id, editingItemContent)}
                        className="btn btn-xs btn-success"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNodeId(null)}
                        className="btn btn-xs btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-1 space-x-2">
                    <span>[Id: {node.Id}]</span>
                    <span className={node.SuperEdge ? "badge badge-xs badge-primary badge-outline" : ""}>
                      {node.SuperEdge ? "SuperEdge" : ""}
                    </span>
                    <span>Imp: {node.Importance}</span>
                    <span>Prio: {node.Priority}</span>
                    <span>Elo: {node.Elo?.toFixed(2)}</span>
                  </div>
                  <div className="text-xs opacity-50 mt-0.5">
                    编辑时间: {new Date(node.EditAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}