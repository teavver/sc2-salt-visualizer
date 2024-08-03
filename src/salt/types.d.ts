export type MappingId = string;
export interface MappedValue<T> {
    value: T;
    map_id: MappingId;
}
export interface FailureData {
    type: "warning" | "error";
    reason: string;
}
export interface StepActionBase {
    action: string;
    count: number;
}
export interface StepAction {
    actions: MappedValue<StepActionBase>[];
    comment?: string;
    fails?: FailureData | FailureData[];
}
export interface StepBase {
    supply: MappedValue<number>;
    minutes: MappedValue<number>;
    seconds: MappedValue<number>;
    fails?: FailureData | FailureData[];
}
export interface Step extends StepBase, StepAction {
}
export interface BuildOrderBlock {
    id: MappingId;
    content: string;
}
export declare enum BuildOrderBlockId {
    SUPPLY = 0,
    MINUTES = 1,
    SECONDS = 2,
    ACTION = 3
}
