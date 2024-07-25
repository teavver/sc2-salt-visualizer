
export type Filepath = string

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
    supply: number
    minutes: number
    seconds: number
    fails?: FailureData | FailureData[]
}

export interface Step extends StepBase, StepAction { }