export class MatchEvent {
    constructor(type) {
        this.type = type;
        this.timestamp = Date.now();
    }
}
let eventTypes = ["None", "Test1", "Test2"];
export function getEventTypes() {
    return eventTypes;
}
export function addEventType(type) {
    eventTypes.push(type);
}
export function setEventTypes(events) {
    eventTypes = events;
}
//# sourceMappingURL=events.js.map