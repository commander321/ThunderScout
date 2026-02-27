import {MatchEvent} from "./events.js";

export enum MatchType {
    Practice,
    Quals,
    Finals,
    Other,
}

export class MatchData {

    teamNumber: number;
    matchNumber: number;
    eventCode: string;
    matchType: MatchType;
    matchEvents: MatchEvent[];

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

    currentMatchData = new MatchData();
}