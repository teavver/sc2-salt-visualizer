
export type Filepath = string

export interface Mapping {
    start: number
    end: number
}

export interface MappableValue<T> {
    value: T
    mapping: Mapping
}

export interface FailureData {
    type: "warning" | "error",
    reason: string
}

export interface StepActionBase {
    action: string
    count: number
}

export interface StepAction {
    actions: StepActionBase[]
    comment?: string
    fails?: FailureData | FailureData[]
}

export interface StepBase {
    supply: MappableValue<number>
    minutes: MappableValue<number>
    seconds: MappableValue<number>
    fails?: FailureData | FailureData[]
}

export interface Step extends StepBase, StepAction {
}