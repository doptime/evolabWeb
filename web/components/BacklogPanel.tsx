"use client";
// components/BacklogPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconPlus,
  IconInfo,
  IconCheckCircle, IconCircle
} from './icons'; // Adjust path as needed
import Opt, {listKey, OptDefaults} from 'doptime-client';

// Local utility functions for session storage (can be moved to a separate generic utility file if needed)
const loadStateFromSessionStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const serializedState = sessionStorage.getItem(key);
    if (serializedState === null) {
      return defaultValue;
    }
    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.error("Error loading state from session storage:", error);
    return defaultValue;
  }
};

const saveStateToSessionStorage = <T,>(key: string, state: T) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Error saving state to session storage:", error);
  }
};


export interface Backlog { // Local definition, adjusted types
  Id: string;
  Info: string;
  Reference: string;
  Sponsor: string;
  CreatedAt: Date; // Changed to Date
  UpdatedAt: Date;   // Changed to Date
  Expired: boolean;
  Done: boolean;
}

export const keyAntiAgingBacklog = new listKey<Backlog>("AntiAgingBacklog");


const BacklogPanel = () => {
  const [backlogs, setBacklogs] = useState<Backlog[]>([]);
  const [selectedBacklogId, setSelectedBacklogId] = useState<string | null>(null);
  const [editingBacklogId, setEditingBacklogId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState({ Info: '', Reference: '', Sponsor: '' });
  const [showExpired, setShowExpired] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const backlogListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    OptDefaults({urlBase: "http://127.0.0.1:81" });

    keyAntiAgingBacklog.lRange(0, -1).then((data) => {
      if (!Array.isArray(data)) {
        console.error("Data from Redis is not an array:", data);
        return;
      }
      console.log("Loaded backlogs from keyAntiAgingBacklog:", data);
      // Ensure data is an array and items conform to Backlog interface
      // Dates now *must* be parsed if they are strings from Redis:
      const parsedData = (data).map(item => ({
        ...item,
        // Convert string dates to Date objects if necessary
        CreatedAt: typeof item.CreatedAt === 'string' ? new Date(item.CreatedAt) : new Date(item.CreatedAt), // Ensure it's a Date
        UpdatedAt: typeof item.UpdatedAt === 'string' ? new Date(item.UpdatedAt) : new Date(item.UpdatedAt),   // Ensure it's a Date
      }));
      setBacklogs(parsedData.sort((a, b) => b.UpdatedAt.getTime() - a.UpdatedAt.getTime())); // Compare Date objects directly
    }).catch(error => {
      console.error("Failed to load backlogs from keyAntiAgingBacklog:", error);
      setBacklogs([]); // Initialize with empty array on error
    });

    setSelectedBacklogId(loadStateFromSessionStorage('selectedBacklogId', null));
    setShowExpired(loadStateFromSessionStorage('showExpiredBacklogs', false));
    setShowDone(loadStateFromSessionStorage('showDoneBacklogs', false));
  }, []);

  useEffect(() => saveStateToSessionStorage('selectedBacklogId', selectedBacklogId), [selectedBacklogId]);
  useEffect(() => saveStateToSessionStorage('showExpiredBacklogs', showExpired), [showExpired]);
  useEffect(() => saveStateToSessionStorage('showDoneBacklogs', showDone), [showDone]);

  const sortedAndFilteredBacklogs = backlogs
    .filter(b => (showExpired || !b.Expired) && (showDone || !b.Done))
    .sort((a, b) => b.UpdatedAt.getTime() - a.UpdatedAt.getTime()); // Compare Date objects directly

  const handleCreateNew = () => {
    const newTempId = `new-${Date.now()}`;
    setEditingContent({ Info: '', Reference: '', Sponsor: '' });
    setEditingBacklogId(newTempId);
    setSelectedBacklogId(null);
    // Add a complete backlog item structure locally
    setBacklogs(prev => [{ Id: newTempId, Info: '', Reference: '', Sponsor: '', Expired: false, Done: false, CreatedAt: new Date(), UpdatedAt: new Date() }, ...prev]);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingContent.Info.trim()) {
      if (id.startsWith('new-')) {
        setBacklogs(prev => prev.filter(b => b.Id !== id));
      }
      setEditingBacklogId(null);
      return;
    }
    try {
      let finalBacklog: Backlog;
      const editTime = new Date(); // Use Date object

      if (id.startsWith('new-')) {
        const newBacklogData: Backlog = {
            Id: `blg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a more robust unique ID
            Info: editingContent.Info,
            Reference: editingContent.Reference,
            Sponsor: editingContent.Sponsor,
            CreatedAt:  editTime,
            UpdatedAt:  editTime,
            Expired: false,
            Done: false
        };

        await keyAntiAgingBacklog.lPush(newBacklogData);
        finalBacklog = newBacklogData;

        setBacklogs(prev => [finalBacklog, ...prev.filter(b => b.Id !== id)].sort((a, b) => b.UpdatedAt.getTime() - a.UpdatedAt.getTime()));
        setSelectedBacklogId(finalBacklog.Id);

      } else { // Existing item
        const originalBacklog = backlogs.find(b => b.Id === id);
        if (!originalBacklog) {
            console.error("Error saving: Original backlog not found for ID:", id);
            setEditingBacklogId(null);
            return;
        }

        const updatedBacklogObject: Backlog = {
            ...originalBacklog,
            Info: editingContent.Info,
            Reference: editingContent.Reference,
            Sponsor: editingContent.Sponsor,
            UpdatedAt: editTime, // Ensure UpdatedAt is always a new Date object
        };
        //if updatedBacklogObject.CreatedAt is a string, convert it to Date
        // This check is good, but ideally, all dates loaded from Redis should already be Date objects.
        if (typeof updatedBacklogObject.CreatedAt === 'string') {
            updatedBacklogObject.CreatedAt = new Date(updatedBacklogObject.CreatedAt);
        }
        // No need to delete UpdatedAt if we are always setting it to a new Date object above.
        // delete updatedBacklogObject.UpdatedAt;

        // Find the actual index of the backlog item in the current 'backlogs' state
        const itemIndex = backlogs.findIndex(b => b.Id === id);
        if (itemIndex !== -1) {
            // Redis `lSet` operates by index
            // However, `doptime-client`'s `lSet` works differently. It expects a value and index to update.
            // A direct Redis LSET equivalent for *updating* a specific item based on ID might be complex if the list
            // is not truly a 1:1 reflection or if items can move.
            // For now, assuming `lSet` can update the item at its current index in the *local* list.
            // If the item moves or the Redis list changes, this approach might need adjustment.
            await keyAntiAgingBacklog.lSet(itemIndex, updatedBacklogObject); // This assumes the index is stable in Redis
            finalBacklog = updatedBacklogObject;
        } else {
             console.error("Error updating: Backlog item not found in local state for ID:", id);
             setEditingBacklogId(null);
             return;
        }

        setBacklogs(prev => prev.map(b => b.Id === id ? finalBacklog : b).sort((a, b) => b.UpdatedAt.getTime() - a.UpdatedAt.getTime()));
        setSelectedBacklogId(finalBacklog.Id);
      }
    } catch (error) {
      console.error("Error saving backlog:", error);
      if (id.startsWith('new-')) {
        setBacklogs(prev => prev.filter(b => b.Id !== id));
      }
    } finally {
      setEditingBacklogId(null);
    }
  };

  const handleItemClick = (backlogId: string) => {
    if (editingBacklogId && editingBacklogId !== backlogId) {
      const currentEditingItem = backlogs.find(b => b.Id === editingBacklogId);
      if (currentEditingItem && editingBacklogId.startsWith('new-') && !editingContent.Info.trim()) {
        setBacklogs(prev => prev.filter(b => b.Id !== editingBacklogId));
      }
      setEditingBacklogId(null);
    }
    setSelectedBacklogId(backlogId);
  };

  const handleDoubleClickToEdit = (backlog: Backlog) => {
    if (editingBacklogId && editingBacklogId !== backlog.Id && editingBacklogId.startsWith('new-')) {
        const currentNewItem = backlogs.find(b => b.Id === editingBacklogId);
        if (currentNewItem && !currentNewItem.Info.trim()){
            setBacklogs(prev => prev.filter(b => b.Id !== editingBacklogId));
        }
    }
    setEditingBacklogId(backlog.Id);
    setEditingContent({ Info: backlog.Info, Reference: backlog.Reference || '', Sponsor: backlog.Sponsor || '' });
    setSelectedBacklogId(backlog.Id);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleCancelEdit = (id: string) => {
    if (id.startsWith('new-')) {
      setBacklogs(prev => prev.filter(b => b.Id !== id));
    }
    setEditingBacklogId(null);
    setEditingContent({ Info: '', Reference: '', Sponsor: '' });
  };

  const handleDeleteSelectedWithConfirmation = async () => {
    if (!selectedBacklogId || editingBacklogId === selectedBacklogId) return;

    if (window.confirm('Are you sure you want to delete this backlog item? This action cannot be undone.')) {
      try {
        const itemToDelete = backlogs.find(b => b.Id === selectedBacklogId);
        if (!itemToDelete) {
            console.error("Item to delete not found in local state.");
            return;
        }
        // Remove 1 occurrence of the itemToDelete from the list
        const removedCount = await keyAntiAgingBacklog.lRem(1, itemToDelete);
        if (removedCount === 0) {
            console.warn("Item not found in keyAntiAgingBacklog for lRem, or value didn't match:", itemToDelete);
        }

        setBacklogs(prev => prev.filter(b => b.Id !== selectedBacklogId));
        setSelectedBacklogId(null);
      } catch (error) {
        console.error("Error deleting backlog:", error);
      }
    }
  };

  const toggleBacklogProperty = async (backlogId: string, property: 'Expired' | 'Done') => {
    const backlogIndex = backlogs.findIndex(b => b.Id === backlogId);
    if (backlogIndex === -1) {
        console.error("Cannot toggle property: backlog not found in local state for ID:", backlogId);
        return;
    }
    const originalBacklog = backlogs[backlogIndex];

    const updatedBacklog: Backlog = {
      ...originalBacklog,
      [property]: !originalBacklog[property],
      UpdatedAt: new Date() // Use Date object directly
    };

    try {
      await keyAntiAgingBacklog.lSet(backlogIndex, updatedBacklog);
      setBacklogs(prev => {
        const newBacklogs = [...prev];
        newBacklogs[backlogIndex] = updatedBacklog;
        return newBacklogs.sort((a, b) => b.UpdatedAt.getTime() - a.UpdatedAt.getTime());
      });

    } catch (error) {
      console.error(`Error toggling ${property} for ${backlogId}:`, error);
    }
  };

  const handleKeyDown = useCallback((event: React.KeyboardEvent | KeyboardEvent) => {
    const activeElementIsInput = document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement;

    if (editingBacklogId && activeElementIsInput) {
      if (event.key === 'Escape') {
        handleCancelEdit(editingBacklogId);
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSaveEdit(editingBacklogId);
      }
    } else if (selectedBacklogId && !editingBacklogId && !activeElementIsInput) {
      if (event.key.toLowerCase() === 'd') {
        if ((event as any).repeat) return;
        const pressedOnce = backlogListRef.current?.dataset.pressedD;
        if (pressedOnce) {
          delete backlogListRef.current!.dataset.pressedD;
          handleDeleteSelectedWithConfirmation();
        } else {
          if (backlogListRef.current) {
            backlogListRef.current.dataset.pressedD = "true";
            setTimeout(() => {
              if (backlogListRef.current?.dataset.pressedD) {
                delete backlogListRef.current.dataset.pressedD;
              }
            }, 300);
          }
        }
      }
    }
  }, [editingBacklogId, selectedBacklogId, backlogs, editingContent, handleSaveEdit, handleCancelEdit, handleDeleteSelectedWithConfirmation]);

  useEffect(() => {
    const listEl = backlogListRef.current;
    if (listEl) {
      listEl.addEventListener('keydown', handleKeyDown as EventListener);
      return () => listEl.removeEventListener('keydown', handleKeyDown as EventListener);
    }
  }, [handleKeyDown]);

  const getBacklogItemClasses = (backlog: Backlog) => {
    let classes = "p-3 border-b border-neutral-content/10 dark:border-neutral-content/20 cursor-pointer group transition-colors duration-150 ease-in-out relative";

    if (backlog.Id === editingBacklogId) {
      classes += " ring-2 ring-sky-500 dark:ring-sky-400 ring-inset shadow-lg z-10 bg-base-200 dark:bg-base-300/50";
    } else if (backlog.Id === selectedBacklogId) {
      classes += " bg-amber-100 dark:bg-amber-700/50 text-amber-800 dark:text-amber-100";
    } else {
      classes += " bg-base-100 dark:bg-neutral-800 hover:bg-base-200/70 dark:hover:bg-neutral-700/50";
    }
    if (backlog.Id !== selectedBacklogId && backlog.Id !== editingBacklogId) {
        if (backlog.Done) classes += " opacity-70";
        if (backlog.Expired) classes += " opacity-60";
    }
    return classes;
  };


  return (
    <div className="w-[40vw] h-screen flex flex-col border-r border-base-300 dark:border-neutral-700 bg-base-100 dark:bg-neutral-800 text-base-content dark:text-neutral-content">
      {/* Top Button Bar - Height adjusted to 5vh */}
      <div className="h-[5vh] min-h-[40px] p-2 flex items-center gap-2 border-b border-base-300 dark:border-neutral-700 bg-base-200 dark:bg-neutral-900 sticky top-0 z-20">
        <button onClick={handleCreateNew} className="btn btn-sm btn-primary flex items-center whitespace-nowrap">
          <IconPlus size={16} className="mr-1 shrink-0" /> Create Backlog
        </button>
        <label className="label cursor-pointer gap-1.5 p-1.5 rounded-md hover:bg-base-300 dark:hover:bg-neutral-700 transition-colors">
          <input type="checkbox" checked={showExpired} onChange={() => setShowExpired(s => !s)} className="checkbox checkbox-xs checkbox-secondary align-middle" />
          <span className="label-text text-xs ml-1 align-middle">Show Expired</span>
        </label>
        <label className="label cursor-pointer gap-1.5 p-1.5 rounded-md hover:bg-base-300 dark:hover:bg-neutral-700 transition-colors">
          <input type="checkbox" checked={showDone} onChange={() => setShowDone(s => !s)} className="checkbox checkbox-xs checkbox-accent align-middle" />
          <span className="label-text text-xs ml-1 align-middle">Show Done</span>
        </label>
        <div className="ml-auto tooltip tooltip-left" data-tip="Select an item and press 'dd' to delete">
          <IconInfo size={18} className="text-neutral-500 dark:text-neutral-400" />
        </div>
      </div>

      {/* Backlog List */}
      <div ref={backlogListRef} className="flex-grow overflow-y-auto focus:outline-none" tabIndex={-1} >
        {sortedAndFilteredBacklogs.map(backlog => (
          <div
            key={backlog.Id}
            className={getBacklogItemClasses(backlog)}
            onClick={() => handleItemClick(backlog.Id)}
            onDoubleClick={() => handleDoubleClickToEdit(backlog)}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { e.stopPropagation(); handleCancelEdit(backlog.Id); }
                    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); handleSaveEdit(backlog.Id); }
                  }}
                />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-xs bg-base-100 dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500"
                  value={editingContent.Reference}
                  onChange={e => setEditingContent(c => ({ ...c, Reference: e.target.value }))}
                  placeholder="Reference (e.g. ticket ID)"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(backlog.Id); } }}
                />
                <input
                  type="text"
                  className="input input-bordered input-sm w-full text-xs bg-base-100 dark:bg-neutral-700 placeholder-neutral-400 dark:placeholder-neutral-500"
                  value={editingContent.Sponsor}
                  onChange={e => setEditingContent(c => ({ ...c, Sponsor: e.target.value }))}
                  placeholder="Sponsor"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(backlog.Id); } }}
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(backlog.Id); }} className="btn btn-xs btn-success">Save</button>
                  <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(backlog.Id); }} className="btn btn-xs btn-ghost">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className={`font-medium text-sm mb-1 break-words
                    ${backlog.Done && !(selectedBacklogId === backlog.Id || editingBacklogId === backlog.Id) ? 'text-green-700 dark:text-green-400/80 opacity-80' : ''}
                    ${backlog.Expired && !(selectedBacklogId === backlog.Id || editingBacklogId === backlog.Id) ? 'text-red-700 dark:text-red-500/80 line-through opacity-70' : ''}
                    ${selectedBacklogId === backlog.Id && !backlog.Done && !backlog.Expired ? 'text-amber-800 dark:text-amber-100' :
                      (selectedBacklogId !== backlog.Id && !backlog.Done && !backlog.Expired ? 'text-base-content dark:text-neutral-content' : '')}
                    ${selectedBacklogId === backlog.Id && backlog.Done ? 'text-green-800 dark:text-green-300' : ''}
                    ${selectedBacklogId === backlog.Id && backlog.Expired ? 'text-red-800 dark:text-red-300 line-through' : ''}
                  `}>
                  {backlog.Info || <span className="italic text-neutral-400 dark:text-neutral-500">Untitled Backlog</span>}
                </p>
                {(backlog.Reference || backlog.Sponsor) &&
                  <p className={`text-xs mt-0.5
                        ${selectedBacklogId === backlog.Id ? 'opacity-90 text-amber-700 dark:text-amber-200' : 'opacity-70 text-neutral-content/70 dark:text-neutral-content/70'}
                        ${backlog.Done && !(selectedBacklogId === backlog.Id) ? 'text-green-600/70 dark:text-green-400/60' : ''}
                        ${backlog.Expired && !(selectedBacklogId === backlog.Id) ? 'text-red-600/70 dark:text-red-500/60 line-through' : ''}
                    `}>
                    {backlog.Reference && <span>Ref: {backlog.Reference}</span>}
                    {backlog.Reference && backlog.Sponsor && " | "}
                    {backlog.Sponsor && <span>Sponsor: {backlog.Sponsor}</span>}
                  </p>
                }
                <p className={`text-xs mt-0.5
                    ${selectedBacklogId === backlog.Id ? 'opacity-70 text-amber-600 dark:text-amber-300' : 'opacity-50 text-neutral-content/50 dark:text-neutral-content/50'}
                    ${backlog.Done && !(selectedBacklogId === backlog.Id) ? 'text-green-500/50 dark:text-green-400/40' : ''}
                    ${backlog.Expired && !(selectedBacklogId === backlog.Id) ? 'text-red-500/50 dark:text-red-500/40' : ''}
                  `}>
                  Edited: {backlog.UpdatedAt.toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2 items-center">
                  <button
                    title={backlog.Done ? "Mark as Not Done" : "Mark as Done"}
                    onClick={(e) => { e.stopPropagation(); toggleBacklogProperty(backlog.Id, 'Done'); }}
                    className={`btn btn-xs btn-ghost btn-circle ${backlog.Done ? 'text-success' : 'text-neutral-content/50 hover:text-success'}`}
                  >
                    {backlog.Done ? <IconCheckCircle size={18} /> : <IconCircle size={18} />}
                  </button>
                  <span className={`text-xs ${backlog.Done ? 'text-success font-semibold' : 'text-neutral-content/60'}`}>
                    Done
                  </span>

                  <button
                    title={backlog.Expired ? "Mark as Not Expired" : "Mark as Expired"}
                    onClick={(e) => { e.stopPropagation(); toggleBacklogProperty(backlog.Id, 'Expired'); }}
                    className={`btn btn-xs btn-ghost btn-circle ${backlog.Expired ? 'text-error' : 'text-neutral-content/50 hover:text-error'}`}
                  >
                    {backlog.Expired ? <IconCheckCircle size={18} /> : <IconCircle size={18} />}
                  </button>
                  <span className={`text-xs ${backlog.Expired ? 'text-error font-semibold' : 'text-neutral-content/60'}`}>
                    Expired
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
        {sortedAndFilteredBacklogs.length === 0 && <p className="p-6 text-center text-neutral-content/60 dark:text-neutral-content/50 italic">No backlog items match your filters.</p>}
      </div>
    </div>
  );
};

export default BacklogPanel;