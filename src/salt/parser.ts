import * as fs from "fs"
import { SALT } from "./salt.js"
import { jstr, create_logger, extract_actions, format_err, to_decimal } from "./utils.js"
import { FailureData, Filepath, Step, StepBase } from "./types.js"

const log = create_logger("parser")

/**
 * *This function assumes a formatted input (fmt.format_classic_bo)*
 * 
 * Classic BO notation:
 * 
 * [Supply or Event*] [Minutes]:[Seconds] [Action(s)][Iteration count] [Comment]
 * 
 * *an [Event](https://liquipedia.net/starcraft2/index.php?title=Help:Reading_Build_Orders&action=edit&section=5) can sometimes be used instead of Supply.
 */
export const parse_classic_bo = (bo: string) => {
    try {
        const steps: Step[] = []
        bo.split("\n").map((line: string) => {
            const base_fails: FailureData[] = []
            const supply_end_idx = line.indexOf(" ")
            const supply = line.substring(0, supply_end_idx)
            if (supply === "") {
                base_fails.push({ type: "warning", reason: "Failed to get supply data. Check your build order for typos." })
            }
            // log(`"${supply}"`)
            const time_end_idx = line.indexOf(" ", supply_end_idx + 1)
            const time = line.substring(supply_end_idx + 1, time_end_idx)
            const [minutes, seconds] = time.split(":")
            // log(`"${time}"`)
            // log(`"${line}"`)
            const action_str = line.substring(time_end_idx + 1, line.length)
            const step_base: StepBase = {
                supply: to_decimal(supply),
                minutes: to_decimal(minutes),
                seconds: to_decimal(seconds),
            }
            const step_action = extract_actions(action_str)
            if (base_fails.length > 0) {
                step_base.fails = base_fails
            }
            steps.push({ ...step_base, actions: step_action.actions })
        })
        steps.forEach((step: Step) => {
            log(jstr(step))
        })
        return steps
    } catch (err) {
        format_err(err)
        return (err as Error).message
    }
}

export const parse_salt_bo = (fpath: Filepath) => {
    try {
        const file = fs.readFileSync(fpath, { encoding: "utf-8" })
        const contents = String.raw`${file}`
        const salt = new SALT()
        const title = salt.get_bo_title(contents)
        const ver = salt.get_bo_version(contents)
        const bo = salt.get_bo_content(contents)

        log(`salt ver "${ver}"`)
        log(`title "${title}"`)
        log(`bo "${bo}"`)

        const chunks = salt.get_bo_chunks(bo as string)
        if ("reason" in chunks) {
            return format_err(chunks.reason)
        } else {
            chunks.forEach((chunk: string) => {
                log(jstr(salt.decode_chunk(chunk)))
            })
        }
    } catch (err) {
        format_err(err)
    }
}