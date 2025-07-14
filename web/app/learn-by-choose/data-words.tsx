"use client";
import { createApi, Opt, OptDefaults } from "doptime-client";
import { arrayBuffer } from "stream/consumers";

// The new data structure from the backend
export interface WordLearningData {
    Word: string;
    AssociativeLearningBulletNotes: string;
    ImageRawData: arrayBuffer | null; // Use ArrayBuffer for binary data
}

OptDefaults({ urlBase: "http://localhost:81", })
// The API client definition
// call using apiWordSensationData(["苹果", "窗户", "小说"])
export const apiWordSensationData = createApi<string[], WordLearningData[]>("WordLearningData");

// The old wordDatabase is removed as data will be fetched via API.
