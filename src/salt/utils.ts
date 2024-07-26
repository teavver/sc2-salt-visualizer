import { FailureData, MappableValue, Mapping, StepAction, StepActionBase } from "./types.js"

// === General ===

export const to_decimal = (str: string) => parseInt(str, 10)

export const jstr = (json: object) => JSON.stringify(json, null, 4)

export const is_err = (data: unknown) => {
    const obj = data as object
    return ("reason" in obj)
}

export const halt_unexpected_err = (err: unknown): FailureData => { return { type: "error", reason: `Unexpected error occurred. Err: ${(err as Error).message}` } }

export const format_err = (err: unknown) => {
    console.log("======")
    if (err instanceof Error) {
        console.error(err.name, err.message)
        err.stack && console.error(err.stack)
    } else {
        console.error(err)
    }
    console.log("======")
}

export const create_logger = (module: string) => {
    return (msg: string, special?: "warn" | "error") => {
        if (!special) {
            console.log(`[${module}]: ${msg}`)
        } else if (special === "warn") {
            console.warn(`[${module}]: ${msg}`)
        } else if (special === "error") {
            console.error(`[${module}]: ${msg}`)
        }
    }
}

// === Parser utils ===

/**
 * Extracts actions from an action string
 * TODO: Handle comments, with and without "@" prefix
 */
export const extract_actions = (action_str: string): StepAction => {
    let res: StepAction = { actions: [] }
    if (action_str === "") {
        res.fails = { type: "error", reason: "Empty action string" }
        return res
    }
    // Catch all "xN" expressions, e.g. " x6", " x1"
    // All count expressions must be preceded with a whitespace
    const repeat_count_expr = /\bx(\d+)\b/
    const actions = action_str.split(",")
    actions.forEach((action: string) => {
        let base_action: StepActionBase = { action: "", count: 1 }
        if (action.length === 0) {
            res.fails = { type: "warning", reason: "Action is empty. Did you missclick a comma?" }
        }
        // Handle count, e.g. "Zergling x4"
        const matches = action.match(repeat_count_expr)
        // console.log(matches)
        if (!matches || !matches.index) {
            base_action.action = action
        } else {
            base_action.count = to_decimal(matches[1])
            // No need to include the repeat count next to action
            base_action.action = action.substring(0, matches.index - 1)
        }
        res.actions.push(base_action)
    })
    // console.log(`[res]: ${JSON.stringify(res, null, 4)}`) // DEBUG
    return res
}

export const extract_and_map = (source: string, start_idx: number, end_idx: number): [string, Mapping] => {
    return [source.substring(start_idx, end_idx), { start: start_idx, end: end_idx }]
}
