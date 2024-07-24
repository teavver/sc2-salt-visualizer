import * as fs from "fs"
import { format_err } from "./utils"

type Filepath = string

export const format_classic_bo = (fpath: Filepath) => {
    try {
        // Remove additional spaces and tabs from classic BO notation
        const contents = fs.readFileSync(fpath, { encoding: "utf-8" })
        const formatted = contents.trim().split("\n").map((line: string) => {
            line = line.replace(/\s+/g, " ")
            // Trim additional whitespaces at first/last positions
            if (line.at(-1) === " ") line = line.slice(0, -1)
            if (line.at(0) === " ") line = line.substring(1)
            return line
        })
        return formatted
    } catch (err) {
        format_err((err as Error))
        return 1
    }
}

export const format_salt_bo = (fpath: Filepath) => {
}