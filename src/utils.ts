import { StepAction, StepActionBase } from "./parser"

// === General ===

export const to_decimal = (str: string) => parseInt(str, 10)

export const format_err = (err_str: string) => {
    const err = err_str as unknown as Error
    console.log("======")
    console.log(err.name, err.message)
    err.stack && console.log(err.stack)
    console.log("======")
}

// === Classic BO ===

/**
 * Extracts actions from an action string
 * TODO: Handle comments, with and without "@" prefix
 */
export const extract_actions = (action_str: string): StepAction => {
    let res: StepAction = { actions: [] }
    if (action_str === "") {
        res.failed = { type: "error", reason: "Empty action string" }
        return res
    }
    // Catch all "xN" expressions, e.g. " x6", " x1"
    // All count expressions must be preceded with a whitespace
    const repeat_count_expr = /\bx(\d+)\b/
    const actions = action_str.split(",")
    console.log("actions ", actions)
    actions.forEach((action: string) => {
        console.log('action ', action)
        let base_action: StepActionBase = { action: "", count: 1 }
        // Handle count, e.g. "Zergling x4"
        const matches = action.match(repeat_count_expr)
        console.log(matches)
        if (!matches) {
            base_action.action = action
        } else {
            base_action.count = to_decimal(matches[1])
            // No need to include the repeat count next to action
            base_action.action = action.substring(0, matches.index - 1)
        }
        res.actions.push(base_action)
    })
    return res
}
