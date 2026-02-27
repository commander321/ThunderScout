import { MatchEvent } from "./events.js";
export var MatchType;
(function (MatchType) {
    MatchType[MatchType["Practice"] = 0] = "Practice";
    MatchType[MatchType["Quals"] = 1] = "Quals";
    MatchType[MatchType["Finals"] = 2] = "Finals";
    MatchType[MatchType["Other"] = 3] = "Other";
})(MatchType || (MatchType = {}));
export class MatchData {
    constructor() {
        this.teamNumber = 0;
        this.matchNumber = 0;
        this.eventCode = "";
        this.matchType = MatchType.Practice;
        this.matchEvents = [];
    }
    /**
     * Add an event to the match data
     */
    addEvent(event) {
        this.matchEvents.push(event);
    }
    /**
     * Remove an event from the match
     */
    removeEvent(event) {
        this.matchEvents.splice(this.matchEvents.indexOf(event));
    }
    /**
     * Removes all events of a specifc type from the match
     */
    removeType(type) {
        for (let i = 0; i < this.matchEvents.length; i++) {
            const event = this.matchEvents[i];
            if (event === undefined)
                continue;
            if (event.type == type)
                this.matchEvents.splice(i);
        }
    }
}
let currentMatchData = new MatchData();
let savedMatches = [];
export function getCurrentMatch() {
    return currentMatchData;
}
export function getAllMatches() {
    return savedMatches;
}
/**
 * Saves the current match and sets it to the next one
 */
export function saveCurrentMatch() {
    savedMatches.push(currentMatchData);
    currentMatchData = new MatchData();
}
//# sourceMappingURL=matchdata.js.map