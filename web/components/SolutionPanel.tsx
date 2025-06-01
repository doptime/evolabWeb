"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, CircleIcon, Info, RefreshCw, Search } from "lucide-react";
import { hashKey } from "doptime-client";

export interface SolutionGraphNode {
  Id: string;
  BulletDescription: string;
  Content: string;
  Pathname: string;
  SuperEdge: boolean;
  Importance: number;
  Priority: number;
  Locked: boolean;
  UpdatedAt: Date;
}

const keyAntiAgingNodes = new hashKey<SolutionGraphNode>("AntiAgingNodes");

export default function SolutionPanel() {
  const [solutionNodes, setSolutionNodes] = useState<SolutionGraphNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<SolutionGraphNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingBulletContent, setEditingBulletContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterText, setFilterText] = useState("");
  const [sortKey, setSortKey] = useState("UpdatedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showSuperEdges, setShowSuperEdges] = useState(true);
  const [showNonSuperEdges, setShowNonSuperEdges] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    try {
      const nodes = await keyAntiAgingNodes.hVals();
      setSolutionNodes(nodes);
    } finally {
      setIsLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    let result = solutionNodes.filter(node =>
      (showSuperEdges && !!node.SuperEdge) || (showNonSuperEdges && !node.SuperEdge)
    );

    if (filterText) {
      result = result.filter(node =>
        node.Pathname.toLowerCase().includes(filterText.toLowerCase()) ||
        node.BulletDescription.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    result = result.sort((a, b) => {
      const valA = sortKey === "UpdatedAt"
        ? new Date(a.UpdatedAt).getTime()
        : a.Pathname;

      const valB = sortKey === "UpdatedAt"
        ? new Date(b.UpdatedAt).getTime()
        : b.Pathname;

      return sortDirection === "asc"
        ? valA < valB ? -1 : 1
        : valA > valB ? -1 : 1;
    });

    setFilteredNodes(result);
  }, [solutionNodes, showSuperEdges, filterText, sortKey, sortDirection,showNonSuperEdges]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedNodeId) return;

    if (e.key === "Enter" && !editingNodeId) {
      const node = solutionNodes.find(n => n.Id === selectedNodeId);
      if (node && !node.Locked) {
        setEditingNodeId(node.Id);
        setEditingBulletContent(node.BulletDescription);
        setTimeout(() => editInputRef.current?.focus(), 0);
      }
    }
    else if (e.key === "d" && editingNodeId === null) {
      const node = solutionNodes.find(n => n.Id === selectedNodeId);
      if (node) {
        keyAntiAgingNodes.hDel(node.Id);
        setSolutionNodes(prev => prev.filter(n => n.Id !== node.Id));
      }
    }
    else if (e.key === "c" && e.key === "f" && editingNodeId === null) {
      const node = solutionNodes.find(n => n.Id === selectedNodeId);
      if (node) {
        navigator.clipboard.writeText(`Id: ${node.Id}\nPathName: ${node.Pathname}`);
      }
    }
    else if (e.key === "Escape" && editingNodeId) {
      setEditingNodeId(null);
    }
  }, [selectedNodeId, editingNodeId, solutionNodes]);

  useEffect(() => {
    const panel = panelRef.current;
    panel?.addEventListener("keydown", handleKeyDown);
    return () => panel?.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleToggleLocked = async (id: string) => {
    const node = solutionNodes.find(n => n.Id === id);
    if (node) {
      const updated = { ...node, Locked: !node.Locked };
      await keyAntiAgingNodes.hSet(id, updated);
      setSolutionNodes(prev =>
        prev.map(n => n.Id === id ? updated : n)
      );
    }
  };

  const handleSaveEdit = async () => {
    if (editingNodeId) {
      const node = solutionNodes.find(n => n.Id === editingNodeId);
      if (node) {
        const updated = {
          ...node,
          BulletDescription: editingBulletContent,
          UpdatedAt: new Date()
        };
        await keyAntiAgingNodes.hSet(editingNodeId, updated);
        setSolutionNodes(prev =>
          prev.map(n => n.Id === editingNodeId ? updated : n)
        );
        setEditingNodeId(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-100 w-full" ref={panelRef} tabIndex={0}>
      <div className="p-2 bg-base-200 border-b flex flex-col gap-2 sticky top-0 z-10">
        <div className="flex flex-wrap gap-2 items-center">
          <button className="btn btn-sm btn-outline">整理章节和路径名称</button>
          <button className="btn btn-sm btn-outline">普通节点依赖性重构</button>

          <label className="label cursor-pointer gap-4 text-xs bg-gray-200 px-2 rounded">
            <input
              type="checkbox"
              checked={showSuperEdges}
              onChange={() => setShowSuperEdges(!showSuperEdges)}
              className="checkbox checkbox-xs checkbox-primary mx-2"
            />
            <span>SuperEdge</span>

            <input
              type="checkbox"
              checked={showNonSuperEdges}
              onChange={() => setShowNonSuperEdges(!showNonSuperEdges)}
              className="checkbox checkbox-xs checkbox-primary  mx-2"
            />
            <span>Non SuperEdge</span>
          </label>

          <div className="flex gap-1 w-1/4  mx-2">
            <input
              type="text"
              placeholder="语义搜索..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered w-full"
            />
            <button onClick={fetchNodes} className="btn btn-sm btn-primary">
              <Search size={16} />
            </button>
          </div>

          <div className="tooltip" data-tip="选中后: Enter编辑, d删除, cf复制">
            <Info size={18} className="text-base-content/70 cursor-help" />
          </div>

          <button onClick={fetchNodes} className="btn btn-sm btn-ghost ml-auto">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="过滤列表 (Enter生效, Esc取消)"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            onKeyDown={e => e.key === "Escape" && setFilterText("")}
            className="input input-sm input-bordered mx-2 w-1/4"
          />

          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold">排序:</span>
            <label className="label cursor-pointer gap-1 text-xs">
              <input
                type="radio"
                name="sortKey"
                checked={sortKey === "UpdatedAt"}
                onChange={() => setSortKey("UpdatedAt")}
                className="radio radio-xs radio-primary"
              />
              <span>TM</span>
            </label>
            <label className="label cursor-pointer gap-1 text-xs">
              <input
                type="radio"
                name="sortKey"
                checked={sortKey === "Pathname"}
                onChange={() => setSortKey("Pathname")}
                className="radio radio-xs radio-primary"
              />
              <span>Path</span>
            </label>

            <label className="label cursor-pointer gap-1 text-xs">
              <input
                type="radio"
                name="sortDir"
                checked={sortDirection === "asc"}
                onChange={() => setSortDirection("asc")}
                className="radio radio-xs radio-secondary"
              />
              <span>升序</span>
            </label>
            <label className="label cursor-pointer gap-1 text-xs">
              <input
                type="radio"
                name="sortDir"
                checked={sortDirection === "desc"}
                onChange={() => setSortDirection("desc")}
                className="radio radio-xs radio-secondary"
              />
              <span>降序</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-2">
        {isLoading && <div className="text-center py-4">加载中...</div>}

        {!isLoading && filteredNodes.length === 0 && (
          <div className="text-center py-10 text-base-content/60">无匹配节点</div>
        )}

        {filteredNodes.map(node => {
          const isSelected = node.Id === selectedNodeId;
          const isEditing = node.Id === editingNodeId;

          return (
            <div
              key={node.Id}
              className={`mb-2 p-3 rounded-lg border ${isSelected
                  ? "bg-amber-100 dark:bg-amber-800/40 ring-2 ring-amber-400"
                  : "bg-base-200 hover:bg-base-300"
                }`}
              onClick={() => !isEditing && setSelectedNodeId(node.Id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm">
                  Path: <span className="opacity-80">{node.Pathname}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLocked(node.Id);
                    }}
                    className="btn btn-xs btn-ghost p-0"
                  >
                    {node.Locked
                      ? <CheckCircle2 size={16} className="text-blue-500" />
                      : <CircleIcon size={16} className="text-gray-400" />
                    }
                  </button>
                  <span className={`text-xs px-2 py-1 rounded ${node.Locked ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                    {node.Locked ? "Locked" : "Unlocked"}
                  </span>
                </div>
              </div>

              {isEditing ? (
                <textarea
                  ref={editInputRef}
                  value={editingBulletContent}
                  onChange={e => setEditingBulletContent(e.target.value)}
                  onBlur={handleSaveEdit}
                  className="textarea textarea-bordered w-full mb-2"
                  autoFocus
                />
              ) : (
                <p 
                  className="whitespace-pre-wrap mb-2 cursor-pointer"
                  onDoubleClick={() => {
                    if (!node.Locked) {
                      setEditingNodeId(node.Id);
                      setEditingBulletContent(node.BulletDescription);
                    }
                  }}
                >
                  {node.BulletDescription || <span className="italic opacity-60">无描述</span>}
                  <br />
                  {node.Content || <span className="italic opacity-60">无Content</span>}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70">
                <span>ID: {node.Id}</span>
                {node.SuperEdge && <span className="text-primary">SuperEdge</span>}
                <span>重要性: {node.Importance}</span>
                <span>优先级: {node.Priority}</span>
                <span>更新: {new Date(node.UpdatedAt).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}