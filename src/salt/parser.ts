import { Salt } from "./salt.js"
import { create_logger, format_err, to_decimal, is_err, halt_unexpected_err, gen_map_id } from "./utils.js"
import { extract_actions } from "./classic.js"
import { FailureData, Step, StepBase, BuildOrderBlockId } from "./types.js"

const log = create_logger("parser", true)

/**
 * *This function assumes a formatted input (fmt.format_classic_bo)*
 * 
 * Parses user-input Classic BO to JSON-notation
 * 
 * Classic BO notation:
 * 
 * [Supply or Event*] [Minutes]:[Seconds] [Action(s)][Iteration count] [Comment]
 * 
 * *an [Event](https://liquipedia.net/starcraft2/index.php?title=Help:Reading_Build_Orders&action=edit&section=5)
 * can sometimes be used instead of Supply.
 */
export const parse_classic_bo = (bo: string[]): Step[] | FailureData => {
    try {
        const steps: Step[] = []
        bo.forEach((line: string, line_idx: number) => {
            const base_fails: FailureData[] = []
            const supply_end_idx = line.indexOf(" ")
            const supply = line.substring(0, supply_end_idx)
            if (supply === "") {
                base_fails.push({ type: "warning", reason: "Failed to get supply data. Check your build order for typos." })
            }
            const minutes_end_idx = line.indexOf(":", supply_end_idx + 1)
            const seconds_end_idx = line.indexOf(" ", minutes_end_idx + 1)
            const min = line.substring(supply_end_idx + 1, minutes_end_idx)
            const sec = line.substring(minutes_end_idx + 1, seconds_end_idx)
            const action_str = line.substring(seconds_end_idx + 1, line.length)
            const step_base: StepBase = {
                supply: { value: to_decimal(supply), map_id: gen_map_id(line_idx, BuildOrderBlockId.SUPPLY) },
                minutes: { value: to_decimal(min), map_id: gen_map_id(line_idx, BuildOrderBlockId.MINUTES) },
                seconds: { value: to_decimal(sec), map_id: gen_map_id(line_idx, BuildOrderBlockId.SECONDS) },
            }
            const step_action = extract_actions(action_str, line_idx)
            if (base_fails.length > 0) {
                step_base.fails = base_fails
            }
            steps.push({ ...step_base, actions: step_action.actions })
        })
        // Fixes BO order, but messes up mappings (ids).
        // return steps.sort((a, b) => `${a.minutes.value}${a.seconds.value}`.localeCompare(`${b.minutes.value}${b.seconds.value}`))
        // solution: store mappings in sep. obj. and ref w/ id prop
        return steps
    } catch (err) {
        format_err(err)
        return halt_unexpected_err(err)
    }
}

/**
 * This function assumes a formatted input (fmt.format_salt_bo)
 * 
 * Parses user-input SALT BO to JSON-notation
 * 
 * [Supply][Minutes][Seconds][Type][Item Id]]
 * 
 */
export const parse_salt_bo = (bo: string): Step[] | FailureData => {
    try {
        const salt = new Salt()
        const title = salt.get_bo_title(bo)
        if (is_err(title)) return title
        const ver = salt.get_bo_version(bo)
        if (is_err(ver)) return ver
        const bo_content = salt.get_bo_content(bo)
        if (is_err(bo_content)) return bo_content
        log(`salt ver "${ver}"`)
        log(`title "${title}"`)
        log(`bo "${bo_content}", length: ${bo_content.length}`)
        const chunk_res = salt.get_bo_chunks(bo_content)
        if (is_err(chunk_res)) return chunk_res
        return (chunk_res).map((chunk, idx) => salt.decode_chunk(chunk, idx))
    } catch (err) {
        format_err(err)
        return halt_unexpected_err(err)
    }
}
