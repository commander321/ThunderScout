import {MatchEvent} from "./events.js";
import * as bluetooth from "./bluetooth.js";

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
    textData: Map<string, string> = new Map<string, string>(); //text data is data stored in textboxes
    textDataJSON: string = "";
    eventcounts: Map<string, number> = new Map<string, number>();
   // eventcountsJSON: string = "";

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
     * Removes the last event of a certain type to occur
     */
    removeLatestEvent(type: string, group?: string) {
        for (let i = this.matchEvents.length-1;i >= 0;i--) {
            const event = this.matchEvents[i];
            if (event === undefined) continue;
            if (event.type != type) continue;
            if (group && event.group != group) continue;

            this.matchEvents.splice(i);

            break;
        }
    }

    /**
     * Removes all events of a specifc type from the match
     */
    removeType(type: string, group?: string) {
        for (let i = 0 ;i<this.matchEvents.length;i++) {
            const event = this.matchEvents[i];
            if (event === undefined) continue;
            if (event.type != type) continue;
            if (group && event.group != group) continue;
            
            this.matchEvents.splice(i);
        }
    }

    /**
     * Set a text data value
     */
    setTextData(key: string, value: string) {
        if (key.trim().length === 0) return;
        if (value.trim().length === 0) {
            this.textData.delete(key);
            return;
        }

        this.textData.set(key, value);
    }

    /**
     * Get a text value based on its key
     */
    getTextData(key: string): string {
        if (key.trim().length === 0) return "";
        if (!this.textData.has(key)) return "";
        return this.textData.get(key) || "";
    }

    /**
     * Returns a count of how many of a certain event there are
     */
    getEventCount(type: string, group?: string): number {
        let count = 0;

        for (const event of this.matchEvents) {
            if (group && event.group != group) continue;
            if (event.type === type) count++;
        }

        return count;
    }


    /**
     * Returns all events in a match of a certain group
     */
    getEventsByGroup(group: string): string[] {
        let events: string[] = [];

        for (const event of this.matchEvents) {
            if (event.group == group) events.push(event.type);
        }

        return events;
    }

}

let currentMatchData: MatchData = new MatchData();
let savedMatches: MatchData[] = [];
let unsavedMatches: MatchData[] = [];

export function getCurrentMatch(): MatchData {
    return currentMatchData;
}

export function getAllMatches(): MatchData[] {
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
        } else {
            currentMatchData.eventcounts.set(event.type, 1);
        }
    }

   // currentMatchData.eventcountsJSON = JSON.stringify(Object.fromEntries(currentMatchData.eventcounts));
    currentMatchData.textDataJSON = JSON.stringify(Object.fromEntries(currentMatchData.textData));
    if (currentMatchData.textData.size === 0) currentMatchData.textDataJSON = "";

    console.log(currentMatchData.eventcounts);

    savedMatches.push(currentMatchData);

    let nextMatch: number = currentMatchData.matchNumber + 1; 
    let matchType: MatchType = currentMatchData.matchType;
    let allianceStation: AllianceStation = currentMatchData.allianceStation;
    let eventCode: string = currentMatchData.eventCode;
    let name: string = currentMatchData.getTextData("Scouter Name");

    //save with bluetooth
    bluetooth.sendCurrentMatch();

    currentMatchData = new MatchData();
    currentMatchData.matchNumber = nextMatch;
    currentMatchData.matchType = matchType;
    currentMatchData.allianceStation = allianceStation;
    currentMatchData.eventCode = eventCode;
    currentMatchData.setTextData("Scouter Name", name);
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
export function addMatches(matches: MatchData[]) {
    savedMatches.push(...matches);
}

/**
 * Add a match to the saved match data (used for importing from a file)
 */
export function addMatch(match: MatchData) {
    savedMatches.push(match);
}

/**
 * Removes all duplicate matches that are currently saved
 */
export function removeDuplicates(matchNum: number, teamNum: number, allianceStation: AllianceStation, matchType: MatchType, eventCode: string) {
    for (let i=0; i < savedMatches.length; i++) {
        let m = savedMatches[i];
        if (!m) continue;
        if (m.teamNumber == teamNum && m.matchNumber == matchNum && m.matchType == matchType && m.eventCode == eventCode && m.allianceStation == allianceStation) {
            savedMatches.splice(i, 1);
        }
    }
}

export function clearAllMatches() {
    savedMatches = [];
    unsavedMatches = [];
}

export function addUnsavedMatch(match: MatchData) {
    unsavedMatches.push(match);
}

export function removeUnsavedMatch(match: MatchData) {
    for (let i=0;i<unsavedMatches.length;i++) {
        if (unsavedMatches[i] == match) unsavedMatches.splice(i, 1);
    }
}

export function getUnsavedMatches(): MatchData[] {
    return unsavedMatches;
}

export function setUnsavedMatches(matches: MatchData[]) {
    //code mostly copied from analytics
    for (const match of matches) {
        //Add event counts for analytics. Also add event types
        match.eventcounts = new Map<string, number>();
        for (const event of match.matchEvents) {
            if (match.eventcounts.has(event.type)) {
                let count = match.eventcounts.get(event.type);
                match.eventcounts.set(event.type, (count === undefined) ? 1 : count + 1);
            } else {
                match.eventcounts.set(event.type, 1);
            }
        }

        //Set text data map based on the JSON string
        if (match.textDataJSON.trim().length != 0) {
            match.textData = new Map<string, string>(Object.entries(JSON.parse(match.textDataJSON)))
            match.textDataJSON = "";
        } else {
            match.textData = new Map<string, string>();
        }

        //Create new matchdata object (this makes it a true MatchData object)
        let newMatch = new MatchData();
        newMatch.matchNumber = match.matchNumber;
        newMatch.teamNumber = match.teamNumber;
        newMatch.allianceStation = match.allianceStation;
        newMatch.matchType = match.matchType;
        newMatch.eventCode = match.eventCode;
        newMatch.matchEvents = match.matchEvents;
        newMatch.textData = match.textData;
        newMatch.textDataJSON = match.textDataJSON;
        newMatch.eventcounts = match.eventcounts;

        //Add to the list of matches to be added (since it doesn't include duplicates)
        addUnsavedMatch(newMatch);
    }
}