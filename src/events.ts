export class MatchEvent {

    type: string;
    timestamp: number

    constructor(type: string) {
        this.type = type;
        this.timestamp = Date.now();
    }

}

let eventTypes: string[] = ["None", "Test1", "Test2"];

export function getEventTypes(): string[] {
    return eventTypes;
}

export function addEventType(type: string): void {
    eventTypes.push(type);
}

export function setEventTypes(events: string[]) {
    eventTypes = events;
}