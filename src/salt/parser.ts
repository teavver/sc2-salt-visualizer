import { SALT } from "./salt.js"
import { jstr, create_logger, extract_actions, format_err, to_decimal, is_err, halt_unexpected_err, extract_and_map } from "./utils.js"
import { FailureData, Step, StepBase } from "./types.js"

const log = create_logger("parser")

/**
 * *This function assumes a formatted input (fmt.format_classic_bo)*
 * 
 * Parses a Build Order to JSON-notation
 * 
 * Classic BO notation:
 * 
 * [Supply or Event*] [Minutes]:[Seconds] [Action(s)][Iteration count] [Comment]
 * 
 * *an [Event](https://liquipedia.net/starcraft2/index.php?title=Help:Reading_Build_Orders&action=edit&section=5) can sometimes be used instead of Supply.
 */
export const parse_classic_bo = (bo: string[]): Step[] | FailureData => {
    try {
        const steps: Step[] = []
        bo.forEach((line: string) => {

            const base_fails: FailureData[] = []
            const supply_end_idx = line.indexOf(" ")
            const supply = line.substring(0, supply_end_idx)
            const m_supply = { start: 0, end: supply_end_idx }
            if (supply === "") {
                base_fails.push({ type: "warning", reason: "Failed to get supply data. Check your build order for typos." })
            }
            const minutes_end_idx = line.indexOf(":", supply_end_idx + 1)
            const seconds_end_idx = line.indexOf(" ", minutes_end_idx + 1)
            const [minutes, m_minutes] = extract_and_map(line, supply_end_idx + 1, minutes_end_idx)
            const [seconds, m_seconds] = extract_and_map(line, minutes_end_idx + 1, seconds_end_idx)

            // const action_str = line.substring(time_end_idx + 1, line.length)
            const step_base: StepBase = {
                supply: { value: to_decimal(supply), mapping: m_supply },
                minutes: { value: to_decimal(minutes), mapping: m_minutes },
                seconds: { value: to_decimal(seconds), mapping: m_seconds },
            }
            const step_action = extract_actions("")
            if (base_fails.length > 0) {
                step_base.fails = base_fails
            }
            steps.push({ ...step_base, actions: step_action.actions })
        })
        return steps
    } catch (err) {
        format_err(err)
        return { type: "error", reason: `Unexpected error occurred. Err: ${(err as Error).message}` }
    }
}

export const parse_salt_bo = (bo: string): Step[] | FailureData => {
    try {
        const contents = String.raw`${bo}`
        const salt = new SALT()
        const title = salt.get_bo_title(contents)
        if (is_err(title)) return title as FailureData
        const ver = salt.get_bo_version(contents)
        if (is_err(ver)) return ver as FailureData
        const bo_content = salt.get_bo_content(contents)
        if (is_err(bo_content)) return bo_content as FailureData

        log(`salt ver "${ver}"`)
        log(`title "${title}"`)
        log(`bo "${bo_content}"`)

        const chunk_res = salt.get_bo_chunks(bo_content as string)
        if (is_err(chunk_res)) return chunk_res as FailureData
        return (chunk_res as string[]).map((chunk: string) => salt.decode_chunk(chunk))
    } catch (err) {
        format_err(err)
        return { type: "error", reason: `Unexpected error occurred. Err: ${(err as Error).message}` }
    }
}