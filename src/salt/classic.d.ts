import { StepAction, BuildOrderBlock, Step } from "./types.js";
/**
 * Extracts actions from an action string
 * TODO: Handle comments: Wrapped in parenthesis, e.g. "Phoenix (Chrono Boost)" or prefixed with "@", e.g. "Phoenix @Natural"
 */
export declare const extract_actions: (action_str: string, line_idx: number) => StepAction;
export declare const gen_classic_from_json: (steps: Step[]) => Array<BuildOrderBlock[]>;
