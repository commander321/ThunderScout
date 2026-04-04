import { MatchEvent } from "./events.js";
export declare enum MatchType {
    Practice = "Practice",
    Quals = "Quals",
    Finals = "Finals",
    Other = "Other"
}
export declare enum AllianceStation {
    Red_1 = "Red_1",
    Red_2 = "Red_2",
    Red_3 = "Red_3",
    Blue_1 = "Blue_1",
    Blue_2 = "Blue_2",
    Blue_3 = "Blue_3"
}
export declare class MatchData {
    teamNumber: number;
    matchNumber: number;
    eventCode: string;
    matchType: MatchType;
    allianceStation: AllianceStation;
    matchEvents: MatchEvent[];
    textData: Map<string, string>;
    textDataJSON: string;
    eventcounts: Map<string, number>;
    constructor();
    /**
     * Add an event to the match data
     */
    addEvent(event: MatchEvent): void;
    /**
     * Remove an event from the match
     */
    removeEvent(event: MatchEvent): void;
    /**
     * Removes all events of a specifc type from the match
     */
    removeType(type: string): void;
    /**
     * Set a text data value
     */
    setTextData(key: string, value: string): void;
    /**
     * Get a text value based on its key
     */
    getTextData(key: string): string;
    /**
     * Returns a count of how many of a certain event there are
     */
    getEventCount(type: string): number;
    /**
     * Updates all event counter components because event counts change all the time
     */
    updateCounters(type?: string): void;
}
export declare function getCurrentMatch(): MatchData;
export declare function getAllMatches(): MatchData[];
/**
 * Saves the current match and sets it to the next one
 * Also sends the match over bluetooth
 */
export declare function saveCurrentMatch(): void;
/**
 * Exports all saved matches to a JSON file
 */
export declare function exportMatchData(): void;
/**
 * Add matches to the saved match data (used for importing from a file)
 */
export declare function addMatches(matches: MatchData[]): void;
//# sourceMappingURL=matchdata.d.ts.map