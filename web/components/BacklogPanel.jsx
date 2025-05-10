"use client";
// components/BacklogPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchBacklogsAPI, createBacklogAPI, updateBacklogAPI, deleteBacklogAPI,
  loadStateFromSessionStorage, saveStateToSessionStorage
} from '../lib/api'; // Adjust path as needed
// Assuming you have these icons. Adjust path and names as necessary.
import { IconPlus, IconTrash, IconCheckBox, IconCheckBoxOutline } from './icons';

const BacklogPanel = () => {
  const [backlogs, setBacklogs] = useState([]);
  const [selectedBacklogId, setSelectedBacklogId] = useState(null);
  const [editingBacklogId, setEditingBacklogId] = useState(null);
  const [editingContent, setEditingContent] = useState({ Info: '', Reference: '', Sponsor: '' });
  const [showExpired, setShowExpired] = useState(false);
  const [showAccomplished, setShowAccomplished] = useState(false); // New state
  const editInputRef = useRef(null);
  const backlogListRef = useRef(null); // Ref for the list container for dd keydown

  // Load initial data and state from session storage
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchBacklogsAPI();
      // Ensure EditAt is a valid Date for sorting, or use a robust parsing method
      setBacklogs(data.sort((a, b) => new Date(b.EditAt).getTime() - new Date(a.EditAt).getTime()));
    };
    loadData();
    setSelectedBacklogId(loadStateFromSessionStorage('selectedBacklogId', null));
    setShowExpired(loadStateFromSessionStorage('showExpiredBacklogs', false));
    setShowAccomplished(loadStateFromSessionStorage('showAccomplishedBacklogs', false)); // Load new state
  }, []);

  // Save state to session storage
  useEffect(() => saveStateToSessionStorage('selectedBacklogId', selectedBacklogId), [selectedBacklogId]);
  useEffect(() => saveStateToSessionStorage('showExpiredBacklogs', showExpired), [showExpired]);
  useEffect(() => saveStateToSessionStorage('showAccomplishedBacklogs', showAccomplished), [showAccomplished]); // Save new state

  const sortedAndFilteredBacklogs = backlogs
    .filter(b => (showExpired || !b.Expired) && (showAccomplished || !b.Accomplished))
    .sort((a, b) => new Date(b.EditAt).getTime() - new Date(a.EditAt).getTime());

  const handleCreateNew = () => {
    const newTempId = `new-${Date.now()}`;
    setEditingContent({ Info: '', Reference: '', Sponsor: '' });
    setEditingBacklogId(newTempId);
    setSelectedBacklogId(null); // Deselect others when creating new
    setBacklogs(prev => [{ Id: newTempId, Info: '', Reference: '', Sponsor: '', EditAt: new Date().toISOString(), CreateAt: new Date().toISOString(), Expired: false, Accomplished: false }, ...prev]);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = async (id) => {
    if (!editingContent.Info.trim()) {
      // alert("Backlog content cannot be empty."); // Consider a less intrusive notification
      if (id.startsWith('new-')) {
        setBacklogs(prev => prev.filter(b => b.Id !== id));
      }
      setEditingBacklogId(null);
      return;
    }
    try {
      let updatedBacklog;
      const payload = { ...editingContent, EditAt: new Date().toISOString() }; // Ensure EditAt is updated on save

      if (id.startsWith('new-')) {
        updatedBacklog = await createBacklogAPI({ ...payload, Expired: false, Accomplished: false });
        setBacklogs(prev => [updatedBacklog, ...prev.filter(b => b.Id !== id)].sort((a,b) => new Date(b.EditAt).getTime() - new Date(a.EditAt).getTime()));
      } else {
        const originalBacklog = backlogs.find(b => b.Id === id);
        updatedBacklog = await updateBacklogAPI({ Id: id, ...originalBacklog, ...payload });
        setBacklogs(prev => prev.map(b => b.Id === id ? updatedBacklog : b).sort((a,b) => new Date(b.EditAt).getTime() - new Date(a.EditAt).getTime()));
      }
      setSelectedBacklogId(updatedBacklog.Id);
    } catch (error) {
      console.error("Error saving backlog:", error);
      alert("Failed to save backlog.");
       if (id.startsWith('new-')) {
        setBacklogs(prev => prev.filter(b => b.Id !== id));
      }
    } finally {
      setEditingBacklogId(null);
    }
  };

  const handleItemClick = (backlogId) => {
    if (editingBacklogId && editingBacklogId !== backlogId) {
        // Optionally, ask to save changes if editingContent is dirty for editingBacklogId
        // For now, just cancel previous edit
        const currentEditingItem = backlogs.find(b => b.Id === editingBacklogId);
        if (currentEditingItem && editingBacklogId.startsWith('new-') && !editingContent.Info.trim()) {
             setBacklogs(prev => prev.filter(b => b.Id !== editingBacklogId));
        }
        setEditingBacklogId(null);
    }
    setSelectedBacklogId(backlogId);
  };

  const handleDoubleClickToEdit = (backlog) => {
    setEditingBacklogId(backlog.Id);
    setEditingContent({ Info: backlog.Info, Reference: backlog.Reference, Sponsor: backlog.Sponsor });
    setSelectedBacklogId(backlog.Id);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleCancelEdit = (id) => {
    if (id.startsWith('new-')) {
        setBacklogs(prev => prev.filter(b => b.Id !== id));
    }
    setEditingBacklogId(null);
    setEditingContent({ Info: '', Reference: '', Sponsor: '' });
  };

  const handleDeleteSelected = async () => {
    if (!selectedBacklogId || editingBacklogId === selectedBacklogId) return;
    if (confirm('Are you sure you want to delete this backlog item?')) {
      try {
        await deleteBacklogAPI(selectedBacklogId);
        setBacklogs(prev => prev.filter(b => b.Id !== selectedBacklogId));
        setSelectedBacklogId(null);
      } catch (error) {
        console.error("Error deleting backlog:", error);
        alert("Failed to delete backlog.");
      }
    }
  };

  const toggleBacklogProperty = async (backlogId, property) => {
    const backlog = backlogs.find(b => b.Id === backlogId);
    if (backlog) {
      try {
        const updatedBacklog = await updateBacklogAPI({ Id: backlogId, [property]: !backlog[property], EditAt: new Date().toISOString() });
        setBacklogs(prev => prev.map(b => b.Id === backlogId ? updatedBacklog : b).sort((a,b) => new Date(b.EditAt).getTime() - new Date(a.EditAt).getTime()));
      } catch (error) {
        console.error(`Error toggling ${property} for ${backlogId}:`, error);
        alert(`Failed to toggle ${property}.`);
      }
    }
  };

  const handleKeyDown = useCallback((event) => {
    const activeElementIsInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    if (editingBacklogId && activeElementIsInput) { // Editing mode, event likely from input/textarea
      if (event.key === 'Escape') {
        handleCancelEdit(editingBacklogId);
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSaveEdit(editingBacklogId);
      }
    } else if (selectedBacklogId && !editingBacklogId && !activeElementIsInput) { // Selection mode, event on list container
      if (event.key.toLowerCase() === 'd') {
        if (event.repeat) return;
        const pressedOnce = backlogListRef.current?.dataset.pressedD;
        if (pressedOnce) {
            delete backlogListRef.current.dataset.pressedD;
            handleDeleteSelected();
        } else {
            if(backlogListRef.current) backlogListRef.current.dataset.pressedD = "true";
            setTimeout(() => {
                if(backlogListRef.current) delete backlogListRef.current.dataset.pressedD;
            }, 300);
        }
      }
    }
  }, [editingBacklogId, selectedBacklogId, backlogs, editingContent, handleSaveEdit, handleCancelEdit, handleDeleteSelected]); // Added dependencies

  useEffect(() => {
    const listEl = backlogListRef.current;
    if (listEl) {
        listEl.addEventListener('keydown', handleKeyDown);
        return () => listEl.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]); // handleKeyDown is memoized

  const getBacklogItemClasses = (backlog) => {
    let classes = "p-3 border-b border-neutral-content/10 dark:border-neutral-content/20 cursor-pointer group transition-all duration-150 ease-in-out relative";

    // Base background adjusted for states
    if (backlog.Accomplished) {
        classes += " bg-green-50 dark:bg-green-900/30 hover:bg-green-100/70 dark:hover:bg-green-800/40";
    } else if (backlog.Expired) {
        classes += " bg-red-50 dark:bg-red-900/30 opacity-70 hover:bg-red-100/70 dark:hover:bg-red-800/40 hover:opacity-80";
    } else {
        classes += " bg-base-100 dark:bg-base-300/30 hover:bg-base-200/70 dark:hover:bg-base-300/50";
    }

    if (backlog.Id === selectedBacklogId) {
        classes = classes.replace(/bg-\w+-[\d\w\/%]+/g, ''); // Remove other bg colors
        classes += " bg-amber-200 dark:bg-amber-600 text-amber-800 dark:text-amber-50"; // Warm selection color
        classes = classes.replace(/hover:bg-\w+-[\d\w\/%]+/g, ''); // Remove hover to maintain selection color
        classes += " dark:hover:bg-amber-600 hover:bg-amber-200";
    }
    
    if (backlog.Id === editingBacklogId) {
        classes += " ring-2 ring-sky-500 dark:ring-sky-400 ring-inset shadow-lg z-10";
        if (backlog.Id === selectedBacklogId) { // If also selected, ensure selection color isn't fully overridden by ring potentially
             classes = classes.replace(/bg-amber-200/g, 'bg-amber-100'); // Slightly lighter if editing & selected
             classes = classes.replace(/dark:bg-amber-600/g, 'dark:bg-amber-700');
        }
    }
    return classes;
  };


  return (
    <div className="w-[40vw] h-screen flex flex-col border-r border-base-300 dark:border-neutral-700 bg-base-100 dark:bg-neutral-800 text-base-content dark:text-neutral-content">
      {/* Top Button Bar */}
      <div className="h-[10vh] p-2 flex flex-wrap items-center gap-2 border-b border-base-300 dark:border-neutral-700 bg-base-200 dark:bg-neutral-900 sticky top-0 z-20">
        <button onClick={handleCreateNew} className="btn btn-sm btn-primary">
          <IconPlus size={16} className="mr-1" /> Create Backlog
        </button>
        <button onClick={handleDeleteSelected} className="btn btn-sm btn-error btn-outline" disabled={!selectedBacklogId || editingBacklogId === selectedBacklogId}>
          <IconTrash size={16} className="mr-1" /> Delete
        </button>
        <label className="label cursor-pointer gap-1.5 p-1.5 rounded-md hover:bg-base-300 dark:hover:bg-neutral-700 transition-colors">
          <input type="checkbox" checked={showExpired} onChange={() => setShowExpired(s => !s)} className="checkbox checkbox-xs checkbox-secondary align-middle" />
          <span className="label-text text-xs ml-1 align-middle">Show Expired</span>
        </label>
        <label className="label cursor-pointer gap-1.5 p-1.5 rounded-md hover:bg-base-300 dark:hover:bg-neutral-700 transition-colors">
          <input type="checkbox" checked={showAccomplished} onChange={() => setShowAccomplished(s => !s)} className="checkbox checkbox-xs checkbox-accent align-middle" />
          <span className="label-text text-xs ml-1 align-middle">Show Done</span>
        </label>
      </div>

      {/* Backlog List */}
      <div ref={backlogListRef} className="flex-grow overflow-y-auto focus:outline-none" tabIndex={-1} /*onKeyDown={handleKeyDown} No longer needed here, event listener added in useEffect */ >
        {sortedAndFilteredBacklogs.map(backlog => (
          <div
            key={backlog.Id}
            className={getBacklogItemClasses(backlog)}
            onClick={() => handleItemClick(backlog.Id)}
            onDoubleClick={() => handleDoubleClickToEdit(backlog)}
            // tabIndex={0} // Making individual items focusable can complicate keyboard nav. Parent div handles 'dd'.
          >
            {editingBacklogId === backlog.Id ? (
              <div className="space-y-2">
                <textarea
                  ref={editInputRef}
                  className="textarea textarea-bordered w-full text-sm bg-base-100 dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500"
                  value={editingContent.Info}
                  onChange={e => setEditingContent(c => ({ ...c, Info: e.target.value }))}
                  placeholder="Backlog content..."
                  rows={3}
                  onKeyDown={(e) => { // Capture Esc/Enter directly on textarea
                     if (e.key === 'Escape') { handleCancelEdit(backlog.Id); }
                     else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(backlog.Id); }
                  }}
                />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-xs bg-base-100 dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500"
                  value={editingContent.Reference}
                  onChange={e => setEditingContent(c => ({ ...c, Reference: e.target.value }))}
                  placeholder="Reference (e.g. ticket ID)"
                />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-xs bg-base-100 dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500"
                  value={editingContent.Sponsor}
                  onChange={e => setEditingContent(c => ({ ...c, Sponsor: e.target.value }))}
                  placeholder="Sponsor"
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={(e) => {e.stopPropagation(); handleSaveEdit(backlog.Id)}} className="btn btn-xs btn-success">Save</button>
                  <button onClick={(e) => {e.stopPropagation(); handleCancelEdit(backlog.Id)}} className="btn btn-xs btn-ghost">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className={`font-medium text-sm mb-1 ${backlog.Expired ? 'line-through text-opacity-70' : ''} ${backlog.Id === selectedBacklogId ? 'text-amber-800 dark:text-amber-50' : 'text-base-content dark:text-neutral-content' }`}>
                    {backlog.Info || <span className="italic text-neutral-400 dark:text-neutral-500">Untitled Backlog</span>}
                </p>
                {(backlog.Reference || backlog.Sponsor) &&
                  <p className={`text-xs opacity-70 mt-1 ${backlog.Id === selectedBacklogId ? 'text-amber-700 dark:text-amber-200' : 'text-neutral-content/70 dark:text-neutral-content/70'}`}>
                    {backlog.Reference && <span>Ref: {backlog.Reference}</span>}
                    {backlog.Reference && backlog.Sponsor && " | "}
                    {backlog.Sponsor && <span>Sponsor: {backlog.Sponsor}</span>}
                  </p>
                }
                <p className={`text-xs opacity-50 mt-1 ${backlog.Id === selectedBacklogId ? 'text-amber-600 dark:text-amber-300' : 'text-neutral-content/50 dark:text-neutral-content/50'}`}>
                    Edited: {new Date(backlog.EditAt).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2 items-center">
                    <button
                        title={backlog.Accomplished ? "Mark as Not Accomplished" : "Mark as Accomplished"}
                        onClick={e => e.stopPropagation()} // Prevent item click/doubleclick
                        onDoubleClick={(e) => { e.stopPropagation(); toggleBacklogProperty(backlog.Id, 'Accomplished'); }}
                        className={`btn btn-xs min-h-[1.5rem] h-[1.5rem] px-2 ${backlog.Accomplished ? 'btn-success hover:btn-success-focus' : 'btn-outline btn-success hover:bg-success hover:text-success-content'}`}
                    >
                        {backlog.Accomplished ? 'Done' : 'Mark Done'}
                    </button>
                    <button
                        title={backlog.Expired ? "Mark as Not Expired" : "Mark as Expired"}
                        onClick={e => e.stopPropagation()} // Prevent item click/doubleclick
                        onDoubleClick={(e) => { e.stopPropagation(); toggleBacklogProperty(backlog.Id, 'Expired'); }}
                        className={`btn btn-xs min-h-[1.5rem] h-[1.5rem] px-2 ${backlog.Expired ? 'btn-error hover:btn-error-focus' : 'btn-outline btn-error hover:bg-error hover:text-error-content'}`}
                    >
                        {backlog.Expired ? 'Expired' : 'Mark Expired'}
                    </button>
                </div>
              </>
            )}
          </div>
        ))}
        {sortedAndFilteredBacklogs.length === 0 && <p className="p-6 text-center text-neutral-content/60 dark:text-neutral-content/50 italic">No backlog items match your filters.</p>}
      </div>
    </div>
  );
};

export default BacklogPanel;