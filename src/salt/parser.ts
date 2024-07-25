import * as fs from "fs"
import { extract_actions, format_err, to_decimal } from "./utils.js"
import { SALT } from "./salt.js"

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
    failed?: FailureData | FailureData[]
}

export interface StepBase {
    supply: number
    minutes: number
    seconds: number
    failed?: FailureData | FailureData[]
}

export interface Step extends StepBase, StepAction { }

/**
 * Classic BO notation:
 * 
 * [Supply or Event*] [Minutes]:[Seconds] [Action(s)][Iteration count] [Comment]
 * 
 * *an [Event](https://liquipedia.net/starcraft2/index.php?title=Help:Reading_Build_Orders&action=edit&section=5) can sometimes be used instead of Supply.
 */
export const parse_classic_bo = (fpath: Filepath) => {
    try {
        const contents = fs.readFileSync(fpath, { encoding: "utf-8" })
        const steps: Step[] = []
        contents.split("\n").map((line: string) => {
            line = line.replace(/\s+/g, " ") // Clean the junk
            line = line.trim()
            const supply_end_idx = line.indexOf(" ")
            const supply = line.substring(0, supply_end_idx)
            // console.log(`"${supply}"`)
            const time_end_idx = line.indexOf(" ", supply_end_idx + 1)
            const time = line.substring(supply_end_idx + 1, time_end_idx)
            const [minutes, seconds] = time.split(":")
            // console.log(`"${time}"`)
            // console.log(`"${line}"`)
            const action_str = line.substring(time_end_idx + 1, line.length)
            const step_base: StepBase = {
                supply: to_decimal(supply),
                minutes: to_decimal(minutes),
                seconds: to_decimal(seconds),
            }
            const step_action = extract_actions(action_str)
            steps.push({ ...step_base, actions: step_action.actions })
        })
        steps.forEach(s => {
            console.log(JSON.stringify(s, null, 4))
        })
    } catch (err) {
        format_err(err)
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

        console.log(`salt ver "${ver}"`)
        console.log(`title "${title}"`)
        console.log(`bo "${bo}"`)

        const chunks = salt.get_bo_chunks(bo as string)
        if ("reason" in chunks) {
            return format_err(chunks.reason)
        } else {
            chunks.forEach((chunk: string, idx: number) => {
                console.log(JSON.stringify(salt.decode_chunk(chunk), null, 4))
            })
        }
    } catch (err) {
        format_err(err)
    }
}

// parse_salt_bo("salt.bo")
parse_classic_bo("classic.bo")





