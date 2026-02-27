import { MatchEvent } from "./events.js";
export declare enum MatchType {
    Practice = 0,
    Quals = 1,
    Finals = 2,
    Other = 3
}
export declare class MatchData {
    teamNumber: number;
    matchNumber: number;
    eventCode: string;
    matchType: MatchType;
    matchEvents: MatchEvent[];
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
}
export declare function getCurrentMatch(): MatchData;
export declare function getAllMatches(): MatchData[];
/**
 * Saves the current match and sets it to the next one
 */
export declare function saveCurrentMatch(): void;
//# sourceMappingURL=matchdata.d.ts.map