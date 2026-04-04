export class MatchEvent {
    constructor(type, group) {
        this.type = type;
        this.timestamp = Date.now();
        this.group = group || "";
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