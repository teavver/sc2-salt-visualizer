import { FailureData, Step } from "./types.js";
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
export declare const parse_classic_bo: (bo: string[]) => Step[] | FailureData;
/**
 * This function assumes a formatted input (fmt.format_salt_bo)
 *
 * Parses user-input SALT BO to JSON-notation
 *
 * [Supply][Minutes][Seconds][Type][Item Id]]
 *
 */
export declare const parse_salt_bo: (bo: string) => Step[] | FailureData;
