// components/BacklogDataOpt.jsx
"use client";

// --- API Mock Implementations ---
// TODO: Replace with actual API calls
import Option, { listKey } from "doptime-client";


const MOCK_DELAY = 500;


let mockBacklogs = [
  { Id: '1', Info: 'Initial Backlog Item 1', Reference: 'REF-001', Sponsor: 'Client A', CreateAt: new Date(Date.now() - 86400000 * 2).toISOString(), EditAt: new Date(Date.now() - 86400000).toISOString(), Expired: false, Done: false },
  { Id: '2', Info: 'Initial Backlog Item 2 - Done', Reference: 'REF-002', Sponsor: 'Client B', CreateAt: new Date(Date.now() - 86400000 * 3).toISOString(), EditAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), Expired: false, Done: true },
  { Id: '3', Info: 'Initial Backlog Item 3 - Expired', Reference: 'REF-003', Sponsor: 'Client C', CreateAt: new Date(Date.now() - 86400000 * 4).toISOString(), EditAt: new Date(Date.now() - 86400000 * 2.5).toISOString(), Expired: true, Done: false },
];

/**
 * Fetches all backlog items.
 * @returns {Promise<Backlog[]>}
 */
export const fetchBacklogsAPI = async () => {
  console.log("API: Fetching backlogs...");
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate fetching and ensure EditAt is a string for consistent sorting
      const data = mockBacklogs.map(b => ({...b, EditAt: new Date(b.EditAt).toISOString()}));
      resolve(JSON.parse(JSON.stringify(data))); // Deep copy to simulate API response
    }, MOCK_DELAY);
  });
};

/**
 * Creates a new backlog item.
 * @param {Object} backlogData - The data for the new backlog.
 * @param {string} backlogData.Info
 * @param {string} backlogData.Reference
 * @param {string} backlogData.Sponsor
 * @param {boolean} backlogData.Expired
 * @param {boolean} backlogData.Done
 * @returns {Promise<Backlog>}
 */
export const createBacklogAPI = async (backlogData) => {
  console.log("API: Creating backlog...", backlogData);
  return new Promise(resolve => {
    setTimeout(() => {
      const newBacklog = {
        ...backlogData,
        Id: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        CreateAt: new Date().toISOString(),
        EditAt: new Date().toISOString(),
      };
      mockBacklogs = [newBacklog, ...mockBacklogs];
      resolve(JSON.parse(JSON.stringify(newBacklog)));
    }, MOCK_DELAY);
  });
};

/**
 * Updates an existing backlog item.
 * @param {Object} backlogData - The data to update, must include Id.
 * @param {string} backlogData.Id
 * @param {string} [backlogData.Info]
 * @param {string} [backlogData.Reference]
 * @param {string} [backlogData.Sponsor]
 * @param {boolean} [backlogData.Expired]
 * @param {boolean} [backlogData.Done]
 * @returns {Promise<Backlog>}
 */
export const updateBacklogAPI = async (backlogData) => {
  console.log("API: Updating backlog...", backlogData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockBacklogs.findIndex(b => b.Id === backlogData.Id);
      if (index !== -1) {
        mockBacklogs[index] = { ...mockBacklogs[index], ...backlogData, EditAt: new Date().toISOString() };
        resolve(JSON.parse(JSON.stringify(mockBacklogs[index])));
      } else {
        reject(new Error("Backlog not found"));
      }
    }, MOCK_DELAY);
  });
};

/**
 * Deletes a backlog item.
 * @param {string} backlogId
 * @returns {Promise<void>}
 */
export const deleteBacklogAPI = async (backlogId) => {
  console.log("API: Deleting backlog...", backlogId);
  return new Promise(resolve => {
    setTimeout(() => {
      mockBacklogs = mockBacklogs.filter(b => b.Id !== backlogId);
      resolve();
    }, MOCK_DELAY);
  });
};

// --- Session Storage Utilities ---

/**
 * Loads state from session storage.
 * @param {string} key - The key to retrieve from session storage.
 * @param {*} defaultValue - The default value to return if the key is not found or an error occurs.
 * @returns {*} The stored value or the default value.
 */
export const loadStateFromSessionStorage = (key, defaultValue) => {
  if (typeof window !== 'undefined') {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (error) {
        console.error(`Error parsing sessionStorage item ${key}:`, error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
};

/**
 * Saves state to session storage.
 * @param {string} key - The key to store the value under in session storage.
 * @param {*} value - The value to store (will be stringified).
 */
export const saveStateToSessionStorage = (key, value) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving sessionStorage item ${key}:`, error);
    }
  }
};




