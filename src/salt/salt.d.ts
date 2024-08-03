import { BuildOrderBlock, FailureData, Step } from "./types.js";
export interface SaltMetadata {
    version: number;
}
export declare class Salt {
    private readonly VERSION_CHAR_IDX;
    private readonly SECTION_DELIMITER;
    private readonly SUPPLY_SHIFT;
    private readonly CHUNK_LENGTH;
    private readonly ERR_CHAR;
    private readonly symbol_map;
    private readonly structures;
    private readonly units;
    private readonly morphs;
    private readonly upgrades;
    private readonly action_type_map;
    private readonly get_symbol_val;
    private readonly valid_bo_input;
    private readonly resolve_type_item_id;
    gen_salt_from_json: (steps: Step[]) => BuildOrderBlock[];
    get_bo_version: (bo: string) => number | FailureData;
    get_bo_title: (bo: string) => string | FailureData;
    get_bo_content: (bo: string) => string | FailureData;
    get_bo_chunks: (bo: string) => Array<string> | FailureData;
    decode_chunk: (chunk: string, l_idx: number) => Step;
}
