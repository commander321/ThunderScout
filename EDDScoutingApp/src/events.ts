export class MatchEvent {

    type: string;
    group: string;
    timestamp: number

    constructor(type: string, group: string) {
        this.type = type;
        this.timestamp = Date.now();
        this.group = group || "";
    }

}

let eventTypes: string[] = ["None", "Test1", "Test2"];
let eventGroups: string[] =["None", "TestGroup1", "TestGroup2"];

export function getEventTypes(): string[] {
    return eventTypes;
}

export function addEventType(type: string): void {
    eventTypes.push(type);
}

export function removeEventType(type: string): void {
    if (!eventTypes.includes(type)) return;
    eventTypes.splice(eventTypes.findIndex(value => value === type), 1);
}

export function setEventTypes(events: string[]): void {
    eventTypes = events;
}

export function getEventGroups(): string[] {
    return eventGroups;
}

export function addEventGroup(group: string): void {
    eventGroups.push(group);
}

export function setEventGroups(groups: string[]): void {
    eventGroups = groups;
}

export function removeEventGroup(group: string): void {
    if (!eventGroups.includes(group)) return;
    eventGroups.splice(eventGroups.findIndex(value => value === group), 1);
}
