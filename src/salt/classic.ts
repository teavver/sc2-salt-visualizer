import { StepAction, StepActionBase, BuildOrderBlock, Step, BuildOrderBlockId, MappingId } from "./types.js"
import { create_logger, to_decimal } from "./utils.js"

/**
 * Classic BO Functions
 */

const log = create_logger("classic", true)

/**
 * Extracts actions from an action string
 * TODO: Handle comments: Wrapped in parenthesis, e.g. "Phoenix (Chrono Boost)" or prefixed with "@", e.g. "Phoenix @Natural"
 */
export const extract_actions = (action_str: string, line_idx: number): StepAction => {
    log(`action str: '${action_str}'`)
    let res: StepAction = { actions: [] }
    if (action_str === "") {
        res.fails = { type: "error", reason: "Empty action string" }
        return res
    }
    // Catch all "xN" expressions, e.g. " x6", " x1"
    // All count expressions must be preceded with a whitespace:
    // "Zerglingx2" <= This will be ignored and treated as a single action
    const repeat_count_expr = /\bx(\d+)\b/
    const actions = action_str.split(",")
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        let base_action: StepActionBase = { action: "", count: 1 }
        const map_id: MappingId = `${line_idx}${i + BuildOrderBlockId.ACTION}`
        if (action.length === 0) {
            res.fails = { type: "warning", reason: "Action is empty. Did you missclick a comma?" }
        }
        // Handle count, e.g. "Zergling x4"
        const matches = action.match(repeat_count_expr)
        log(`matches: ${matches}`)
        if (!matches || !matches.index) {
            base_action.action = action
        } else {
            base_action.count = to_decimal(matches[1])
            // No need to include the repeat count next to action
            base_action.action = action.substring(0, matches.index - 1)
        }
        res.actions.push({ value: base_action, map_id })
    }
    return res
}

export const gen_classic_from_json = (steps: Step[]): Array<BuildOrderBlock[]> => {
    const lines: Array<BuildOrderBlock[]> = []
    steps.forEach((step: Step, line_idx: number) => {
        const supply = { id: `${line_idx}${BuildOrderBlockId.SUPPLY}`, content: `${step.supply.value}` }
        const minutes = { id: `${line_idx}${BuildOrderBlockId.MINUTES}`, content: `${step.minutes.value}` }
        const seconds = { id: `${line_idx}${BuildOrderBlockId.SECONDS}`, content: `${step.seconds.value}` }
        const actions: BuildOrderBlock[] = step.actions.map((action, action_idx) => {
            let count = ""
            if (action.value.count > 1) {
                // Format count: do not show if count===1
                count = ` (x${action.value.count})`
            }
            return { id: `${line_idx}${action_idx + BuildOrderBlockId.ACTION}`, content: `${action.value.action}${count}` }
        })
        log([supply, minutes, seconds, ...actions].toString())
        lines.push([supply, minutes, seconds, ...actions])
    })
    return lines
}
