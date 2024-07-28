import { FailureData } from "./types.js"
import { format_err } from "./utils.js"
import { create_logger } from "./utils.js"

const log = create_logger("fmt")

export const format_classic_bo = (bo_raw: string): Array<string> | FailureData => {
    try {
        // log(`bo_raw: '${bo_raw}'`)
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
    // Tmp = update with proper version support
    // log(`bo_raw: '${bo_raw}`)
    const bo = String.raw`${bo_raw}`.trimStart().trimEnd()
    if (bo.charAt(0) !== "$") {
        return { type: "warning", reason: "Are you using an outdated SALT build?" }
    }
    return bo
}