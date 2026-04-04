export declare class MatchEvent {
    type: string;
    group: string;
    timestamp: number;
    constructor(type: string, group?: string);
}
export declare function getEventTypes(): string[];
export declare function addEventType(type: string): void;
export declare function setEventTypes(events: string[]): void;
//# sourceMappingURL=events.d.ts.map