// components/BacklogDataOpt.tsx
"use client";

export interface Backlog {
  Id: string;
  Info: string;
  Reference: string;
  Sponsor: string;
  CreateAt: string; // ISO string date
  EditAt: string;   // ISO string date
  Expired: boolean;
  Done: boolean; // 'Accomplished'から'Done'に変更
}

// --- API Mock Implementations ---
// TODO: Replace with actual API calls

const MOCK_DELAY = 500;

let mockBacklogs: Backlog[] = [
  { Id: '1', Info: 'Initial Backlog Item 1', Reference: 'REF-001', Sponsor: 'Client A', CreateAt: new Date(Date.now() - 86400000 * 2).toISOString(), EditAt: new Date(Date.now() - 86400000).toISOString(), Expired: false, Done: false },
  { Id: '2', Info: 'Initial Backlog Item 2 - Done', Reference: 'REF-002', Sponsor: 'Client B', CreateAt: new Date(Date.now() - 86400000 * 3).toISOString(), EditAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), Expired: false, Done: true },
  { Id: '3', Info: 'Initial Backlog Item 3 - Expired', Reference: 'REF-003', Sponsor: 'Client C', CreateAt: new Date(Date.now() - 86400000 * 4).toISOString(), EditAt: new Date(Date.now() - 86400000 * 2.5).toISOString(), Expired: true, Done: false },
];

export const fetchBacklogsAPI = async (): Promise<Backlog[]> => {
  console.log("API: Fetching backlogs...");
  return new Promise(resolve => {
    setTimeout(() => {
      // Simulate fetching and ensure EditAt is a string for consistent sorting
      const data = mockBacklogs.map(b => ({...b, EditAt: new Date(b.EditAt).toISOString()}));
      resolve(JSON.parse(JSON.stringify(data))); // Deep copy to simulate API response
    }, MOCK_DELAY);
  });
};

export const createBacklogAPI = async (backlogData: Omit<Backlog, 'Id' | 'CreateAt' | 'EditAt'> & { Expired: boolean; Done: boolean }): Promise<Backlog> => {
  console.log("API: Creating backlog...", backlogData);
  return new Promise(resolve => {
    setTimeout(() => {
      const newBacklog: Backlog = {
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

export const updateBacklogAPI = async (backlogData: Partial<Backlog> & { Id: string }): Promise<Backlog> => {
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

export const deleteBacklogAPI = async (backlogId: string): Promise<void> => {
  console.log("API: Deleting backlog...", backlogId);
  return new Promise(resolve => {
    setTimeout(() => {
      mockBacklogs = mockBacklogs.filter(b => b.Id !== backlogId);
      resolve();
    }, MOCK_DELAY);
  });
};

// --- Session Storage Utilities ---
// These could also be in a general utils file

export const loadStateFromSessionStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue) as T;
      } catch (error) {
        console.error(`Error parsing sessionStorage item ${key}:`, error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
};

export const saveStateToSessionStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving sessionStorage item ${key}:`, error);
    }
  }
};