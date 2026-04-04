import { MatchEvent } from "./events.js";
import * as bluetooth from "./bluetooth.js";
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
    // eventcountsJSON: string = "";
    constructor() {
        this.textData = new Map(); //text data is data stored in textboxes
        this.textDataJSON = "";
        this.eventcounts = new Map();
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
    /**
     * Set a text data value
     */
    setTextData(key, value) {
        if (key.trim().length === 0)
            return;
        if (value.trim().length === 0) {
            this.textData.delete(key);
            return;
        }
        this.textData.set(key, value);
    }
    /**
     * Get a text value based on its key
     */
    getTextData(key) {
        if (key.trim().length === 0)
            return "";
        if (!this.textData.has(key))
            return "";
        return this.textData.get(key) || "";
    }
    /**
     * Returns a count of how many of a certain event there are
     */
    getEventCount(type) {
        let count = 0;
        for (const event of this.matchEvents) {
            if (event.type === type)
                count++;
        }
        return count;
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
 * Also sends the match over bluetooth
 */
export function saveCurrentMatch() {
    //add event counts (for analytics) based on the event list
    for (const event of currentMatchData.matchEvents) {
        if (currentMatchData.eventcounts.has(event.type)) {
            let count = currentMatchData.eventcounts.get(event.type);
            currentMatchData.eventcounts.set(event.type, (count === undefined) ? 1 : count + 1);
        }
        else {
            currentMatchData.eventcounts.set(event.type, 1);
        }
    }
    // currentMatchData.eventcountsJSON = JSON.stringify(Object.fromEntries(currentMatchData.eventcounts));
    currentMatchData.textDataJSON = JSON.stringify(Object.fromEntries(currentMatchData.textData));
    console.log(currentMatchData.eventcounts);
    savedMatches.push(currentMatchData);
    let nextMatch = currentMatchData.matchNumber + 1;
    //save with bluetooth
    bluetooth.sendCurrentMatch();
    currentMatchData = new MatchData();
    currentMatchData.matchNumber = nextMatch;
}
/**
 * Exports all saved matches to a JSON file
 */
export function exportMatchData() {
    /*let data = {
         matches: savedMatches
     }*/
    for (const match of savedMatches) {
        console.log(match.eventcounts);
    }
    let json = JSON.stringify(savedMatches, null, 2);
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
/**
 * Add matches to the saved match data (used for importing from a file)
 */
export function addMatches(matches) {
    savedMatches.push(...matches);
}
//# sourceMappingURL=matchdata.js.map