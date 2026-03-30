import { MatchEvent } from "./events.js";
export var MatchType;
(function (MatchType) {
    MatchType["Practice"] = "Practice";
    MatchType["Quals"] = "Quals";
    MatchType["Finals"] = "Finals";
    MatchType["Other"] = "Other";
})(MatchType || (MatchType = {}));
export var AllianceStation;
(function (AllianceStation) {
    AllianceStation["Red_1"] = "Red_1";
    AllianceStation["Red_2"] = "Red_2";
    AllianceStation["Red_3"] = "Red_3";
    AllianceStation["Blue_1"] = "Blue_1";
    AllianceStation["Blue_2"] = "Blue_2";
    AllianceStation["Blue_3"] = "Blue_3";
})(AllianceStation || (AllianceStation = {}));
export class MatchData {
    constructor() {
        this.teamNumber = 0;
        this.matchNumber = 0;
        this.eventCode = "";
        this.matchType = MatchType.Practice;
        this.allianceStation = AllianceStation.Red_1;
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
    let nextMatch = currentMatchData.matchNumber + 1;
    currentMatchData = new MatchData();
    currentMatchData.matchNumber = nextMatch;
}
/**
 * Exports all saved matches to a JSON file
 */
export function exportMatchData() {
    let data = {
        matches: savedMatches
    };
    let json = JSON.stringify(data, null, 2);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = "matchdata.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
//# sourceMappingURL=matchdata.js.map