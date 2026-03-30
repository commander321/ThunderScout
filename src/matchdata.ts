import {MatchEvent} from "./events.js";

export enum MatchType {
    Practice = "Practice",
    Quals = "Quals",
    Finals = "Finals",
    Other = "Other",
}

export enum AllianceStation {
    Red_1 = "Red_1",
    Red_2 = "Red_2",
    Red_3 = "Red_3",
    Blue_1 = "Blue_1",
    Blue_2 = "Blue_2",
    Blue_3 = "Blue_3",
}

export class MatchData {

    teamNumber: number;
    matchNumber: number;
    eventCode: string;
    matchType: MatchType;
    allianceStation: AllianceStation;
    matchEvents: MatchEvent[];

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
    addEvent(event: MatchEvent) {
        this.matchEvents.push(event);
    }

    /**
     * Remove an event from the match
     */
    removeEvent(event: MatchEvent) {
        this.matchEvents.splice(this.matchEvents.indexOf(event));
    }

    /**
     * Removes all events of a specifc type from the match
     */
    removeType(type: string) {
        for (let i = 0 ;i<this.matchEvents.length;i++) {
            const event = this.matchEvents[i];
            if (event === undefined) continue;
            if (event.type == type) this.matchEvents.splice(i);
        }
    }

}

let currentMatchData: MatchData = new MatchData();
let savedMatches: MatchData[] = [];

export function getCurrentMatch(): MatchData {
    return currentMatchData;
}

export function getAllMatches(): MatchData[] {
    return savedMatches;
}

/**
 * Saves the current match and sets it to the next one
 */
export function saveCurrentMatch() {

    savedMatches.push(currentMatchData);

    let nextMatch: number = currentMatchData.matchNumber + 1; 

    currentMatchData = new MatchData();
    currentMatchData.matchNumber = nextMatch;
}

/**
 * Exports all saved matches to a JSON file
 */
export function exportMatchData() {
    let data = {
        matches: savedMatches
    }

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