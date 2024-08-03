import { FailureData } from "./types.js"
import { format_err } from "./utils.js"
import { create_logger } from "./utils.js"

const log = create_logger("fmt", true)

export const format_classic_bo = (bo_raw: string): Array<string> | FailureData => {
    try {
        log(`bo_raw input: '${bo_raw}', length: (${bo_raw.length})`)
        const regex = /(\d{1,3})\s+(\d{1,2}:\d{2})\s+([^\d].*?)(?=\d{1,3}\s+\d{1,2}:\d{2}\s|$)/g
        let bo = bo_raw.replace(/\s+/g, " ").trim() // Clean the junk
        const lines = Array.from(bo.matchAll(regex), match => match[0].trimEnd())
        if (lines.length === 0) {
            return { type: "warning", reason: "Couldn't format build order." }
        }
        return lines
    } catch (err) {
        format_err(err)
        return { type: "error", reason: "Failed to format build order. Is your format correct? " }
    }
}

export const format_salt_bo = (bo_raw: string): string | FailureData => {
    log(`bo_raw input: '${bo_raw}', length: (${bo_raw.length})`)
    const bo = String.raw`${bo_raw}`.trimStart().trimEnd()
    return bo
}